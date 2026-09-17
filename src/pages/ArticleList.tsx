import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "../components/ThemeContext";
import { InkProvider, InkNav, InkFooter } from "../styles/ink";
import "../styles/ink.css";

/* ============================================================
   Notion types + extraction helpers (carried from legacy page)
   ============================================================ */
type NotionRichText = { plain_text?: string }[];
type NotionProperty = {
  type: string;
  title?: NotionRichText;
  rich_text?: NotionRichText;
  select?: { name?: string; color?: string };
  multi_select?: { name?: string; color?: string }[];
  date?: { start?: string };
  status?: { name?: string };
};
type NotionPage = {
  object: "page";
  id: string;
  url?: string;
  urlSlug?: string;
  created_time?: string;
  last_edited_time?: string;
  properties?: Record<string, NotionProperty>;
  content_markdown?: string;
};

function getPlainText(t: { plain_text?: string; text?: { content?: string } }): string {
  return t.plain_text || t.text?.content || "";
}

function extractTitle(p: NotionPage, fallbackMarkdown?: string): string {
  const props = p.properties || {};
  for (const key of Object.keys(props)) {
    const prop = props[key];
    if (prop?.type === "title" && Array.isArray(prop.title) && prop.title.length > 0) {
      const text = prop.title.map(getPlainText).join("");
      if (text) return text;
    }
  }
  if (fallbackMarkdown) {
    const m = fallbackMarkdown.match(/^#{1,2}\s+(.+)$/m);
    if (m) return m[1].trim();
  }
  return "Untitled";
}

function extractRichText(prop?: NotionProperty): string {
  if (!prop || prop.type !== "rich_text") return "";
  return prop.rich_text?.map(getPlainText).join("") || "";
}

function extractTextProp(prop?: NotionProperty): string {
  if (!prop) return "";
  if (prop.type === "rich_text") return prop.rich_text?.map(getPlainText).join("") || "";
  if (prop.type === "title") return prop.title?.map(getPlainText).join("") || "";
  return "";
}

function extractSelect(prop?: NotionProperty): { name: string; color: string } | null {
  if (!prop || prop.type !== "select" || !prop.select?.name) return null;
  return { name: prop.select.name, color: prop.select.color || "gray" };
}

function extractDateProp(prop?: NotionProperty): string | null {
  if (!prop || prop.type !== "date" || !prop.date?.start) return null;
  return prop.date.start;
}

function getEffectiveDate(page: NotionPage): string | null {
  const props = page.properties || {};
  const dateProp = props["PublishDate"] || props["发布日期"] || props["日期"] || props["Date"];
  return (
    extractDateProp(dateProp as NotionProperty) ||
    page.last_edited_time ||
    page.created_time ||
    null
  );
}

function getEffectiveTimestamp(page: NotionPage): number {
  const d = getEffectiveDate(page);
  if (!d) return 0;
  const ts = new Date(d).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

function getStatus(p: NotionPage): string {
  const props = p.properties || {};
  const st = props["Published"];
  if (st && st.type === "status" && st.status?.name) return st.status.name;
  return "Draft";
}

function summaryOf(p: NotionPage): string {
  const props = p.properties || {};
  return extractRichText(
    props["summary"] || props["摘要"] || props["Summary"] || props["描述"] || props["Description"]
  );
}

function summaryEnOf(p: NotionPage): string {
  const props = p.properties || {};
  return extractTextProp(props["summaryEn"] || props["SummaryEn"] || props["SummaryEN"]);
}

const TAG_LABELS: Record<string, { zh: string; en: string }> = {
  FrontEndEngineering: { zh: "前端工程化", en: "Front-end Engineering" },
  DesignPattern: { zh: "设计模式", en: "Design Patterns" },
  ProblemsReview: { zh: "疑难复盘", en: "Problems Review" },
  Notes: { zh: "随笔", en: "Notes" },
  JavaScript: { zh: "JS 基础", en: "JavaScript" },
};

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

function getPageTagInfo(p: NotionPage): { code: string | null; label: string | null } {
  const props = p.properties || {};
  const tagSelect = extractSelect(props["Tags"] || props["标签"] || props["tags"]);
  if (!tagSelect || !tagSelect.name) return { code: null, label: null };
  const mappedCode = TAG_CODE_MAP[tagSelect.name] || tagSelect.name;
  return { code: mappedCode || null, label: tagSelect.name };
}

/* ============================================================
   Data hook (SSG static JSON, same pipeline as legacy page)
   ============================================================ */
function useNotionDatabase() {
  const [allPages, setAllPages] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [res, contentRes] = await Promise.all([
          fetch("/data/articles.json"),
          fetch("/data/articles-content.json"),
        ]);
        if (!res.ok) throw new Error("加载静态数据失败");
        const json = await res.json();

        const contentMap: Record<string, string> = {};
        if (contentRes.ok) {
          const contentJson = await contentRes.json();
          const articles = contentJson.articles || {};
          for (const id of Object.keys(articles)) {
            const md = articles[id].content_markdown;
            if (md) contentMap[id] = md;
          }
        }

        const items = (json.results || [])
          .filter((r: NotionPage) => r.object === "page")
          .map((r: NotionPage) => ({
            ...r,
            content_markdown: contentMap[r.id] || r.content_markdown,
          }))
          .sort((a: NotionPage, b: NotionPage) => getEffectiveTimestamp(b) - getEffectiveTimestamp(a));

        if (alive) setAllPages(items);
      } catch (e: any) {
        if (alive) setError(e?.message || "加载失败");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { allPages, loading, error };
}

/* ============================================================
   Ink ArticleList page
   ============================================================ */
const ArticleListInner: React.FC = () => {
  const { allPages, loading, error } = useNotionDatabase();
  const { i18n } = useTranslation();

  const [q, setQ] = useState("");
  const [tag, setTag] = useState("all");
  const [year, setYear] = useState("all");
  const [pubOnly, setPubOnly] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});

  const isEn = i18n.language.startsWith("en");

  const tagSet = useMemo(() => {
    const s: string[] = ["all"];
    for (const p of allPages) {
      const { code } = getPageTagInfo(p);
      if (code && !s.includes(code)) s.push(code);
    }
    return s;
  }, [allPages]);

  const yearSet = useMemo(() => {
    const s: string[] = [];
    for (const p of allPages) {
      const d = getEffectiveDate(p);
      if (d) {
        const y = d.slice(0, 4);
        if (!s.includes(y)) s.push(y);
      }
    }
    return s.sort();
  }, [allPages]);

  const wordCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of allPages) {
      const md = p.content_markdown || "";
      map[p.id] = md ? md.replace(/\s/g, "").length : 0;
    }
    return map;
  }, [allPages]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return allPages.filter((p) => {
      if (pubOnly && getStatus(p) !== "Published") return false;
      if (tag !== "all" && getPageTagInfo(p).code !== tag) return false;
      if (year !== "all" && (getEffectiveDate(p) || "").slice(0, 4) !== year) return false;
      if (query) {
        const title = extractTitle(p, p.content_markdown);
        const summary = summaryOf(p);
        const summaryEn = summaryEnOf(p);
        const hay = `${title} ${summary} ${summaryEn}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [allPages, q, tag, year, pubOnly]);

  const stats = useMemo(() => {
    const total = allPages.length;
    const words = allPages.reduce((s, p) => s + (wordCounts[p.id] || 0), 0);
    const dates = allPages.map((p) => (getEffectiveDate(p) || "").slice(0, 10)).filter(Boolean);
    const min = dates.length ? dates.reduce((a, b) => (a < b ? a : b)) : "—";
    const max = dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : "—";
    const span = dates.length ? `${min.slice(0, 4)} – ${max.slice(0, 4)}` : "—";
    const published = allPages.filter((p) => getStatus(p) === "Published").length;
    return { total, words, span, published };
  }, [allPages, wordCounts]);

  const featured = useMemo(() => {
    const pubs = allPages.filter((p) => getStatus(p) === "Published");
    return { big: pubs[0], rest: pubs.slice(1, 4) };
  }, [allPages]);

  const groups = useMemo(() => {
    const g: Record<string, NotionPage[]> = {};
    for (const p of filtered) {
      const d = getEffectiveDate(p) || "";
      const y = d.slice(0, 4) || "—";
      (g[y] = g[y] || []).push(p);
    }
    return Object.keys(g)
      .sort()
      .reverse()
      .map((y) => ({ year: y, items: g[y] }));
  }, [filtered]);

  const yearCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allPages) {
      const y = (getEffectiveDate(p) || "").slice(0, 4);
      if (y) counts[y] = (counts[y] || 0) + 1;
    }
    return counts;
  }, [allPages]);

  const navigate = (target: string) => {
    if ((window as any).navigateTo) (window as any).navigateTo(target);
    else window.location.href = target;
  };

  const linkFor = (p: NotionPage) => {
    const theme = document.documentElement.getAttribute("data-theme") || "light";
    const lang = i18n.language.startsWith("en") ? "en" : "zh";
    return `/article/${encodeURIComponent(p.urlSlug || "")}?lang=${lang}&theme=${theme}`;
  };

  const toggleYear = (y: string) =>
    setExpandedYears((prev) => ({ ...prev, [y]: !prev[y] }));

  if (loading) {
    return (
      <div className="min-h-screen">
        <InkNav active="blog" />
        <div className="ink-page-wrap" style={{ paddingTop: 110, paddingBottom: 60, color: "var(--ink-faint)" }}>
          {isEn ? "Loading…" : "加载中…"}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <InkNav active="blog" />
        <div className="ink-page-wrap" style={{ paddingTop: 110, paddingBottom: 60, color: "var(--cinnabar)" }}>
          {error}
        </div>
      </div>
    );
  }

  const INITIAL_SHOW = 5;

  return (
    <div className="min-h-screen">
      <InkNav active="blog" />
      <main className="ink-page-wrap" style={{ paddingBottom: 40 }}>
        <div className="ink-kicker">{isEn ? "Writing · Archive" : "文 章 · 档 案"}</div>
        <h1 className="ink-art-title">{isEn ? "Latest Posts" : "最新文章"}</h1>
        <p className="ink-blog-lead">
          {isEn
            ? "Notes on engineering, design patterns, and shipping AI applications — from study notes (2019) to production practice."
            : "工程化、设计模式与 AI 应用开发的实践记录——从 2019 年的学习笔记到今天的落地实践。"}
        </p>

        {/* stats band */}
        <div className="ink-astats">
          <div className="ink-astat">
            <div className="v">{stats.total}</div>
            <div className="l">{isEn ? "posts" : "篇文章"}</div>
          </div>
          <div className="ink-astat">
            <div className="v">{(stats.words / 10000).toFixed(1)}w</div>
            <div className="l">{isEn ? "chars total" : "字"}</div>
          </div>
          <div className="ink-astat">
            <div className="v">{stats.span}</div>
            <div className="l">{isEn ? "time span" : "时间跨度"}</div>
          </div>
          <div className="ink-astat">
            <div className="v">{stats.published}</div>
            <div className="l">{isEn ? "featured" : "已发布精选"}</div>
          </div>
        </div>

        {/* year brush bars */}
        <div className="ink-ybars">
          {yearSet.map((y) => {
            const count = yearCounts[y] || 0;
            const max = Math.max(1, ...Object.values(yearCounts));
            return (
              <button
                key={y}
                type="button"
                className={`ink-ybar ${year === y ? "on" : ""}`}
                onClick={() => setYear(y)}
              >
                <span className="bar" style={{ height: `${Math.max(6, Math.round((count / max) * 58))}px` }} />
                <span className="n">{count}</span>
                <span className="y">{y}</span>
              </button>
            );
          })}
          <button type="button" className={`ink-yall ${year === "all" ? "on" : ""}`} onClick={() => setYear("all")}>
            {isEn ? "All" : "全部"} · {stats.total}
          </button>
        </div>

        {/* tag chips */}
        <div className="ink-fbar">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {tagSet.map((code) => (
              <button
                key={code}
                type="button"
                className={`ink-chip ${tag === code ? "on" : ""}`}
                onClick={() => setTag(code)}
              >
                {code === "all"
                  ? isEn
                    ? "All"
                    : "全部"
                  : (isEn ? TAG_LABELS[code]?.en : TAG_LABELS[code]?.zh) || code}
              </button>
            ))}
          </div>
        </div>

        {/* search + publish toggle */}
        <div className="ink-fbar" style={{ marginTop: 0 }}>
          <input
            className="ink-search"
            type="search"
            value={q}
            placeholder={isEn ? "Search title / summary…" : "搜索标题 / 摘要…"}
            onChange={(e) => setQ(e.target.value)}
          />
          <span
            className={`ink-pubtoggle ${pubOnly ? "on" : ""}`}
            role="switch"
            aria-checked={pubOnly}
            tabIndex={0}
            onClick={() => setPubOnly((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setPubOnly((v) => !v);
            }}
          >
            <span className="sw" />
            <span>{isEn ? "Published only" : "仅看已发布"}</span>
          </span>
          <span className="ink-fcount">
            {isEn
              ? `${filtered.length} posts · ~${filtered
                  .reduce((s, p) => s + (wordCounts[p.id] || 0), 0)
                  .toLocaleString()} chars`
              : `共 ${filtered.length} 篇 · 约 ${filtered
                  .reduce((s, p) => s + (wordCounts[p.id] || 0), 0)
                  .toLocaleString()} 字`}
          </span>
        </div>

        {/* featured (only in default view) */}
        {tag === "all" && year === "all" && !pubOnly && !q.trim() && featured.big && (
          <>
            <div className="ink-yr-head" style={{ marginTop: 38 }}>
              <span className="yy">{isEn ? "Featured" : "精选文章"}</span>
              <span className="yc">{isEn ? "published" : "已发布"}</span>
              <span className="yl" />
            </div>
            <div className="ink-feat-grid">
              <a className="ink-feat-big" href={linkFor(featured.big)}>
                <span className="fb-tag">{getPageTagInfo(featured.big).label || "—"}</span>
                <h3>{extractTitle(featured.big, featured.big.content_markdown)}</h3>
                <p>
                  {(isEn ? summaryEnOf(featured.big) : "") || summaryOf(featured.big) || "—"}
                </p>
                <div className="ink-feat-meta">
                  <span>{(getEffectiveDate(featured.big) || "").slice(0, 10)}</span>
                  <span>
                    {(wordCounts[featured.big.id] || 0).toLocaleString()}
                    {isEn ? " chars" : " 字"}
                  </span>
                </div>
              </a>
              <div className="ink-feat-side">
                {featured.rest.map((p) => (
                  <a className="ink-feat-item" key={p.id} href={linkFor(p)}>
                    <div className="fi-t">{extractTitle(p, p.content_markdown)}</div>
                    <div className="fi-m">
                      <span>{(getEffectiveDate(p) || "").slice(0, 10)}</span>
                      <span>{getPageTagInfo(p).label || "—"}</span>
                      <span>
                        {(wordCounts[p.id] || 0).toLocaleString()}
                        {isEn ? " chars" : " 字"}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {/* archive groups */}
        <div className="ink-yr-head">
          <span className="yy">{isEn ? "Archive" : "全部档案"}</span>
          <span className="yc">{isEn ? "drafts included" : "含写作中的草稿"}</span>
          <span className="yl" />
        </div>
        {groups.length === 0 && (
          <div className="ink-empty">
            <span className="zi">{isEn ? "∅" : "空"}</span>
            {isEn ? "No matching posts" : "未找到匹配的文章"}
          </div>
        )}
        {groups.map(({ year: gy, items }) => {
          const expanded = expandedYears[gy] ?? false;
          const shown = expanded ? items : items.slice(0, INITIAL_SHOW);
          const hidden = items.length - INITIAL_SHOW;
          return (
            <div key={gy}>
              <div className="ink-yr-head">
                <span className="yy">{gy}</span>
                <span className="yc">{items.length}</span>
                <span className="yl" />
              </div>
              {shown.map((p) => {
                const published = getStatus(p) === "Published";
                return (
                  <a className="ink-row" key={p.id} href={linkFor(p)}>
                    <span className="r-date">{(getEffectiveDate(p) || "").slice(0, 10)}</span>
                    <span className="r-title">{extractTitle(p, p.content_markdown)}</span>
                    <span className="r-tag">{getPageTagInfo(p).label || "—"}</span>
                    <span className="r-words">
                      {(wordCounts[p.id] || 0).toLocaleString()}
                      {isEn ? " chars" : " 字"}
                    </span>
                    <span className={`r-badge ${published ? "pub" : ""}`}>
                      {published ? (isEn ? "PUBLISHED" : "已发布") : isEn ? "DRAFT" : "草稿"}
                    </span>
                  </a>
                );
              })}
              {items.length > INITIAL_SHOW && (
                <button type="button" className="ink-expand" onClick={() => toggleYear(gy)}>
                  {expanded
                    ? isEn
                      ? "Collapse ↑"
                      : "收起 ↑"
                    : isEn
                      ? `Show ${hidden} more ↓`
                      : `展开更多 ${hidden} 篇 ↓`}
                </button>
              )}
            </div>
          );
        })}
      </main>
      <InkFooter />
    </div>
  );
};

export default function ArticleList() {
  return (
    <ThemeProvider>
      <InkProvider>
        <ArticleListInner />
      </InkProvider>
    </ThemeProvider>
  );
}
