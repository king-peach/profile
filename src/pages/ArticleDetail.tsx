import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ThemeProvider, useTheme } from "../components/ThemeContext";
import Header from "../components/Header";
import PrismBackground from "../components/ui/PrismBackground";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import SEO from "../components/SEO";
import { format } from "date-fns";
import { truncateDescription, DEFAULT_OG_IMAGE, SITE_URL } from "../config/seo";
import { FiThumbsUp, FiShare2, FiClock, FiEye, FiCalendar, FiMessageCircle, FiHome, FiCopy, FiCheck, FiTrash2, FiEdit2, FiCornerDownRight, FiX, FiUser } from "react-icons/fi";
import {
  type Comment,
  type UserInfo,
  getCommentsByArticle,
  addComment,
  deleteComment,
  toggleCommentLike,
  getCurrentUser,
  updateCurrentUser,
  formatTimeAgo,
} from "../lib/commentDB";
import RandomAvatar from "../components/ui/RandomAvatar";

// Notion 文章类型定义
type NotionRichText = { plain_text?: string }[];
type NotionProperty = {
  type: string;
  title?: NotionRichText;
  rich_text?: NotionRichText;
  date?: { start?: string };
  multi_select?: { name?: string; color?: string }[];
  select?: { name?: string; color?: string };
};
type NotionPage = {
  object: "page";
  id: string;
  url?: string;
  urlSlug?: string;
  created_time?: string;
  last_edited_time?: string;
  cover?: { type: string; external?: { url: string }; file?: { url: string } };
  properties?: Record<string, NotionProperty>;
  content_markdown?: string;
};

// 文章目录项类型
type TocItem = {
  id: string;
  text: string;
  level: number;
  index: number;
};

// 辅助函数
function extractTitle(p: NotionPage): string {
  const props = p.properties || {};
  for (const key of Object.keys(props)) {
    const prop = props[key];
    if (prop?.type === "title" && Array.isArray(prop.title) && prop.title.length > 0) {
      return prop.title.map((t) => t.plain_text).join("") || "Untitled";
    }
  }
  return "Untitled";
}

function extractRichText(prop?: NotionProperty): string {
  if (!prop || prop.type !== "rich_text") return "";
  return prop.rich_text?.map((t) => t.plain_text).join("") || "";
}

function extractDate(p: NotionPage): string | null {
  const props = p.properties || {};
  const dateProp = props["PublishDate"] || props["发布日期"] || props["日期"] || props["Date"];
  if (dateProp?.type === "date" && dateProp.date?.start) return dateProp.date.start;
  return p.last_edited_time || p.created_time || null;
}

function extractCover(p: NotionPage): string | null {
  if (!p.cover) return null;
  if (p.cover.type === "external") return p.cover.external?.url || null;
  if (p.cover.type === "file") return p.cover.file?.url || null;
  return null;
}

function extractSummary(p: NotionPage): string {
  const props = p.properties || {};
  const summaryProp = props["summary"] || props["Summary"] || props["summaryEn"] || props["摘要"];
  return summaryProp ? extractRichText(summaryProp) : "";
}

function extractTags(p: NotionPage): { name: string; color: string }[] {
  const props = p.properties || {};
  const tagProp = props["标签"] || props["Tags"] || props["tags"] || props["类型"] || props["Type"];
  if (tagProp?.type === "multi_select" && tagProp.multi_select) {
    return tagProp.multi_select.map((t) => ({ name: t.name || "", color: t.color || "gray" }));
  }
  if (tagProp?.type === "select" && tagProp.select) {
    return [{ name: tagProp.select.name || "", color: tagProp.select.color || "gray" }];
  }
  return [];
}

// 清理 Markdown 格式标记，获取纯文本
function stripMarkdownFormat(text: string): string {
  return text
    // 移除粗体/斜体标记
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // 移除行内代码
    .replace(/`([^`]+)`/g, "$1")
    // 移除链接，保留文本
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // 移除图片
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    // 移除 HTML 标签
    .replace(/<[^>]+>/g, "")
    .trim();
}

// 从 Markdown 提取目录
function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const toc: TocItem[] = [];
  const idCount: Record<string, number> = {};
  let index = 0;
  
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      // 清理 markdown 格式，获取纯文本（与渲染后的文本一致）
      const cleanText = stripMarkdownFormat(rawText);
      // 用于显示的文本也应该是清理后的
      const displayText = cleanText;
      const baseId = cleanText.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, "-").replace(/^-|-$/g, "");
      idCount[baseId] = (idCount[baseId] || 0) + 1;
      const id = idCount[baseId] > 1 ? `${baseId}-${idCount[baseId]}` : baseId;
      index++;
      toc.push({ id, text: displayText, level, index });
    }
  }
  return toc;
}

// 标签颜色映射
const tagColors: Record<string, { bg: string; text: string }> = {
  default: { bg: "#f3f4f6", text: "#374151" },
  gray: { bg: "#f3f4f6", text: "#374151" },
  brown: { bg: "#fef3c7", text: "#92400e" },
  orange: { bg: "#ffedd5", text: "#c2410c" },
  yellow: { bg: "#fef9c3", text: "#a16207" },
  green: { bg: "#dcfce7", text: "#166534" },
  blue: { bg: "#dbeafe", text: "#1e40af" },
  purple: { bg: "#f3e8ff", text: "#7c3aed" },
  pink: { bg: "#fce7f3", text: "#be185d" },
  red: { bg: "#fee2e2", text: "#dc2626" },
};

/** 根据 slug 从静态 JSON 加载 Notion 文章详情 */
function useNotionArticleBySlug(slug: string | undefined) {
  const [article, setArticle] = useState<NotionPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NotionPage[]>([]);

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      setError(null);
      setArticle(null);
      if (!slug) {
        setError("缺少文章标识");
        setLoading(false);
        return;
      }
      try {
        const decodedSlug = decodeURIComponent(slug);
        const [indexRes, contentRes] = await Promise.all([
          fetch("/data/articles-index.json"),
          fetch("/data/articles-content.json"),
        ]);
        if (!indexRes.ok) throw new Error("加载文章索引失败");
        if (!contentRes.ok) throw new Error("加载文章内容失败");
        const indexJson = await indexRes.json();
        const contentJson = await contentRes.json();
        const slugToId: Record<string, string> = indexJson.slugToId || {};
        const articles: Record<string, NotionPage> = contentJson.articles || {};
        const pageId = slugToId[decodedSlug];
        if (!pageId) throw new Error("文章不存在");
        const item = articles[pageId];
        if (!item) throw new Error("文章内容不存在");
        if (active) {
          setArticle(item);
          const otherArticles = Object.values(articles).filter((a) => a.id !== pageId);
          const shuffled = otherArticles.sort(() => 0.5 - Math.random());
          setRelatedArticles(shuffled.slice(0, 3));
        }
      } catch (e: any) {
        if (active) setError(e?.message || "加载失败");
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => { active = false; };
  }, [slug]);

  return { article, loading, error, relatedArticles };
}

// 首页按钮组件
function HomeButton() {
  const { t } = useTranslation();
  const { dark, accent } = useTheme();
  
  return (
    <a
      href="/"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
      style={{
        backgroundColor: dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)",
        color: dark ? "#fff" : "#374151",
      }}
    >
      <FiHome className="w-4 h-4" />
      {t("articles.home", { defaultValue: "首页" })}
    </a>
  );
}

// 文章目录组件
function TableOfContents({ toc, activeId }: { toc: TocItem[]; activeId: string }) {
  const { dark, accent } = useTheme();
  const { t } = useTranslation();
  const tocRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  
  // 点击目录项时平滑滚动到对应章节
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100; // 顶部偏移量，避免被固定头部遮挡
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      // 更新 URL hash（不触发跳转）
      history.pushState(null, "", `#${id}`);
    }
  };

  // 当活动项变化时，确保目录中的活动项可见
  useEffect(() => {
    if (activeId && tocRef.current) {
      const activeItem = itemRefs.current.get(activeId);
      if (activeItem) {
        const container = tocRef.current;
        const itemTop = activeItem.offsetTop;
        const itemBottom = itemTop + activeItem.offsetHeight;
        const containerScrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        
        // 如果活动项不在可视区域内，滚动目录
        if (itemTop < containerScrollTop || itemBottom > containerScrollTop + containerHeight) {
          activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [activeId]);
  
  if (toc.length === 0) return null;

  return (
    <div
      className="sticky top-24 p-5 rounded-xl"
      style={{
        backgroundColor: dark ? "rgba(30,30,50,0.8)" : "#fff",
        boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.08)",
        border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}`,
      }}
    >
      <h3 className={`text-sm font-bold mb-4 ${dark ? "text-white" : "text-gray-800"}`}>
        {t("articleDetail.toc", { defaultValue: "文章目录" })}
      </h3>
      <ul 
        ref={tocRef}
        className="space-y-1 text-sm max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
      >
        {toc.map((item) => {
          const isActive = activeId === item.id;
          const indent = (item.level - 1) * 12;
          
          return (
            <li 
              key={item.id}
              ref={(el) => {
                if (el) itemRefs.current.set(item.id, el);
                else itemRefs.current.delete(item.id);
              }}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={`block py-1.5 pl-3 border-l-2 transition-all duration-200 hover:text-current ${
                  isActive ? "font-medium" : ""
                }`}
                style={{
                  marginLeft: indent,
                  borderColor: isActive ? accent : "transparent",
                  color: isActive ? accent : dark ? "rgba(255,255,255,0.6)" : "#6b7280",
                  backgroundColor: isActive ? (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)") : "transparent",
                }}
              >
                {item.level <= 2 && `${item.index}. `}{item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// 文章头部组件（带渐变背景）
function ArticleHeader({ article }: { article: NotionPage }) {
  const { dark, baseText, accent } = useTheme();
  const { t, i18n } = useTranslation();
  const isEn = i18n.language.startsWith("en");

  const title = extractTitle(article);
  const tags = extractTags(article);
  const date = extractDate(article);
  const formattedDate = useMemo(() => {
    if (!date) return "";
    try { return format(new Date(date), "yyyy-MM-dd"); } catch { return date; }
  }, [date]);

  const readingTime = useMemo(() => {
    const content = article.content_markdown || "";
    // 移除 markdown 格式，只计算纯文本字数
    const plainText = content
      .replace(/```[\s\S]*?```/g, "") // 移除代码块
      .replace(/`[^`]+`/g, "") // 移除行内代码
      .replace(/!\[.*?\]\(.*?\)/g, "") // 移除图片
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 链接只保留文本
      .replace(/#{1,6}\s*/g, "") // 移除标题标记
      .replace(/[*_~]+/g, "") // 移除粗体/斜体/删除线标记
      .replace(/>\s*/g, "") // 移除引用标记
      .replace(/[-*+]\s*/g, "") // 移除列表标记
      .replace(/\d+\.\s*/g, "") // 移除有序列表标记
      .replace(/\|/g, "") // 移除表格分隔符
      .replace(/\s+/g, ""); // 移除空白字符
    
    // 每秒 6 个字，每分钟 360 个字
    const wordsPerMinute = 6 * 60; // 360
    const minutes = Math.ceil(plainText.length / wordsPerMinute);
    return Math.max(1, minutes); // 至少 1 分钟
  }, [article]);

  const viewCount = useMemo(() => Math.floor(Math.random() * 2000 + 500), []);

  return (
    <section className="relative overflow-hidden">
      {/* 渐变背景 */}
      <PrismBackground
        animationType="rotate"
        timeScale={0.2}
        colorFrequency={0.8}
        glow={1.0}
        bloom={1.0}
        noise={0.1}
        baseHue={280}
        hueRange={80}
        satBase={60}
        satRange={30}
        lumBase={70}
        lumRange={15}
        suspendWhenOffscreen
        className="z-0 opacity-70"
      />
      
      {/* Header */}
      <div className="relative z-10">
        <Header
          showNav={false}
          showLanguage={true}
          showTheme={true}
        />
      </div>

      {/* 文章信息 */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 pt-4 pb-12">
        {/* 标签 */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, idx) => {
              const colors = tagColors[tag.color] || tagColors.default;
              // 使用国际化翻译标签名称，如果没有翻译则使用原名称
              const translatedName = t(`tags.${tag.name}`, { defaultValue: tag.name });
              return (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {translatedName}
                </span>
              );
            })}
          </div>
        )}

        {/* 标题 */}
        <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-6 ${dark ? "text-white" : "text-gray-900"}`}>
          {title}
        </h1>

        {/* 作者和元信息 */}
        <div className={`flex flex-wrap items-center gap-2 text-sm ${dark ? "text-white/70" : "text-gray-600"}`}>
          {/* 作者 */}
          <div className="flex items-center gap-2">
            <img src="/avatar01.jpg" alt="Author" className="w-7 h-7 rounded-full object-cover border-2 border-white/50" />
            <span className="font-medium">{isEn ? "Eric Wang" : "王涛"}</span>
          </div>
          <span className="mx-1">·</span>
          {/* 日期 */}
          <div className="flex items-center gap-1">
            <FiCalendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          <span className="mx-1">·</span>
          {/* 阅读时间 */}
          <div className="flex items-center gap-1">
            <FiClock className="w-3.5 h-3.5" />
            <span>{readingTime} {t("articleDetail.minRead", { defaultValue: "分钟阅读" })}</span>
          </div>
          <span className="mx-1">·</span>
          {/* 浏览量 */}
          <div className="flex items-center gap-1">
            <FiEye className="w-3.5 h-3.5" />
            <span>{viewCount.toLocaleString()} {t("articleDetail.views", { defaultValue: "次浏览" })}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 图片组件 - 处理加载状态和失败情况 */
function SafeImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const { dark } = useTheme();
  const { t } = useTranslation();
  
  // 处理不同来源的图片 URL
  const processImageUrl = (url: string | undefined): string => {
    if (!url) return "";
    
    // 如果是 Notion S3 签名 URL 且已过期，尝试使用代理或显示占位
    // 微信图片等外部图片保持原样，通过 referrerPolicy 处理防盗链
    return url;
  };
  
  const processedSrc = processImageUrl(src);
  
  if (!processedSrc) {
    return (
      <div className={`my-6 p-8 rounded-xl text-center ${dark ? "bg-zinc-800" : "bg-gray-100"}`}>
        <span className={`text-sm ${dark ? "text-white/50" : "text-gray-500"}`}>
          {alt || t("articleDetail.imageNotAvailable", { defaultValue: "图片不可用" })}
        </span>
      </div>
    );
  }
  
  return (
    <figure className="my-6">
      {/* 加载状态占位 */}
      {status === "loading" && (
        <div className={`w-full h-48 rounded-xl animate-pulse flex items-center justify-center ${dark ? "bg-zinc-800" : "bg-gray-200"}`}>
          <svg className={`w-8 h-8 ${dark ? "text-zinc-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {/* 错误状态占位 */}
      {status === "error" && (
        <div className={`w-full p-8 rounded-xl text-center ${dark ? "bg-zinc-800 border border-zinc-700" : "bg-gray-100 border border-gray-200"}`}>
          <svg className={`w-12 h-12 mx-auto mb-3 ${dark ? "text-zinc-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className={`text-sm ${dark ? "text-white/50" : "text-gray-500"}`}>
            {t("articleDetail.imageLoadFailed", { defaultValue: "图片加载失败" })}
          </p>
          {alt && (
            <p className={`text-xs mt-1 ${dark ? "text-white/30" : "text-gray-400"}`}>{alt}</p>
          )}
          {/* 提供原链接供用户点击查看 */}
          <a 
            href={processedSrc} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`inline-block mt-3 text-xs px-3 py-1.5 rounded-lg transition-colors ${dark ? "bg-zinc-700 text-white/70 hover:bg-zinc-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
          >
            {t("articleDetail.viewOriginalImage", { defaultValue: "查看原图" })}
          </a>
        </div>
      )}
      
      {/* 实际图片 */}
      <img
        src={processedSrc}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={`rounded-xl shadow-lg max-w-full h-auto mx-auto transition-opacity duration-300 ${
          status === "loaded" ? "opacity-100" : "opacity-0 absolute"
        }`}
        style={{ maxHeight: "600px", objectFit: "contain" }}
        {...props}
      />
      
      {/* 图片说明 */}
      {alt && status === "loaded" && (
        <figcaption className={`text-center text-sm mt-3 ${dark ? "text-white/50" : "text-gray-500"}`}>
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

// 代码块组件（带复制功能和语法高亮）
function CodeBlock({ language, children }: { language: string; children: string }) {
  const { dark } = useTheme();
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // 语言映射
  const langMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    jsx: "jsx",
    tsx: "tsx",
    py: "python",
    rb: "ruby",
    sh: "bash",
    shell: "bash",
    yml: "yaml",
    md: "markdown",
  };
  const normalizedLang = langMap[language] || language || "text";

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden">
      {/* 语言标签 + 复制按钮 */}
      <div className={`flex items-center justify-between px-4 py-2 text-xs ${dark ? "bg-gray-800" : "bg-gray-800"}`}>
        <span className="text-gray-400 uppercase font-mono">{normalizedLang}</span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${
            copied ? "text-green-400" : "text-gray-400 hover:text-white"
          }`}
        >
          {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
          <span>{copied ? "已复制" : "复制"}</span>
        </button>
      </div>
      {/* 代码区域 */}
      <SyntaxHighlighter
        language={normalizedLang}
        style={oneDark}
        showLineNumbers
        lineNumberStyle={{ 
          color: dark ? "#4b5563" : "#6b7280",
          minWidth: "2.5em",
          paddingRight: "1em",
          userSelect: "none",
        }}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          lineHeight: "1.5",
          background: dark ? "#1e1e2e" : "#1e293b",
          borderRadius: 0,
        }}
        codeTagProps={{
          style: { fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace" }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// 过滤 Notion 特有格式
function cleanNotionContent(content: string): string {
  return content
    // 移除 Notion 链接格式 [[链接]]
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    // 移除 Notion @mention 格式
    .replace(/@\[([^\]]+)\]\([^)]+\)/g, "$1")
    // 移除 Notion 日期格式 @日期
    .replace(/@(\d{4}-\d{2}-\d{2})/g, "$1")
    // 移除 Notion 数据库链接
    .replace(/\[([^\]]+)\]\(\/[a-f0-9-]+\)/g, "$1")
    // 清理多余的空行
    .replace(/\n{3,}/g, "\n\n")
    // 移除 Notion callout 的 emoji 前缀
    .replace(/^(>\s*)([📌💡⚠️❗🔴🟡🟢📝✅❌])\s*/gm, "$1")
    // 清理 Notion toggle 格式
    .replace(/^<details>\s*<summary>(.+)<\/summary>/gm, "**$1**")
    .replace(/<\/details>/g, "")
    // 移除空的链接
    .replace(/\[([^\]]*)\]\(\s*\)/g, "$1")
    // 修复可能的 HTML 实体
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

// 递归提取 React children 中的纯文本
function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (!children) return "";
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (React.isValidElement(children) && children.props?.children) {
    return extractTextFromChildren(children.props.children);
  }
  return "";
}

// Markdown 内容组件
function MarkdownContent({ content }: { content: string }) {
  const { dark, accent } = useTheme();
  const idCount = useRef<Record<string, number>>({});

  // 清理 Notion 格式
  const cleanedContent = useMemo(() => cleanNotionContent(content), [content]);

  const generateId = (children: React.ReactNode) => {
    // 提取纯文本
    const text = extractTextFromChildren(children);
    const baseId = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, "-").replace(/^-|-$/g, "");
    idCount.current[baseId] = (idCount.current[baseId] || 0) + 1;
    return idCount.current[baseId] > 1 ? `${baseId}-${idCount.current[baseId]}` : baseId;
  };

  useEffect(() => { idCount.current = {}; }, [cleanedContent]);

  // 列表项颜色
  const listColors = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ec4899"];

  return (
    <article className={`markdown-content ${dark ? "dark" : ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          img: ({ src, alt }) => <SafeImage src={src} alt={alt} />,
          h1: ({ children }) => {
            const id = generateId(children);
            return (
              <h1 id={id} className={`scroll-mt-24 text-2xl font-bold mt-10 mb-4 pb-3 border-b ${dark ? "border-gray-700 text-white" : "border-gray-200 text-gray-900"}`}>
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const id = generateId(children);
            return (
              <h2 id={id} className={`scroll-mt-24 text-xl font-bold mt-8 mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = generateId(children);
            return (
              <h3 id={id} className={`scroll-mt-24 text-lg font-semibold mt-6 mb-3 ${dark ? "text-white/90" : "text-gray-800"}`}>
                {children}
              </h3>
            );
          },
          h4: ({ children }) => {
            const id = generateId(children);
            return (
              <h4 id={id} className={`scroll-mt-24 text-base font-semibold mt-5 mb-2 ${dark ? "text-white/80" : "text-gray-700"}`}>
                {children}
              </h4>
            );
          },
          p: ({ children }) => (
            <p className={`my-4 leading-7 ${dark ? "text-gray-300" : "text-gray-700"}`}>
              {children}
            </p>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            // 代码块
            if (match) {
              return <CodeBlock language={match[1]}>{String(children)}</CodeBlock>;
            }
            // 行内代码
            return (
              <code
                className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                  dark ? "bg-gray-800 text-pink-400" : "bg-red-50 text-red-600"
                }`}
                style={{ fontFamily: "'Fira Code', Consolas, monospace" }}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => {
            // 如果子元素是 CodeBlock，直接返回
            if (React.isValidElement(children) && (children.type as any) === CodeBlock) {
              return <>{children}</>;
            }
            // 否则返回简单的 pre
            return <>{children}</>;
          },
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{ color: accent }}
              className="hover:underline font-medium transition-colors"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => {
            const items = React.Children.toArray(children);
            return (
              <ul className="my-4 space-y-2 pl-1">
                {items.map((child, idx) => {
                  if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                      key: idx,
                      'data-bullet-color': listColors[idx % listColors.length],
                    });
                  }
                  return child;
                })}
              </ul>
            );
          },
          ol: ({ children }) => (
            <ol className={`my-4 space-y-2 list-decimal pl-6 marker:font-semibold ${dark ? "text-gray-300 marker:text-gray-500" : "text-gray-700 marker:text-gray-400"}`}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => {
            const bulletColor = (props as any)['data-bullet-color'] || accent;
            const isOrdered = !(props as any)['data-bullet-color'];
            
            if (isOrdered) {
              return (
                <li className={`leading-7 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  {children}
                </li>
              );
            }
            
            return (
              <li className={`leading-7 flex items-start gap-3 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                <span
                  className="inline-block w-2 h-2 rounded-full mt-2.5 flex-shrink-0"
                  style={{ backgroundColor: bulletColor }}
                />
                <span className="flex-1">{children}</span>
              </li>
            );
          },
          blockquote: ({ children }) => (
            <blockquote
              className={`border-l-4 pl-4 py-2 my-6 ${
                dark ? "border-blue-500 bg-blue-500/10 text-gray-300" : "border-blue-400 bg-blue-50 text-gray-700"
              }`}
              style={{ borderRadius: "0 8px 8px 0" }}
            >
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>{children}</strong>
          ),
          em: ({ children }) => (
            <em className={`italic ${dark ? "text-gray-300" : "text-gray-600"}`}>{children}</em>
          ),
          hr: () => (
            <hr className={`my-8 border-t ${dark ? "border-gray-700" : "border-gray-200"}`} />
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className={`min-w-full border-collapse text-sm ${dark ? "text-gray-300" : "text-gray-700"}`}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={dark ? "bg-gray-800" : "bg-gray-100"}>{children}</thead>
          ),
          th: ({ children }) => (
            <th className={`px-4 py-3 text-left font-semibold border ${dark ? "border-gray-700" : "border-gray-200"}`}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`px-4 py-3 border ${dark ? "border-gray-700" : "border-gray-200"}`}>
              {children}
            </td>
          ),
          // 任务列表
          input: ({ type, checked }) => {
            if (type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className={`mr-2 w-4 h-4 rounded ${
                    checked ? "accent-current" : ""
                  }`}
                  style={{ accentColor: accent }}
                />
              );
            }
            return <input type={type} />;
          },
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </article>
  );
}

// 文章底部操作区
function ArticleFooter({ article }: { article: NotionPage }) {
  const { dark, accent } = useTheme();
  const { t } = useTranslation();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50 + 10));

  const lastEdited = useMemo(() => {
    if (!article.last_edited_time) return "";
    try { return format(new Date(article.last_edited_time), "yyyy-MM-dd"); } catch { return ""; }
  }, [article]);

  const handleLike = () => {
    setLikeCount((c) => liked ? c - 1 : c + 1);
    setLiked(!liked);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: extractTitle(article), url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      alert(t("articleDetail.copied", { defaultValue: "链接已复制" }));
    }
  };

  return (
    <div className={`py-8 border-t ${dark ? "border-gray-700" : "border-gray-200"}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* 点赞按钮 */}
          <button
            onClick={handleLike}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: liked ? accent : (dark ? "rgba(255,255,255,0.1)" : "#f3f4f6"),
              color: liked ? "#fff" : (dark ? "#fff" : "#374151"),
            }}
          >
            <FiThumbsUp className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            {t("articleDetail.like", { defaultValue: "赞同" })} {likeCount}
          </button>

          {/* 分享按钮 */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${
              dark ? "bg-white/10 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            <FiShare2 className="w-4 h-4" />
            {t("articleDetail.share", { defaultValue: "分享" })}
          </button>
        </div>

        {/* 最后编辑时间 */}
        {lastEdited && (
          <span className={`text-sm ${dark ? "text-white/50" : "text-gray-500"}`}>
            {t("articleDetail.lastEdited", { defaultValue: "最后编辑于" })} {lastEdited}
          </span>
        )}
      </div>
    </div>
  );
}

// 推荐阅读组件
function RelatedArticles({ articles }: { articles: NotionPage[] }) {
  const { dark, accent } = useTheme();
  const { t } = useTranslation();

  if (articles.length === 0) return null;

  return (
    <section className={`py-12 ${dark ? "bg-zinc-800/50" : "bg-gray-50"}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <h2 className={`text-xl font-bold mb-6 ${dark ? "text-white" : "text-gray-900"}`}>
          {t("articleDetail.relatedArticles", { defaultValue: "推荐阅读" })}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article) => {
            const title = extractTitle(article);
            const tags = extractTags(article);
            const summary = extractSummary(article);
            const slug = article.urlSlug || article.id;

            return (
              <a
                key={article.id}
                href={`/article/${encodeURIComponent(slug)}`}
                className={`block p-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  dark ? "bg-zinc-800" : "bg-white"
                }`}
                style={{ border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}` }}
              >
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tags.slice(0, 2).map((tag, idx) => {
                      const colors = tagColors[tag.color] || tagColors.default;
                      const translatedName = t(`tags.${tag.name}`, { defaultValue: tag.name });
                      return (
                        <span key={idx} className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: colors.bg, color: colors.text }}>
                          {translatedName}
                        </span>
                      );
                    })}
                  </div>
                )}
                <h3 className={`font-semibold mb-2 line-clamp-2 ${dark ? "text-white" : "text-gray-900"}`}>{title}</h3>
                {summary && <p className={`text-sm line-clamp-2 mb-3 ${dark ? "text-white/60" : "text-gray-600"}`}>{summary}</p>}
                <span className="text-sm font-medium" style={{ color: accent }}>
                  {t("articleDetail.readMore", { defaultValue: "了解更多" })} →
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// 单条评论组件
function CommentItem({
  comment,
  currentUser,
  onLike,
  onReply,
  onDelete,
  onEdit,
  replies,
  locale,
}: {
  comment: Comment;
  currentUser: UserInfo | null;
  onLike: (id: string) => void;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  replies: Comment[];
  locale: string;
}) {
  const { dark, accent } = useTheme();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);

  const isOwner = currentUser?.id === comment.userId;
  const hasLiked = currentUser ? (comment.likedBy || []).includes(currentUser.id) : false;

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex gap-3">
      <RandomAvatar seed={comment.userId || comment.userName} size={40} className="flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`font-medium text-sm ${dark ? "text-white" : "text-gray-900"}`}>
            {comment.userName}
          </span>
          {isOwner && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ backgroundColor: `${accent}20`, color: accent }}
            >
              {t("articleDetail.you", { defaultValue: "我" })}
            </span>
          )}
          <span className={`text-xs ${dark ? "text-white/50" : "text-gray-500"}`}>
            {formatTimeAgo(comment.createdAt, locale)}
          </span>
          {comment.updatedAt > comment.createdAt + 1000 && (
            <span className={`text-xs ${dark ? "text-white/40" : "text-gray-400"}`}>
              ({t("articleDetail.edited", { defaultValue: "已编辑" })})
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              ref={(el) => {
                if (el) {
                  el.focus();
                  // 将光标移动到文字末尾
                  el.setSelectionRange(el.value.length, el.value.length);
                }
              }}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm resize-none ${
                dark ? "bg-zinc-800 text-white border-zinc-700" : "bg-gray-50 text-gray-900 border-gray-200"
              } border focus:outline-none focus:ring-2`}
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                style={{ backgroundColor: accent }}
              >
                {t("articleDetail.save", { defaultValue: "保存" })}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  dark ? "bg-zinc-700 text-white/80" : "bg-gray-200 text-gray-700"
                }`}
              >
                {t("articleDetail.cancel", { defaultValue: "取消" })}
              </button>
            </div>
          </div>
        ) : (
          <p className={`text-sm leading-relaxed ${dark ? "text-white/80" : "text-gray-700"}`}>
            {comment.content}
          </p>
        )}

        {!isEditing && (
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                hasLiked
                  ? ""
                  : dark
                  ? "text-white/50 hover:text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={hasLiked ? { color: accent } : undefined}
            >
              <FiThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? "fill-current" : ""}`} />
              {comment.likes > 0 && comment.likes}
            </button>
            <button
              onClick={() => onReply(comment.id)}
              className={`flex items-center gap-1 text-xs ${
                dark ? "text-white/50 hover:text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiCornerDownRight className="w-3.5 h-3.5" />
              {t("articleDetail.reply", { defaultValue: "回复" })}
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-1 text-xs ${
                    dark ? "text-white/50 hover:text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                  {t("articleDetail.edit", { defaultValue: "编辑" })}
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className={`flex items-center gap-1 text-xs ${
                    dark ? "text-red-400/70 hover:text-red-400" : "text-red-500/70 hover:text-red-500"
                  }`}
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  {t("articleDetail.delete", { defaultValue: "删除" })}
                </button>
              </>
            )}
          </div>
        )}

        {/* 回复列表 */}
        {replies.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className={`text-xs mb-3 ${dark ? "text-white/60" : "text-gray-500"}`}
            >
              {showReplies ? "▼" : "▶"} {replies.length} {t("articleDetail.replies", { defaultValue: "条回复" })}
            </button>
            {showReplies && (
              <div className="space-y-4 pl-4 border-l-2" style={{ borderColor: dark ? "#3f3f46" : "#e5e7eb" }}>
                {replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUser={currentUser}
                    onLike={onLike}
                    onReply={onReply}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    replies={[]}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 评论区组件
function CommentsSection({ articleId }: { articleId: string }) {
  const { dark, accent } = useTheme();
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserName, setEditingUserName] = useState("");

  // 加载评论和用户信息
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [commentsData, userData] = await Promise.all([
        getCommentsByArticle(articleId),
        getCurrentUser(),
      ]);
      setComments(commentsData);
      setCurrentUser(userData);
    } catch (error) {
      console.error("加载评论失败:", error);
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 提交新评论
  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await addComment(articleId, newComment);
      setNewComment("");
      await loadData();
    } catch (error) {
      console.error("发表评论失败:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 提交回复
  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await addComment(articleId, replyContent, parentId);
      setReplyContent("");
      setReplyingTo(null);
      await loadData();
    } catch (error) {
      console.error("回复失败:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 点赞
  const handleLike = async (commentId: string) => {
    try {
      await toggleCommentLike(commentId);
      await loadData();
    } catch (error) {
      console.error("点赞失败:", error);
    }
  };

  // 删除评论
  const handleDelete = async (commentId: string) => {
    if (!confirm(t("articleDetail.confirmDelete", { defaultValue: "确定要删除这条评论吗？" }))) {
      return;
    }

    try {
      await deleteComment(commentId);
      await loadData();
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  // 编辑评论
  const handleEdit = async (commentId: string, content: string) => {
    try {
      const { updateComment } = await import("../lib/commentDB");
      await updateComment(commentId, content);
      await loadData();
    } catch (error) {
      console.error("编辑失败:", error);
    }
  };

  // 更新用户名
  const handleUpdateUserName = async () => {
    if (!editingUserName.trim()) return;

    try {
      const updated = await updateCurrentUser({ name: editingUserName.trim() });
      setCurrentUser(updated);
      setShowUserModal(false);
    } catch (error) {
      console.error("更新用户名失败:", error);
    }
  };

  // 按层级组织评论
  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold flex items-center gap-2 ${dark ? "text-white" : "text-gray-900"}`}>
            <FiMessageCircle className="w-5 h-5" />
            {t("articleDetail.comments", { defaultValue: "评论" })} ({comments.length})
          </h2>
          
          {/* 用户信息显示/编辑 */}
          {currentUser && (
            <button
              onClick={() => {
                setEditingUserName(currentUser.name);
                setShowUserModal(true);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                dark ? "bg-zinc-800 text-white/80 hover:bg-zinc-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <RandomAvatar seed={currentUser.id} size={20} />
              <span>{currentUser.name}</span>
              <FiEdit2 className="w-3 h-3 opacity-60" />
            </button>
          )}
        </div>

        {/* 用户名编辑弹窗 */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div
              className={`w-full max-w-sm mx-4 p-6 rounded-2xl shadow-2xl ${
                dark ? "bg-zinc-900" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${dark ? "text-white" : "text-gray-900"}`}>
                  <FiUser className="inline-block mr-2 w-5 h-5" />
                  {t("articleDetail.editProfile", { defaultValue: "编辑资料" })}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className={`p-1 rounded-lg ${dark ? "hover:bg-zinc-800" : "hover:bg-gray-100"}`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-1.5 ${dark ? "text-white/70" : "text-gray-600"}`}>
                    {t("articleDetail.userName", { defaultValue: "昵称" })}
                  </label>
                  <input
                    type="text"
                    value={editingUserName}
                    onChange={(e) => setEditingUserName(e.target.value)}
                    maxLength={20}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm ${
                      dark ? "bg-zinc-800 text-white border-zinc-700" : "bg-gray-50 text-gray-900 border-gray-200"
                    } border focus:outline-none focus:ring-2`}
                    placeholder={t("articleDetail.userNamePlaceholder", { defaultValue: "输入昵称（最多20字）" })}
                  />
                </div>
                <p className={`text-xs ${dark ? "text-white/50" : "text-gray-500"}`}>
                  {t("articleDetail.localStorageNote", { defaultValue: "评论数据存储在本地浏览器中，清除浏览器数据后将丢失。" })}
                </p>
                <button
                  onClick={handleUpdateUserName}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: accent }}
                >
                  {t("articleDetail.save", { defaultValue: "保存" })}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 评论输入框 */}
        <div className="flex gap-3 mb-8">
          <RandomAvatar seed={currentUser?.id || "guest"} size={40} className="flex-shrink-0" />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t("articleDetail.commentPlaceholder", { defaultValue: "分享你的想法..." })}
              className={`w-full px-4 py-3 rounded-xl text-sm resize-none ${
                dark ? "bg-zinc-800 text-white border-zinc-700" : "bg-gray-50 text-gray-900 border-gray-200"
              } border focus:outline-none focus:ring-2`}
              rows={3}
              maxLength={1000}
            />
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs ${dark ? "text-white/40" : "text-gray-400"}`}>
                {newComment.length}/1000
              </span>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{ backgroundColor: accent }}
              >
                {isSubmitting
                  ? t("articleDetail.posting", { defaultValue: "发布中..." })
                  : t("articleDetail.postComment", { defaultValue: "发表评论" })}
              </button>
            </div>
          </div>
        </div>

        {/* 评论列表 */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className={`w-10 h-10 rounded-full ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 w-32 rounded ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
                  <div className={`h-4 w-full rounded ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
                  <div className={`h-4 w-3/4 rounded ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className={`text-center py-12 ${dark ? "text-white/50" : "text-gray-500"}`}>
            <FiMessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t("articleDetail.noComments", { defaultValue: "还没有评论，来说点什么吧~" })}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {topLevelComments.map((comment) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onReply={(id) => {
                    setReplyingTo(id);
                    setReplyContent("");
                  }}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  replies={getReplies(comment.id)}
                  locale={locale}
                />

                {/* 回复输入框 */}
                {replyingTo === comment.id && (
                  <div className="ml-13 mt-4 pl-4 border-l-2" style={{ borderColor: dark ? "#3f3f46" : "#e5e7eb" }}>
                    <div className="flex gap-3">
                      <RandomAvatar seed={currentUser?.id || "guest"} size={32} className="flex-shrink-0" />
                      <div className="flex-1">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={t("articleDetail.replyPlaceholder", {
                            defaultValue: `回复 ${comment.userName}...`,
                            name: comment.userName,
                          })}
                          className={`w-full px-3 py-2 rounded-lg text-sm resize-none ${
                            dark ? "bg-zinc-800 text-white border-zinc-700" : "bg-gray-50 text-gray-900 border-gray-200"
                          } border focus:outline-none focus:ring-2`}
                          rows={2}
                          autoFocus
                          maxLength={500}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={!replyContent.trim() || isSubmitting}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-50"
                            style={{ backgroundColor: accent }}
                          >
                            {t("articleDetail.reply", { defaultValue: "回复" })}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent("");
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              dark ? "bg-zinc-700 text-white/80" : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {t("articleDetail.cancel", { defaultValue: "取消" })}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

// Footer 组件
function Footer() {
  const { dark } = useTheme();

  return (
    <footer className={`py-8 border-t ${dark ? "border-gray-800 bg-zinc-900" : "border-gray-200 bg-white"}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 社交链接 */}
          <div className="flex items-center gap-4">
            <a href="/rss.xml" className={`p-2 rounded-full transition-colors ${dark ? "hover:bg-gray-800 text-white/60" : "hover:bg-gray-100 text-gray-500"}`} aria-label="RSS">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z" /></svg>
            </a>
            <a href="mailto:wtiroo@163.com" className={`p-2 rounded-full transition-colors ${dark ? "hover:bg-gray-800 text-white/60" : "hover:bg-gray-100 text-gray-500"}`} aria-label="Email">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </a>
            <a href="https://github.com/king-peach" target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full transition-colors ${dark ? "hover:bg-gray-800 text-white/60" : "hover:bg-gray-100 text-gray-500"}`} aria-label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            </a>
          </div>
          <p className={`text-sm ${dark ? "text-white/50" : "text-gray-500"}`}>
            © 2025 Eric. Built with Notion & Tailwind
          </p>
        </div>
      </div>
    </footer>
  );
}

// 主组件
function ArticleDetailInner({ slug: slugProp }: { slug?: string }) {
  const { t, i18n } = useTranslation();
  const { dark } = useTheme();
  const lang = i18n.language.startsWith("en") ? "en" : "zh";
  const locale = lang === "zh" ? "zh_CN" : "en_US";

  const slug = useMemo(() => {
    if (slugProp) return slugProp;
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[1] ?? "";
  }, [slugProp]);

  const { article, loading, error, relatedArticles } = useNotionArticleBySlug(slug);

  const toc = useMemo(() => {
    if (!article?.content_markdown) return [];
    return extractToc(article.content_markdown);
  }, [article]);

  const [activeId, setActiveId] = useState("");

  // 滚动时更新活动章节
  useEffect(() => {
    if (toc.length === 0) return;
    
    // 获取所有标题元素及其位置
    const headingElements: { id: string; top: number }[] = [];
    
    const updateHeadingPositions = () => {
      headingElements.length = 0;
      for (const item of toc) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          headingElements.push({ 
            id: item.id, 
            top: rect.top + window.pageYOffset 
          });
        }
      }
    };
    
    const handleScroll = () => {
      const scrollPosition = window.pageYOffset + 120; // 顶部偏移
      
      // 找到当前可视的章节
      let currentId = "";
      for (let i = headingElements.length - 1; i >= 0; i--) {
        if (scrollPosition >= headingElements[i].top) {
          currentId = headingElements[i].id;
          break;
        }
      }
      
      // 如果在第一个标题之前，选中第一个
      if (!currentId && headingElements.length > 0 && scrollPosition < headingElements[0].top) {
        currentId = headingElements[0].id;
      }
      
      if (currentId && currentId !== activeId) {
        setActiveId(currentId);
      }
    };
    
    // 初始化
    const timer = setTimeout(() => {
      updateHeadingPositions();
      handleScroll();
    }, 300);
    
    // 监听滚动
    window.addEventListener("scroll", handleScroll, { passive: true });
    // 监听窗口大小变化（重新计算位置）
    window.addEventListener("resize", updateHeadingPositions);
    
    return () => { 
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateHeadingPositions);
    };
  }, [toc, activeId]);

  // 处理页面加载时的 URL hash 锚点跳转
  useEffect(() => {
    if (!article || toc.length === 0) return;
    
    const hash = window.location.hash.slice(1); // 移除 # 号
    if (!hash) return;
    
    // 延迟执行，确保 DOM 已渲染
    const timer = setTimeout(() => {
      const element = document.getElementById(hash);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
        
        setActiveId(hash);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [article, toc]);

  // 监听 hashchange 事件（用户点击浏览器前进/后退）
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
          
          setActiveId(hash);
        }
      }
    };
    
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const title = useMemo(() => (article ? extractTitle(article) : ""), [article]);
  const summary = useMemo(() => (article ? extractSummary(article) : ""), [article]);
  const coverUrl = useMemo(() => (article ? extractCover(article) : null), [article]);
  const contentMarkdown = article?.content_markdown ?? "";

  const seoConfig = useMemo(() => {
    if (!article) return null;
    const description = summary || truncateDescription(contentMarkdown.replace(/#+\s/g, ""), 160);
    const keywords = (t("seo.articleDetail.keywordsBase", "") || "") + ",前端开发,JavaScript,技术博客";
    const canonicalSlug = encodeURIComponent(article.urlSlug || slug);
    const schemaLD = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      image: coverUrl || DEFAULT_OG_IMAGE,
      author: { "@type": "Person", name: lang === "zh" ? "王涛" : "Eric Wang", url: SITE_URL },
      datePublished: article.created_time,
      dateModified: article.last_edited_time,
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/article/${canonicalSlug}` },
    };
    return { title: title + (t("seo.articleDetail.titleSuffix") || ""), description, keywords, ogImage: coverUrl || DEFAULT_OG_IMAGE, ogType: "article" as const, canonicalUrl: `${SITE_URL}/article/${canonicalSlug}`, schemaLD };
  }, [article, title, summary, contentMarkdown, coverUrl, slug, t, lang]);

  if (loading) {
    return (
      <div className={`min-h-screen ${dark ? "bg-zinc-900" : "bg-white"}`}>
        <Header showNav={false} showLanguage={true} showTheme={true} leftSlot={<HomeButton />} />
        {/* 骨架屏加载动画 */}
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
          {/* 标签骨架 */}
          <div className="flex gap-2 mb-4">
            <div className={`h-6 w-20 rounded-full animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <div className={`h-6 w-16 rounded-full animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
          </div>
          
          {/* 标题骨架 */}
          <div className={`h-10 w-3/4 rounded-lg mb-4 animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
          <div className={`h-10 w-1/2 rounded-lg mb-6 animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
          
          {/* 元信息骨架 */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`h-8 w-8 rounded-full animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <div className={`h-4 w-24 rounded animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <div className={`h-4 w-20 rounded animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <div className={`h-4 w-16 rounded animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
          </div>
          
          {/* 内容骨架 */}
          <div className="space-y-4">
            <div className={`h-4 w-full rounded animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <div className={`h-4 w-full rounded animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <div className={`h-4 w-5/6 rounded animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <div className={`h-4 w-full rounded animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <div className={`h-4 w-4/5 rounded animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <div className="py-2" />
            <div className={`h-4 w-full rounded animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <div className={`h-4 w-3/4 rounded animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <div className={`h-4 w-full rounded animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <div className="py-2" />
            {/* 代码块骨架 */}
            <div className={`h-32 w-full rounded-xl animate-pulse ${dark ? "bg-zinc-800" : "bg-gray-100"}`} />
            <div className="py-2" />
            <div className={`h-4 w-full rounded animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
            <div className={`h-4 w-2/3 rounded animate-pulse ${dark ? "bg-zinc-700" : "bg-gray-200"}`} />
          </div>
          
          {/* 加载提示 */}
          <div className="flex items-center justify-center gap-3 mt-12">
            <div className="relative w-5 h-5">
              <div className={`absolute inset-0 rounded-full border-2 border-t-transparent animate-spin ${dark ? "border-white/30" : "border-gray-300"}`} style={{ borderTopColor: "transparent" }} />
            </div>
            <span className={`text-sm ${dark ? "text-white/60" : "text-gray-500"}`}>
              {t("articles.loading", { defaultValue: "加载中..." })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={`min-h-screen ${dark ? "bg-zinc-900" : "bg-white"}`}>
        <Header showNav={false} showLanguage={true} showTheme={true} leftSlot={<HomeButton />} />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-sm">{error || t("articleDetail.notFound", { defaultValue: "未找到文章" })}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {seoConfig && (
        <SEO title={seoConfig.title} description={seoConfig.description} keywords={seoConfig.keywords} ogImage={seoConfig.ogImage} ogType={seoConfig.ogType} canonicalUrl={seoConfig.canonicalUrl} schemaLD={seoConfig.schemaLD} locale={locale} />
      )}
      <div className={`min-h-screen ${dark ? "bg-zinc-900" : "bg-white"}`} data-page="ArticleDetail">
        {/* 文章头部（含渐变背景和Header） */}
        <div className="animate-fade-in">
          <ArticleHeader article={article} />
        </div>

        {/* 主内容区 */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex gap-8">
            {/* 左侧目录 */}
            <aside className="hidden lg:block w-56 flex-shrink-0 animate-fade-in-left" style={{ animationDelay: "0.2s" }}>
              <TableOfContents toc={toc} activeId={activeId} />
            </aside>

            {/* 文章内容 */}
            <main className="flex-1 min-w-0 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              <MarkdownContent content={contentMarkdown} />
              <ArticleFooter article={article} />
            </main>
          </div>
        </div>

        {/* 推荐阅读 */}
        <RelatedArticles articles={relatedArticles} />

        {/* 评论区 */}
        <CommentsSection articleId={article.urlSlug || article.id} />

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

export default function ArticleDetail({ slug }: { slug?: string }) {
  return (
    <ThemeProvider>
      <ArticleDetailInner slug={slug} />
    </ThemeProvider>
  );
}
