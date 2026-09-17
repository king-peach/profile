import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SpotlightCard from "../ui/SpotlightCard";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FiArrowRight, FiClock, FiLoader, FiTag } from "react-icons/fi";

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
  urlSlug?: string;
  created_time?: string;
  last_edited_time?: string;
  properties?: Record<string, NotionProperty>;
};

const USE_STATIC_DATA = import.meta.env.VITE_USE_STATIC_DATA !== "false";
const DATABASE_ID = import.meta.env.VITE_NOTION_DATASOURCE_ID;

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

function useRecentArticles() {
  const [articles, setArticles] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        if (USE_STATIC_DATA) {
          const res = await fetch("/data/articles.json");
          if (!res.ok) throw new Error("加载静态数据失败");
          const json = await res.json();
          setArticles(selectTopArticles(json.results || []));
        } else {
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

function getArticleMeta(article: NotionPage, isEn: boolean) {
  const props = article.properties || {};
  const slugTitle = extractText(props["slug"] || props["Slug"] || props["SLUG"]);
  const title = (isEn ? slugTitle : "") || extractTitle(article);
  const summary = extractRichText(
    props["summary"] || props["摘要"] || props["Summary"] || props["描述"] || props["Description"]
  );
  const summaryEn = extractText(props["summaryEn"] || props["SummaryEn"] || props["SummaryEN"]);
  const displayedSummary = (isEn ? summaryEn : "") || summary;
  const tags = extractMultiSelect(props["标签"] || props["Tags"] || props["tags"]);
  const date =
    extractDate(
      props["PublishDate"] ||
        props["发布日期"] ||
        props["日期"] ||
        props["Date"]
    ) || article.last_edited_time;

  return { title, displayedSummary, tags, date };
}

const Blog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { baseText, accentText, accent, dark } = useTheme();
  const { articles, loading, error } = useRecentArticles();

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const isEn = i18n.language.startsWith("en");

  useEffect(() => {
    gsap.fromTo(
      [headerRef.current, cardsRef.current],
      { y: 36, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom-=110",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, [loading]);

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

  const handleArticleOpen = (article: NotionPage) => {
    if (article.urlSlug) {
      navigateTo(`/article/${encodeURIComponent(article.urlSlug)}`);
    } else if (article.url) {
      navigateTo(article.url, { newTab: true });
    }
  };

  const featuredArticle = articles[0];
  const latestArticles = articles.slice(1);

  return (
    <section
      ref={sectionRef}
      id="blog"
      className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20"
      style={{ color: baseText }}
      data-component="Blog"
    >
      <div ref={headerRef} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>
            Writing & Thinking
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl" style={{ color: accentText }}>
            {t("blog.header")}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed opacity-80 md:text-base">
            {t("blog.lead")}
          </p>
        </div>
        <button
          onClick={handleViewMore}
          className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:gap-3 md:text-base"
          style={{ color: accent }}
        >
          {t("blog.viewMore")}
          <FiArrowRight className="h-4 w-4" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <FiLoader className="h-6 w-6 animate-spin" style={{ color: accent }} />
        </div>
      )}

      {error && !loading && (
        <div className={`mt-8 rounded-3xl border p-6 ${dark ? "glass-dark" : "glass"}`} style={{
          borderColor: `${accent}20`,
        }}>
          <p className="text-sm md:text-base">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div ref={cardsRef} className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          {featuredArticle && (
            <SpotlightCard spotlightColor={dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)"}>
              <article
                className={`h-full cursor-pointer rounded-[28px] border p-6 transition-all duration-300 hover:-translate-y-1 md:p-8 ${
                  dark ? "glass-dark" : "glass"
                }`}
                style={{
                  borderColor: `${accent}24`,
                  backgroundColor: dark ? "rgba(24, 24, 48, 0.5)" : "rgba(255,255,255,0.68)",
                }}
                role="button"
                tabIndex={0}
                onClick={() => handleArticleOpen(featuredArticle)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleArticleOpen(featuredArticle);
                  }
                }}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>
                  {t("blog.featuredLabel")}
                </div>
                {(() => {
                  const { title, displayedSummary, tags, date } = getArticleMeta(featuredArticle, isEn);
                  return (
                    <>
                      <h3 className="mt-4 text-2xl font-bold leading-tight md:text-4xl" style={{ color: accentText }}>
                        {title}
                      </h3>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs opacity-70 md:text-sm">
                        <span>{date ? format(new Date(date), "yyyy-MM-dd") : ""}</span>
                        <span className="inline-flex items-center gap-1.5">
                          <FiClock className="h-3.5 w-3.5" />
                          {isEn ? "Freshly synced from Notion" : "最新同步自 Notion"}
                        </span>
                      </div>
                      <p className="mt-6 max-w-2xl text-sm leading-relaxed opacity-90 md:text-base">
                        {displayedSummary || t("articles.noSummary")}
                      </p>
                      {tags.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                          {tags.slice(0, 4).map((tag, index) => (
                            <span
                              key={`${tag.name}-${index}`}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs",
                                notionColors[tag.color] || notionColors.default
                              )}
                            >
                              <FiTag className="h-3 w-3" />
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold md:text-base" style={{ color: accent }}>
                        {t("blog.readMore")}
                        <FiArrowRight className="h-4 w-4" />
                      </div>
                    </>
                  );
                })()}
              </article>
            </SpotlightCard>
          )}

          <div className="grid gap-4">
            <div className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>
              {t("blog.recentLabel")}
            </div>
            {latestArticles.map((article) => {
              const { title, displayedSummary, tags, date } = getArticleMeta(article, isEn);
              const readMoreAriaLabel = title
                ? t("blog.readMoreAriaWithTitle", { title })
                : t("blog.readMoreAria");

              return (
                <SpotlightCard
                  key={article.id}
                  spotlightColor={dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.06)"}
                >
                  <article
                    className={`cursor-pointer rounded-[24px] border p-5 transition-all duration-300 hover:-translate-y-1 ${
                      dark ? "glass-dark" : "glass"
                    }`}
                    style={{
                      borderColor: `${accent}20`,
                      backgroundColor: dark ? "rgba(24, 24, 48, 0.44)" : "rgba(255,255,255,0.62)",
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={readMoreAriaLabel}
                    onClick={() => handleArticleOpen(article)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleArticleOpen(article);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs opacity-65">{date ? format(new Date(date), "yyyy-MM-dd") : ""}</div>
                      <div className="text-xs font-medium" style={{ color: accent }}>
                        {t("blog.readMore")}
                      </div>
                    </div>
                    <h3 className="mt-3 text-lg font-bold leading-snug md:text-xl" style={{ color: accentText }}>
                      {title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed opacity-80">
                      {displayedSummary || t("articles.noSummary")}
                    </p>
                    {tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={`${tag.name}-${index}`}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]",
                              notionColors[tag.color] || notionColors.default
                            )}
                          >
                            <FiTag className="h-3 w-3" />
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                </SpotlightCard>
              );
            })}

            {articles.length === 0 && (
              <div
                className={`rounded-[24px] border p-6 ${dark ? "glass-dark" : "glass"}`}
                style={{ borderColor: `${accent}20` }}
              >
                <p className="text-sm md:text-base">{t("articles.noArticles")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Blog;
