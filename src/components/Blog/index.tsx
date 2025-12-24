import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import SpotlightCard from "../ui/SpotlightCard";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FiArrowRight, FiLoader, FiTag } from "react-icons/fi";

// Notion 类型定义
type NotionRichText = { plain_text?: string }[];
type NotionProperty = {
  type: string;
  title?: NotionRichText;
  rich_text?: NotionRichText;
  select?: { name?: string; color?: string };
  multi_select?: { name?: string; color?: string }[];
  date?: { start?: string };
};

type NotionPage = {
  object: "page";
  id: string;
  url?: string;
  created_time?: string;
  last_edited_time?: string;
  properties?: Record<string, NotionProperty>;
};

// SSG 模式：从静态 JSON 读取数据
const USE_STATIC_DATA = import.meta.env.PROD;
const DATABASE_ID = import.meta.env.VITE_NOTION_DATASOURCE_ID;

// 提取属性值
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

function extractDate(prop?: NotionProperty): string | null {
  if (!prop || prop.type !== "date" || !prop.date?.start) return null;
  return prop.date.start;
}

function extractMultiSelect(prop?: NotionProperty): { name: string; color: string }[] {
  if (!prop || prop.type !== "multi_select" || !prop.multi_select) return [];
  return prop.multi_select.map((s) => ({ name: s.name || "", color: s.color || "default" }));
}

// 用于排序的“有效时间”：与文章列表保持一致：
// PublishDate / 发布日期 / 日期 / Date > last_edited_time > created_time
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

function selectTopArticles(pages: NotionPage[], limit = 4): NotionPage[] {
  return pages
    .filter((page) => page.object === "page")
    .sort((a, b) => getEffectiveTimestamp(b) - getEffectiveTimestamp(a))
    .slice(0, limit);
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

// 获取最近文章 Hook
function useRecentArticles() {
  const [articles, setArticles] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        if (USE_STATIC_DATA) {
          // 生产环境：从静态 JSON 读取
          const res = await fetch("/data/articles.json");
          if (!res.ok) throw new Error("加载静态数据失败");
          const json = await res.json();
          setArticles(selectTopArticles(json.results || []));
        } else {
          // 开发环境：从 API 代理获取
          if (!DATABASE_ID) {
            setError("未配置数据源");
            setLoading(false);
            return;
          }
          const requestPayloads = [
            { page_size: 50, sorts: [{ property: "PublishDate", direction: "descending" }] },
            { page_size: 50, sorts: [{ property: "publishDate", direction: "descending" }] },
            { page_size: 50, sorts: [{ property: "发布日期", direction: "descending" }] },
            { page_size: 50, sorts: [{ property: "日期", direction: "descending" }] },
            { page_size: 50, sorts: [{ property: "Date", direction: "descending" }] },
            { page_size: 50, sorts: [{ timestamp: "last_edited_time", direction: "descending" }] },
          ];

          let lastError: string | null = null;

          for (const payload of requestPayloads) {
            const res = await fetch(`/api/notion/databases/${DATABASE_ID}/query`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (!res.ok) {
              if (res.status === 400) {
                lastError = (await res.json().catch(() => null))?.message || null;
                continue;
              }
              throw new Error("加载失败");
            }

            const json = await res.json();
            setArticles(selectTopArticles(json.results || []));
            return;
          }

          throw new Error(lastError || "加载失败");
        }
      } catch (e: any) {
        setError(e?.message || "加载失败");
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  return { articles, loading, error };
}

const Blog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { baseCard, baseText, accentText, dark } = useTheme();
  const { articles, loading, error } = useRecentArticles();
  
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 标题动画
    gsap.fromTo(titleRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  useEffect(() => {
    // 卡片动画 - 数据加载后触发
    if (!loading && cardsRef.current && cardsRef.current.children.length > 0) {
      gsap.fromTo(Array.from(cardsRef.current.children),
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top bottom-=50",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, [loading, articles]);

  const navigateTo = (target: string, { newTab = false } = {}) => {
    if (newTab) {
      window.open(target, "_blank", "noopener,noreferrer");
      return;
    }

    if ((window as any).navigateTo) {
      (window as any).navigateTo(target);
    } else {
      window.location.href = target;
    }
  };

  const handleViewMore = () => navigateTo("/articles");

  const handleArticleOpen = (url?: string) => {
    if (!url) return;
    navigateTo(url, { newTab: true });
  };

  const handleArticleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    url?: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleArticleOpen(url);
    }
  };

  return (
    <section id="blog" className="py-12 md:py-16 px-4 md:px-6 max-w-7xl mx-auto" style={{ color: baseText }} data-component="Blog">
      {/* 标题行：左侧标题 + 右侧查看更多 */}
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <h2 ref={titleRef} className="font-bold text-xl md:text-2xl" style={{ color: accentText }}>
          {t('blog.header')}
        </h2>
        <button
          onClick={handleViewMore}
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium transition-all",
            "hover:gap-2.5"
          )}
          style={{ color: accentText }}
        >
          {t('blog.viewMore')}
          <FiArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <FiLoader className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}

      {/* 错误状态 */}
      {error && !loading && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm" style={{ color: baseText }}>{error}</p>
        </div>
      )}

      {/* 文章列表 */}
      {!loading && !error && (
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => {
            const props = article.properties || {};
            const isEn = i18n.language.startsWith("en");
            const slugTitle = extractText(props["slug"] || props["Slug"] || props["SLUG"]);
            const title = (isEn ? slugTitle : "") || extractTitle(article);
            const readMoreAriaLabel = title
              ? t("blog.readMoreAriaWithTitle", { title })
              : t("blog.readMoreAria");
            const summary = extractRichText(props["summary"] || props["摘要"] || props["Summary"] || props["描述"] || props["Description"]);
            const summaryEn = extractText(props["summaryEn"] || props["SummaryEn"] || props["SummaryEN"]);
            const displayedSummary = (isEn ? summaryEn : "") || summary;
            const tags = extractMultiSelect(props["标签"] || props["Tags"] || props["tags"]);
            // 发布时间：优先使用 Notion 的 PublishDate，其次退回到其它日期字段或最后编辑时间
            const date =
              extractDate(
                props["PublishDate"] ||
                props["发布日期"] ||
                props["日期"] ||
                props["Date"],
              ) || article.last_edited_time;

            return (
              <SpotlightCard key={article.id} spotlightColor={dark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.08)"}>
                <Card className={cn("overflow-hidden transition-all hover:shadow-lg h-full flex flex-col", dark ? "bg-zinc-800 border-zinc-700" : "")}>
                  <CardHeader>
                    <CardTitle className="line-clamp-1" style={{ color: accentText }}>{title}</CardTitle>
                    <CardDescription className="text-sm" style={{ color: baseText }}>
                      {date ? format(new Date(date), "yyyy-MM-dd") : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm line-clamp-2 mb-3" style={{ color: baseText }}>
                      {displayedSummary || "暂无摘要"}
                    </p>
                    {/* 标签 */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.slice(0, 3).map((tag, i) => (
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
                        {tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter
                    className="flex justify-end pt-2 border-t border-gray-100 dark:border-zinc-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-800"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleArticleOpen(article.url)}
                    onKeyDown={(event) => handleArticleKeyDown(event, article.url)}
                    aria-label={readMoreAriaLabel}
                  >
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium hover:underline"
                        onClick={(event) => event.stopPropagation()}
                        style={{ color: accentText }}
                      >
                        {t('blog.readMore')} →
                      </a>
                    )}
                  </CardFooter>
                </Card>
              </SpotlightCard>
            );
          })}

          {/* 无数据时显示占位 */}
          {articles.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-sm" style={{ color: baseText }}>暂无文章</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Blog;