import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import {
  InkProvider,
  InkNav,
  InkFooter,
  InkReveal,
  InkSectionHead,
  useInk,
  EN_STAMP_SVG,
} from "./styles/ink";
import "./styles/ink.css";

const sections = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Blog" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

/* ---------- Hooks: scroll reveal for ink home ---------- */
function useInkReveal(): React.RefObject<HTMLDivElement> {
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1 }
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
  return ref;
}

/* ============================================================
   Hero
   ============================================================ */
const Hero: React.FC = () => {
  const { t } = useTranslation();
  const { inkLang } = useInk();
  const isEn = inkLang === "en";

  return (
    <header className="ink-hero ink-wrap">
      <div>
        <div className="ink-kicker">
          {isEn ? "AI Application Developer · Changsha, China" : "AI 应用开发工程师 · 现居长沙"}
        </div>
        <h1
          className="ink-hero-title"
          dangerouslySetInnerHTML={{
            __html: isEn
              ? "Engineering<br/>as the <span class='brush'>ink</span>,<br/><span class='red'>AI</span> into <span class='brush'>products</span>"
              : "以工程化<br/>为<span class='brush'>墨</span>，<br/>落<span class='red'>AI</span>于<span class='brush'>产品</span>",
          }}
        />
        <p
          className="ink-hero-sub"
          dangerouslySetInnerHTML={{
            __html: isEn
              ? "<b>7 years of frontend architecture → AI application development.</b> From Prompt Engineering to Agent design, from API integration to product delivery — I turn AI capability into <b>shipped applications</b>."
              : "<b>7 年前端架构 → AI 应用开发</b>。从 Prompt Engineering 到 Agent 构建，从 API 对接到产品交付——不做 Demo 式玩具，只做<b>可上线的 AI 应用</b>。",
          }}
        />
        <div className="ink-hero-ctas">
          <a className="ink-btn ink-btn-ink" href="#projects">
            {isEn ? "View Works" : "观其作品"}
          </a>
          <a className="ink-btn ink-btn-line" href="#contact">
            {isEn ? "Work With Me" : "与之共事"}
          </a>
        </div>
      </div>
      <div className="ink-hero-vertical">
        {isEn ? "Frontend → AI · End-to-End Delivery" : "七年前端 · 全链路交付 · 工程化思维"}
      </div>
      <div className="ink-hero-seal-big">
        {isEn ? (
          EN_STAMP_SVG
        ) : (
          <span dangerouslySetInnerHTML={{ __html: "落地<br/>为要" }} />
        )}
      </div>
    </header>
  );
};

/* ============================================================
   Facts strip
   ============================================================ */
const Facts: React.FC = () => {
  const { t } = useTranslation();
  const facts = t("hero.proofs", { returnObjects: true }) as {
    value: string;
    label: string;
    detail: string;
  }[];
  if (!Array.isArray(facts)) return null;
  return (
    <section className="ink-section" id="proofs" style={{ paddingTop: 40 }}>
      <div className="ink-wrap reveal">
        <div className="ink-facts">
          {facts.map((f) => (
            <div className="ink-fact" key={f.label}>
              <div className="v">{f.value}</div>
              <div className="l">{f.label}</div>
              <div className="d">{f.detail}</div>
            </div>
            ))}
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   Experience — from i18n experience.items
   ============================================================ */
const Experience: React.FC = () => {
  const { t } = useTranslation();
  const { inkLang } = useInk();
  const items = t("experience.companies", { returnObjects: true }) as {
    company: string;
    role: string;
    period: string;
    desc: string;
    responsibilities: string[];
    achievements: string[];
    tech: string[];
  }[];
  if (!Array.isArray(items)) return null;
  const isEn = inkLang === "en";

  return (
    <section className="ink-section" id="experience">
      <div className="ink-wrap">
        <InkReveal>
          <InkSectionHead
            num={isEn ? "I" : "壹"}
            title={isEn ? "工作经历" : "工作经历"}
            en="Experience"
          />
        </InkReveal>
        <InkReveal>
          <div>
            {items.map((item) => (
              <div className="ink-xp" key={item.company}>
                <div className="ink-xp-when">{item.period.replace(/(\d{4})\.(\d{2})/g, "$1.$2")}</div>
                <div>
                  <h3>{item.company}</h3>
                  <div className="role">{item.role}</div>
                  <p className="desc">{item.desc}</p>
                  <ul>
                    {item.achievements.slice(0, 4).map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                  <div className="tags">
                    {item.tech.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InkReveal>
      </div>
    </section>
  );
};

/* ============================================================
   Projects — i18n projects.items, architecture images switch by lang
   ============================================================ */
const Projects: React.FC = () => {
  const { t } = useTranslation();
  const { inkLang } = useInk();
  const isEn = inkLang === "en";
  const projects = t("projects.items", { returnObjects: true }) as {
    name: string;
    role?: string;
    summary?: string;
    description: string;
    highlights: string[];
    metrics?: string[];
    tools: string[];
    link?: string;
    linkText?: string;
    image: string;
    imageZh?: string;
  }[];
  if (!Array.isArray(projects)) return null;

  const nums = isEn ? ["I", "II", "III"] : ["壹", "贰", "叁"];
  // Title split: last phrase in cinnabar (sketch style p1_t etc.)
  const titleHtml = (name: string) => {
    if (!isEn) {
      if (name.includes("分布式推理平台")) return "企业级 AI 训练与<br/><span class='red'>分布式推理平台</span>";
      if (name.includes("数据标注与合成平台")) return "Long CoT 思维链<br/><span class='red'>数据标注与合成平台</span>";
      if (name.includes("Python→C/C++")) return "ForgeC — AI 驱动的<br/><span class='red'>Python→C/C++ 转译引擎</span>";
      return name;
    }
    if (name.includes("Distributed Inference")) return "Enterprise AI Training &<br/><span class='red'>Distributed Inference Platform</span>";
    if (name.includes("Annotation & Synthesis")) return "Long CoT Data<br/><span class='red'>Annotation & Synthesis Platform</span>";
    if (name.includes("Transpilation")) return "ForgeC — AI-Powered<br/><span class='red'>Python→C/C++ Transpilation Engine</span>";
    return name;
  };

  return (
    <section className="ink-section" id="projects">
      <div className="ink-wrap">
        <InkReveal>
          <InkSectionHead num={isEn ? "II" : "贰"} title={isEn ? "Selected Works" : "代表项目"} en="Selected Works" />
        </InkReveal>
        <InkReveal>
          <div>
            {projects.map((project, index) => {
              const img = isEn ? project.image : project.imageZh || project.image;
              const isExternal = /^https?:\/\//.test(project.link || "");
              return (
                <article className="ink-proj" key={project.name}>
                  <div className="ink-proj-img">
                    <img src={img} alt={project.name} loading="lazy" />
                  </div>
                  <div>
                    <div className="ink-proj-no">{nums[index] || index + 1}</div>
                    <h3 dangerouslySetInnerHTML={{ __html: titleHtml(project.name) }} />
                    {project.role && <p className="proj-role">{project.role}</p>}
                    <p>{project.description}</p>
                    <ul>
                      {project.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                    <div className="tools">
                      {project.tools.map((tool) => (
                        <span key={tool}>{tool}</span>
                      ))}
                    </div>
                    {project.link && (
                      <a
                        className={`ink-proj-link ${isEn ? "" : "upwork-only"}`}
                        href={project.link}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noreferrer" : undefined}
                      >
                        {isEn ? "View on Upwork" : "在 Upwork 查看"}
                        {isEn ? " ↗" : " ↗"}
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </InkReveal>
        {/* keep zh hidden per sketch (zh users come for content, not upwork) */}
        {false && null}
      </div>
    </section>
  );
};

/* ============================================================
   Blog section (home) — reuses Notion static data pipeline
   ============================================================ */
type NotionPage = {
  object: string;
  id: string;
  url?: string;
  urlSlug?: string;
  created_time?: string;
  last_edited_time?: string;
  properties?: Record<string, any>;
};

function extractTitle(p: NotionPage): string {
  const props = p.properties || {};
  for (const key of Object.keys(props)) {
    const prop = props[key];
    if (prop?.type === "title" && Array.isArray(prop.title) && prop.title.length > 0) {
      return prop.title.map((x: any) => x.plain_text).join("") || "Untitled";
    }
  }
  return "Untitled";
}
function extractRichText(prop?: any): string {
  if (!prop || prop.type !== "rich_text") return "";
  return prop.rich_text?.map((x: any) => x.plain_text).join("") || "";
}
function extractText(prop?: any): string {
  if (!prop) return "";
  if (prop.type === "rich_text") return prop.rich_text?.map((x: any) => x.plain_text).join("") || "";
  if (prop.type === "title") return prop.title?.map((x: any) => x.plain_text).join("") || "";
  return "";
}
function extractDate(prop?: any): string | null {
  if (!prop || prop.type !== "date" || !prop.date?.start) return null;
  return prop.date.start;
}
function getEffectiveDate(page: NotionPage): string | null {
  const props = page.properties || {};
  const dp =
    props["PublishDate"] || props["发布日期"] || props["日期"] || props["Date"];
  return extractDate(dp) || page.last_edited_time || page.created_time || null;
}
function extractMultiSelect(prop?: any): { name: string; color: string }[] {
  if (!prop || prop.type !== "multi_select") return [];
  return prop.multi_select?.map((s: any) => ({ name: s.name || "", color: s.color || "default" })) || [];
}

const HomeBlog: React.FC = () => {
  const { t } = useTranslation();
  const { inkLang } = useInk();
  const isEn = inkLang === "en";
  const [articles, setArticles] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/data/articles.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        if (!alive) return;
        const pages: NotionPage[] = (json.results || []).filter((p: NotionPage) => p.object === "page");
        pages.sort((a: NotionPage, b: NotionPage) => {
          const ta = new Date(getEffectiveDate(a) || 0).getTime();
          const tb = new Date(getEffectiveDate(b) || 0).getTime();
          return tb - ta;
        });
        setArticles(pages.slice(0, 4));
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const meta = (a: NotionPage) => {
    const props = a.properties || {};
    const slugTitle = extractText(props["slug"] || props["Slug"] || props["SLUG"]);
    const title = (isEn ? slugTitle : "") || extractTitle(a);
    const summary = extractRichText(props["summary"] || props["摘要"] || props["Summary"] || props["描述"] || props["Description"]);
    const summaryEn = extractText(props["summaryEn"] || props["SummaryEn"] || props["SummaryEN"]);
    const tags = extractMultiSelect(props["标签"] || props["Tags"] || props["tags"]);
    const date = getEffectiveDate(a);
    return { title, summary: (isEn && summaryEn) || summary, tags, date: date ? date.slice(0, 10) : "" };
  };

  const navigate = (target: string) => {
    if ((window as any).navigateTo) (window as any).navigateTo(target);
    else window.location.href = target;
  };

  return (
    <section className="ink-section" id="blog">
      <div className="ink-wrap">
        <InkReveal>
          <InkSectionHead
            num={isEn ? "III" : "叁"}
            title={t("blog.header")}
            en="Writing"
            more={
              <a
                className="ink-sec-more"
                href="#blog"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/articles?lang=${inkLang}&theme=${document.documentElement.getAttribute("data-theme") || "light"}`);
                }}
              >
                {isEn ? "All Posts →" : "全部文章 →"}
              </a>
            }
          />
        </InkReveal>
        <InkReveal>
          <div className="ink-posts">
            {loading && <div className="ink-post" style={{ gridTemplateColumns: "1fr" }}>{isEn ? "Loading…" : "加载中…"}</div>}
            {!loading &&
              articles.map((a) => {
                const { title, summary, tags, date } = meta(a);
                return (
                  <div
                    className="ink-post"
                    key={a.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => a.urlSlug && navigate(`/article/${encodeURIComponent(a.urlSlug)}`)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && a.urlSlug) {
                        e.preventDefault();
                        navigate(`/article/${encodeURIComponent(a.urlSlug)}`);
                      }
                    }}
                  >
                    <span className="date">{date}</span>
                    <span className="t">{title}</span>
                    <span className="cat">{tags[0]?.name || (isEn ? "Note" : "笔记")}</span>
                    <span style={{ display: "none" }}>{summary}</span>
                  </div>
                );
              })}
          </div>
        </InkReveal>
      </div>
      {false && <span>{t("blog.lead")}</span>}
    </section>
  );
};

/* ============================================================
   About
   ============================================================ */
const About: React.FC = () => {
  const { t } = useTranslation();
  const { inkLang } = useInk();
  const isEn = inkLang === "en";
  const cards = t("about.cards", { returnObjects: true }) as { title: string; description: string }[];
  if (!Array.isArray(cards)) return null;

  return (
    <section className="ink-section" id="about">
      <div className="ink-wrap">
        <InkReveal>
          <InkSectionHead num={isEn ? "IV" : "肆"} title={t("about.header")} en="About" />
        </InkReveal>
        <InkReveal>
          <div className="ink-about">
            <div>
              <div
                className="lead"
                dangerouslySetInnerHTML={{
                  __html: isEn
                    ? "Turning <span class='red'>AI capability into products</span>,<br/>solving real business problems with engineering discipline."
                    : "擅长把 AI 能力<span class='red'>落地成产品</span>，<br/>以工程化思维解决真实业务问题。",
                }}
              />
              <p>{t("about.para1")}</p>
              <p>{t("about.para2")}</p>
            </div>
            <div className="ink-pillars">
              {cards.map((c, i) => (
                <div className="ink-pillar" key={c.title}>
                  <span className="zi">{isEn ? ["A", "B", "C"][i] || "•" : ["思", "基", "全"][i] || "•"}</span>
                  <div className="t">{c.title}</div>
                  <div className="d">{c.description}</div>
                </div>
              ))}
            </div>
          </div>
        </InkReveal>
      </div>
    </section>
  );
};

/* ============================================================
   Contact
   ============================================================ */
const Contact: React.FC = () => {
  const { inkLang } = useInk();
  const isEn = inkLang === "en";
  return (
    <section className="ink-contact" id="contact">
      <div className="ink-wrap reveal in">
        <div className="zen">{isEn ? "CRAFT · SHIP · WIN" : "见 字 如 面 · 合 作 共 赢"}</div>
        <h2
          dangerouslySetInnerHTML={{
            __html: isEn
              ? "Have an AI application<br/><span class='red'>to ship?</span>"
              : "有一个 AI 应用<br/><span class='red'>要落地？</span>",
          }}
        />
        <p className="sub">
          {isEn
            ? "Open to full-time opportunities, project collaboration, and technical exchange. I usually reply within 1-2 days."
            : "可沟通全职机会，也欢迎项目合作与技术交流。默认 1-2 天内回复。"}
        </p>
        <div className="ink-hero-ctas" style={{ justifyContent: "center" }}>
          <a className="ink-btn ink-btn-ink" href="mailto:hello@linxianglive.cn">
            {isEn ? "Get in Touch" : "联系我"}
          </a>
          <a className="ink-btn ink-btn-line" href="https://github.com/king-peach" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
        <div className="ink-contact-links">
          <a href="https://github.com/king-peach" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href="https://www.yuque.com/wpeach" target="_blank" rel="noreferrer">{isEn ? "Yuque ↗" : "语雀 ↗"}</a>
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   App — ink home
   ============================================================ */
function InkHome() {
  const revealRef = useInkReveal();
  return (
    <div ref={revealRef}>
      <Hero />
      <Facts />
      <Experience />
      <Projects />
      <HomeBlog />
      <About />
      <Contact />
    </div>
  );
}

function InkShell({ children }: { children: React.ReactNode }) {
  const { setDark } = useTheme();
  // Bridge ink theme state into legacy ThemeContext so any legacy consumers stay consistent
  useEffect(() => {
    (window as any).__inkLegacySetDark = (d: boolean) => setDark(d);
  }, [setDark]);
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <InkProvider>
        <InkShell>
          <div className="min-h-screen overflow-x-hidden">
            <InkNav />
            <InkHome />
            <InkFooter />
          </div>
        </InkShell>
      </InkProvider>
    </ThemeProvider>
  );
}

export { sections };
