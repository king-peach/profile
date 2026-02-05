import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ThemeProvider, useTheme } from "../components/ThemeContext";
import Header from "../components/Header";
import PrismBackground from "../components/ui/PrismBackground";
import SpotlightCard from "../components/ui/SpotlightCard";
import SplitText from "../components/ui/SplitText";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { FiCalendar, FiTag, FiUser, FiExternalLink, FiLoader } from "react-icons/fi";

// Notion Database 字段类型
type NotionRichText = { plain_text?: string }[];
type NotionTitle = { title?: NotionRichText };
type NotionSelect = { select?: { name?: string; color?: string } };
type NotionMultiSelect = { multi_select?: { name?: string; color?: string }[] };
type NotionDate = { date?: { start?: string; end?: string } };
type NotionPeople = { people?: { name?: string; avatar_url?: string }[] };
type NotionUrl = { url?: string };
type NotionRichTextProp = { rich_text?: NotionRichText };

type NotionProperty = {
  type: string;
} & Partial<NotionTitle> &
  Partial<NotionSelect> &
  Partial<NotionMultiSelect> &
  Partial<NotionDate> &
  Partial<NotionPeople> &
  Partial<NotionUrl> &
  Partial<NotionRichTextProp>;

type NotionPage = {
  object: "page";
  id: string;
  url?: string;
  urlSlug?: string;
  created_time?: string;
  last_edited_time?: string;
  cover?: { type: string; external?: { url: string }; file?: { url: string } };
  icon?: { type: string; emoji?: string; external?: { url: string } };
  properties?: Record<string, NotionProperty>;
};

type DatabaseResponse = {
  results?: NotionPage[];
  has_more?: boolean;
  next_cursor?: string | null;
};

const PAGE_SIZE = 10;
const DATABASE_ID = import.meta.env.VITE_NOTION_DATASOURCE_ID;
// 开发与生产均使用静态 JSON，不调用 Notion API（需先执行 npm run fetch-notion）
const USE_STATIC_DATA = import.meta.env.VITE_USE_STATIC_DATA !== "false";

// 提取属性值的工具函数
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

function extractText(prop?: NotionProperty): string {
  if (!prop) return "";
  if (prop.type === "rich_text") {
    return prop.rich_text?.map((t) => t.plain_text).join("") || "";
  }
  if (prop.type === "title") {
    return prop.title?.map((t) => t.plain_text).join("") || "";
  }
  return "";
}

function extractSelect(prop?: NotionProperty): { name: string; color: string } | null {
  if (!prop || prop.type !== "select" || !prop.select?.name) return null;
  return { name: prop.select.name, color: prop.select.color || "gray" };
}

function extractMultiSelect(prop?: NotionProperty): { name: string; color: string }[] {
  if (!prop || prop.type !== "multi_select") return [];
  return (prop.multi_select || []).map((s) => ({ name: s.name || "", color: s.color || "gray" }));
}

function extractDate(prop?: NotionProperty): string | null {
  if (!prop || prop.type !== "date" || !prop.date?.start) return null;
  return prop.date.start;
}

function extractUrl(prop?: NotionProperty): string | null {
  if (!prop || prop.type !== "url") return null;
  return prop.url || null;
}

function extractCover(p: NotionPage): string | null {
  if (!p.cover) return null;
  if (p.cover.type === "external") return p.cover.external?.url || null;
  if (p.cover.type === "file") return p.cover.file?.url || null;
  return null;
}

// 用于排序的“有效时间”：优先 PublishDate / 发布日期 / 日期 / Date，其次 last_edited_time / created_time
function getEffectiveDate(page: NotionPage): string | null {
  const props = page.properties || {};
  const dateProp =
    props["PublishDate"] ||
    props["发布日期"] ||
    props["日期"] ||
    props["Date"];

  const dateFromProp = extractDate(dateProp as NotionProperty);
  return dateFromProp || page.last_edited_time || page.created_time || null;
}

function getEffectiveTimestamp(page: NotionPage): number {
  const d = getEffectiveDate(page);
  if (!d) return 0;
  const ts = new Date(d).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

// Notion 颜色映射
const notionColors: Record<string, string> = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  brown: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

// 文章类型筛选（Notion Tags 对应的业务类型）
const TAG_FILTERS = [
  { code: "FrontEndEngineering", label: "前端工程化", labelEn: "Front-end Engineering" },
  { code: "DesignPattern", label: "设计模式", labelEn: "DesignPattern" },
  { code: "ProblemsReview", label: "疑难问题复盘", labelEn: "Problems Review" },
  { code: "Notes", label: "随笔", labelEn: "Notes" },
  { code: "JavaScript", label: "JS基础", labelEn: "JavaScript" },
];

// Notion Tags 名称到业务类型 code 的映射
const TAG_CODE_MAP: Record<string, string> = {
  "Front-end Engineering": "FrontEndEngineering",
  "前端工程化": "FrontEndEngineering",
  DesignPattern: "DesignPattern",
  "设计模式": "DesignPattern",
  "Problems Review": "ProblemsReview",
  "疑难问题复盘": "ProblemsReview",
  Notes: "Notes",
  "随笔": "Notes",
  JavaScript: "JavaScript",
  "JS基础": "JavaScript",
};

function getPageTagInfo(
  p: NotionPage,
): { code: string | null; label: string | null; color: string | null } {
  const props = p.properties || {};
  const tagSelect = extractSelect(props["Tags"] || props["标签"] || props["tags"]);
  if (!tagSelect || !tagSelect.name) {
    return { code: null, label: null, color: null };
  }

  const mappedCode = TAG_CODE_MAP[tagSelect.name] || tagSelect.name;

  return {
    code: mappedCode || null,
    label: tagSelect.name,
    color: tagSelect.color || null,
  };
}

// 数据加载 Hook - 支持 SSG 静态数据和开发环境 API
function useNotionDatabase() {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [allPages, setAllPages] = useState<NotionPage[]>([]); // SSG 模式下的所有数据
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // SSG 模式下的分页

  // SSG 模式：从静态 JSON 加载所有数据
  const fetchStaticData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/data/articles.json");
      if (!res.ok) throw new Error("加载静态数据失败");
      const json = await res.json();
      const items = (json.results || [])
        .filter((r: NotionPage) => r.object === "page")
        .sort((a: NotionPage, b: NotionPage) => getEffectiveTimestamp(b) - getEffectiveTimestamp(a));

      setAllPages(items);
      // 初始显示第一页
      setPages(items.slice(0, PAGE_SIZE));
      setHasMore(items.length > PAGE_SIZE);
      setCurrentPage(1);
    } catch (e: any) {
      setError(e?.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // 开发模式：从 API 加载数据
  const fetchPages = useCallback(async (startCursor?: string | null) => {
    if (!DATABASE_ID) {
      setError("未配置 VITE_NOTION_DATASOURCE_ID");
      setLoading(false);
      return;
    }

    try {
      const isInitial = !startCursor;
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`/api/notion/databases/${DATABASE_ID}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_size: PAGE_SIZE,
          start_cursor: startCursor || undefined,
          sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `请求失败 ${res.status}`);
      }

      const json: DatabaseResponse = await res.json();
      const items = (json.results || [])
        .filter((r) => r.object === "page")
        .sort((a, b) => getEffectiveTimestamp(b) - getEffectiveTimestamp(a));

      setPages((prev) => (isInitial ? items : [...prev, ...items]));
      setHasMore(json.has_more || false);
      setCursor(json.next_cursor || null);
    } catch (e: any) {
      setError(e?.message || "加载失败");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (USE_STATIC_DATA) {
      fetchStaticData();
    } else {
      fetchPages();
    }
  }, [fetchStaticData, fetchPages]);

  const loadMore = useCallback(() => {
    if (USE_STATIC_DATA) {
      // SSG 模式：从已加载的数据中分页
      if (!loadingMore && hasMore) {
        setLoadingMore(true);
        const nextPage = currentPage + 1;
        const start = currentPage * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const newItems = allPages.slice(start, end);
        
        setTimeout(() => {
          setPages((prev) => [...prev, ...newItems]);
          setCurrentPage(nextPage);
          setHasMore(end < allPages.length);
          setLoadingMore(false);
        }, 300); // 模拟加载延迟
      }
    } else {
      // 开发模式：从 API 加载更多
      if (!loadingMore && hasMore && cursor) {
        fetchPages(cursor);
      }
    }
  }, [loadingMore, hasMore, cursor, fetchPages, currentPage, allPages]);

  return { pages, loading, loadingMore, error, hasMore, loadMore };
}

// 炫酷头部组件
function HeaderHero() {
  const { t } = useTranslation();
  const { accentText, baseText, dark } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  // 监听滚动，判断是否滚动超过 hero section
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        // 当 section 底部滚动到视口顶部时，切换为 fixed 吸顶
        setIsScrolledPastHero(rect.bottom <= 60);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // 初始检查
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* 吸顶 Header - 滚动超过 hero 后显示 */}
      {isScrolledPastHero && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header
            showNav={false}
            showLanguage={true}
            showTheme={true}
          />
        </div>
      )}
      
      <section ref={sectionRef} className="relative min-h-[calc(40vh+80px)] flex flex-col overflow-hidden">
        {/* 初始 Header - 在 hero 内部 */}
        {!isScrolledPastHero && (
          <div className="sticky top-0 z-50">
            <Header
              showNav={false}
              showLanguage={true}
              showTheme={true}
            />
          </div>
        )}
      <PrismBackground
        animationType="rotate"
        timeScale={0.3}
        colorFrequency={1.2}
        glow={1.5}
        bloom={1.4}
        noise={0.15}
        baseHue={220}
        hueRange={60}
        satBase={70}
        satRange={30}
        lumBase={60}
        lumRange={20}
        suspendWhenOffscreen
        className="z-0 opacity-90 w-full"
      />
      
      {/* 浮动粒子效果 */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute rounded-full",
              dark ? "bg-white/10" : "bg-black/5"
            )}
            style={{
              width: Math.random() * 20 + 5,
              height: Math.random() * 20 + 5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-16 w-full flex-1 flex flex-col justify-center">
        {/* 标题动画 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <SplitText
            tag="h1"
            text={t('articles.title')}
            className="text-4xl md:text-6xl font-black tracking-tight mb-4"
            splitType="chars"
            delay={0.05}
            duration={0.5}
            from={{ opacity: 0, y: 50, rotateX: -90 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
          />
        </motion.div>

        <motion.p
          className="text-lg md:text-xl max-w-2xl"
          style={{ color: baseText }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {t('articles.subtitle')}
        </motion.p>

        {/* 装饰线条 */}
        <motion.div
          className={cn(
            "mt-8 h-1 rounded-full",
            dark ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" : "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
          )}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "120px", opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />
      </div>
    </section>
    </>
  );
}

// 文章卡片组件
function ArticleCard({ page, index }: { page: NotionPage; index: number }) {
  const { t, i18n } = useTranslation();
  const { baseText, accentText, dark } = useTheme();
  const props = page.properties || {};

  const isEn = i18n.language.startsWith("en");
  const slugTitle = extractText(props["slug"] || props["Slug"] || props["SLUG"]);
  const title = (isEn ? slugTitle : "") || extractTitle(page);
  const cover = extractCover(page);
  const tags = extractMultiSelect(props["标签"] || props["Tags"] || props["tags"]);
  const tagInfo = getPageTagInfo(page);
  // 发布时间：优先使用 Notion 的 PublishDate / 发布日期，其次退回到其它日期字段或最后编辑时间
  const date =
    extractDate(
      props["PublishDate"] ||
      props["发布日期"] ||
      props["日期"] ||
      props["Date"],
    ) || page.last_edited_time;
  const summary = extractRichText(props["summary"] || props["摘要"] || props["Summary"] || props["描述"] || props["Description"]);
  const summaryEn = extractText(props["summaryEn"] || props["SummaryEn"] || props["SummaryEN"]);
  const displayedSummary = (isEn ? summaryEn : "") || summary;

  // 构建文章详情链接
  const articleUrl = page.urlSlug 
    ? `/article/${encodeURIComponent(page.urlSlug)}` 
    : page.url;
  const isExternalLink = !page.urlSlug && page.url;

  // 卡片点击跳转
  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是链接或按钮，不处理
    if ((e.target as HTMLElement).closest('a, button')) {
      return;
    }
    if (articleUrl) {
      if (isExternalLink) {
        window.open(articleUrl, "_blank");
      } else {
        window.location.href = articleUrl;
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <SpotlightCard
        spotlightColor={dark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.05)"}
        className="h-full"
      >
        <Card
          className={cn(
            "overflow-hidden transition-all duration-300 h-full flex flex-col cursor-pointer",
            "hover:shadow-xl hover:-translate-y-1",
            dark ? "bg-zinc-800/80 border-zinc-700/50 backdrop-blur-sm" : "bg-white/80 backdrop-blur-sm"
          )}
          onClick={handleCardClick}
        >
          {/* 封面图 */}
          {cover && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={cover}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          <CardHeader className={cn(cover ? "pt-4" : "")}>  
            {/* 类型标签（Notion Tags） */}
            {tagInfo.label && (
              <div className="mb-2">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    notionColors[tagInfo.color || "default"] || notionColors.default,
                  )}
                >
                  {i18n.language.startsWith("en")
                    ? tagInfo.label
                    : TAG_FILTERS.find((f) => f.code === tagInfo.code)?.label || tagInfo.label}
                </span>
              </div>
            )}

            <CardTitle
              className="text-xl font-bold line-clamp-2 hover:text-blue-500 transition-colors"
              style={{ color: accentText }}
            >
              {title}
            </CardTitle>

            {/* 日期 */}
            {date && (
              <CardDescription className="flex items-center gap-1.5 text-sm mt-2" style={{ color: baseText }}>
                <FiCalendar className="w-3.5 h-3.5" />
                {format(new Date(date), "yyyy年MM月dd日")}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="flex-1">
            {/* 摘要 */}
            {displayedSummary && (
              <p className="text-sm line-clamp-3 mb-4" style={{ color: baseText }}>
                {displayedSummary}
              </p>
            )}

            {/* 标签 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 4).map((tag, i) => (
                  <span
                    key={i}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs",
                      notionColors[tag.color] || notionColors.default
                    )}
                  >
                    <FiTag className="w-3 h-3" />
                    {tag.name}
                  </span>
                ))}
                {tags.length > 4 && (
                  <span className="text-xs text-gray-500">+{tags.length - 4}</span>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-4 border-t border-gray-100 dark:border-zinc-700">
            {articleUrl && (
              <a
                href={articleUrl}
                target={isExternalLink ? "_blank" : undefined}
                rel={isExternalLink ? "noreferrer" : undefined}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors",
                  "hover:text-blue-500"
                )}
                style={{ color: accentText }}
                onClick={(e) => e.stopPropagation()}
              >
                {t('articles.readMore')}
                <FiExternalLink className="w-4 h-4" />
              </a>
            )}
          </CardFooter>
        </Card>
      </SpotlightCard>
    </motion.div>
  );
}

// 加载更多触发器
function LoadMoreTrigger({ onLoadMore, loading }: { onLoadMore: () => void; loading: boolean }) {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [onLoadMore, loading]);

  return <div ref={triggerRef} className="h-10" />;
}

// 列表组件
function ListGrid() {
  const { t, i18n } = useTranslation();
  const { pages, loading, loadingMore, error, hasMore, loadMore } = useNotionDatabase();
  const { baseText, dark } = useTheme();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTag = params.get("tag");
      if (urlTag) {
        setActiveTag(urlTag);
      }
    } catch (e) {
      // ignore URL parse errors
    }
  }, []);

  const updateUrlTag = (tag: string | null) => {
    try {
      const url = new URL(window.location.href);
      if (tag) {
        url.searchParams.set("tag", tag);
      } else {
        url.searchParams.delete("tag");
      }
      window.history.replaceState(null, "", url.toString());
    } catch (e) {
      // ignore URL update errors
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FiLoader className="w-8 h-8 text-blue-500" />
        </motion.div>
        <p className="text-sm" style={{ color: baseText }}>
          {t('articles.loading')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <div className="text-red-500 text-lg">⚠️</div>
        <p className="text-sm" style={{ color: baseText }}>
          {error}
        </p>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <div className="text-4xl">📭</div>
        <p className="text-sm" style={{ color: baseText }}>
          {t('articles.noArticles')}
        </p>
      </div>
    );
  }

  const filteredPages = activeTag
    ? pages.filter((page) => {
        const info = getPageTagInfo(page);
        return info.code === activeTag;
      })
    : pages;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
      {/* 类型筛选 */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm" style={{ color: baseText }}>
          {t("articles.filterByType") || "按类型筛选"}
        </span>
        <button
          type="button"
          onClick={() => {
            setActiveTag(null);
            updateUrlTag(null);
          }}
          className={cn(
            "px-3 py-1 rounded-full text-xs border transition-colors",
            !activeTag
              ? dark
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-blue-600 text-white border-blue-600"
              : dark
              ? "border-zinc-600 text-zinc-200"
              : "border-gray-300 text-gray-700",
          )}
        >
          {t('articles.all')}
        </button>
        {TAG_FILTERS.map((filter) => (
          <button
            key={filter.code}
            type="button"
            onClick={() => {
              setActiveTag(filter.code);
              updateUrlTag(filter.code);
            }}
            className={cn(
              "px-3 py-1 rounded-full text-xs border transition-colors",
              activeTag === filter.code
                ? dark
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-blue-600 text-white border-blue-600"
                : dark
                ? "border-zinc-600 text-zinc-200"
                : "border-gray-300 text-gray-700",
            )}
          >
            {i18n.language.startsWith("en") ? filter.labelEn : filter.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPages.map((page, index) => (
          <ArticleCard key={page.id} page={page} index={index % PAGE_SIZE} />
        ))}
      </div>

      {/* 滚动加载 */}
      {hasMore && (
        <>
          <LoadMoreTrigger onLoadMore={loadMore} loading={loadingMore} />
          {loadingMore && (
            <div className="flex justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FiLoader className="w-6 h-6 text-blue-500" />
              </motion.div>
            </div>
          )}
        </>
      )}

      {/* 加载完成提示（基于筛选结果数量） */}
      {!hasMore && filteredPages.length > 0 && (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm" style={{ color: baseText }}>
            — {t('articles.loadedAll')} {filteredPages.length} {t('articles.articlesCount')} —
          </p>
        </motion.div>
      )}
    </div>
  );
}

function ArticleListInner() {
  const { dark } = useTheme();

  return (
    <div
      className={cn("min-h-screen", dark ? "bg-zinc-900" : "bg-gray-50")}
      data-page="ArticleList"
    >
      <HeaderHero />
      <ListGrid />
    </div>
  );
}

export default function ArticleList() {
  return (
    <ThemeProvider>
      <ArticleListInner />
    </ThemeProvider>
  );
}