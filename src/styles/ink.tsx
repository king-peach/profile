import type React from "react";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useTheme as useLegacyTheme } from "../components/ThemeContext";

/* ============================================================
   Ink shared state: theme (light/dark) + language (zh/en)
   Mirrors sketch behavior: URL param > localStorage > default,
   plus cross-page sync via URL params (lang & theme in links).
   ============================================================ */

export type InkTheme = "light" | "dark";
export type InkLang = "zh" | "en";

type InkState = {
  inkTheme: InkTheme;
  inkLang: InkLang;
  toggleInkTheme: () => void;
  toggleInkLang: () => void;
};

const InkContext = createContext<InkState | undefined>(undefined);

export function getInkThemeFromEnv(): InkTheme {
  try {
    const qp = new URLSearchParams(window.location.search);
    const fromUrl = qp.get("theme");
    if (fromUrl === "dark" || fromUrl === "light") return fromUrl;
    const stored = localStorage.getItem("ink_theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* noop */
  }
  return "light";
}

export function getInkLangFromEnv(): InkLang {
  try {
    const qp = new URLSearchParams(window.location.search ? window.location.search : "");
    const fromUrl = qp.get("lang");
    if (fromUrl === "en" || fromUrl === "zh") return fromUrl;
    const stored = localStorage.getItem("ink_lang");
    if (stored === "en" || stored === "zh") return stored;
    const i18nStored = localStorage.getItem("language");
    if (i18nStored === "en" || i18nStored === "zh") return i18nStored;
  } catch {
    /* noop */
  }
  return "zh";
}

export const InkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inkTheme, setInkTheme] = useState<InkTheme>(getInkThemeFromEnv);
  const [inkLang, setInkLang] = useState<InkLang>(getInkLangFromEnv);
  const { i18n } = useTranslation();

  // Reflect ink theme onto <html> and keep legacy ThemeContext dark mode in sync
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", inkTheme);
    document.documentElement.classList.add("ink");
    try {
      localStorage.setItem("ink_theme", inkTheme);
    } catch {
      /* noop */
    }
    const legacy = (window as any).__inkLegacySetDark as ((d: boolean) => void) | undefined;
    if (legacy) legacy(inkTheme === "dark");
  }, [inkTheme]);

  // Reflect ink lang into i18next + <html lang>
  useEffect(() => {
    document.documentElement.setAttribute("lang", inkLang === "en" ? "en" : "zh-CN");
    if (i18n.language !== inkLang) {
      void i18n.changeLanguage(inkLang);
    }
    try {
      localStorage.setItem("ink_lang", inkLang);
      localStorage.setItem("language", inkLang);
    } catch {
      /* noop */
    }
  }, [inkLang, i18n]);

  const toggleInkTheme = useCallback(() => {
    setInkTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const toggleInkLang = useCallback(() => {
    setInkLang((l) => (l === "en" ? "zh" : "en"));
  }, []);

  return (
    <InkContext.Provider value={{ inkTheme, inkLang, toggleInkTheme, toggleInkLang }}>
      {children}
    </InkContext.Provider>
  );
};

export function useInk(): InkState {
  const ctx = useContext(InkContext);
  if (!ctx) throw new Error("useInk must be used within InkProvider");
  return ctx;
}

/* Re-apply data-theme attribute (for SSR-ish initial paint and route switches). */
export function useInkHtmlAttr(): void {
  const { inkTheme } = useInk();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", inkTheme);
  }, [inkTheme]);
}

/* ============================================================
   InkNav — sticky top navigation shared by all ink pages
   ============================================================ */

export const ICON_MOON = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const ICON_SUN = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M4.8 4.8l1.6 1.6M17.6 17.6l1.6 1.6M19.2 4.8l-1.6 1.6M6.4 17.6l-1.6 1.6" />
  </svg>
);

const EN_STAMP_SVG = (
  <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <path id="stampArc" d="M 60,60 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
    </defs>
    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="3.5" />
    <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <text fontFamily="Georgia, serif" fontSize="11.5" letterSpacing="2.2" fill="currentColor">
      <textPath href="#stampArc" startOffset="10%">
        SHIP · DELIVER · ITERATE ·
      </textPath>
    </text>
    <text x="60" y="58" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold" fontSize="14.5" fill="currentColor">
      ERIC WANG
    </text>
    <text x="60" y="75" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" letterSpacing="2.5" fill="currentColor">
      EST. 2018
    </text>
  </svg>
);

export const InkNav: React.FC<{ active?: string }> = ({ active }) => {
  const { inkTheme, inkLang, toggleInkTheme, toggleInkLang } = useInk();
  const { t } = useTranslation();
  const isEn = inkLang === "en";

  // Append current lang/theme to cross-page links so state survives navigation
  const hrefWithState = (path: string) => `${path}?lang=${inkLang}&theme=${inkTheme}`;

  const items: { key: string; href: string; label: string }[] = [
    { key: "experience", href: hrefWithState("/#experience"), label: t("nav.experience") },
    { key: "projects", href: hrefWithState("/#projects"), label: t("nav.projects") },
    { key: "blog", href: hrefWithState("/articles"), label: t("nav.blog") },
    { key: "about", href: hrefWithState("/#about"), label: t("nav.about") },
    { key: "contact", href: hrefWithState("/#contact"), label: t("nav.contact") },
  ];

  return (
    <nav className="ink-nav">
      <div className="ink-wrap">
        <a className="ink-brand" href={hrefWithState("/")}>
          <img className="ink-brand-ico" src="/eric.ico" alt="Eric Wang" />
          <span>
            <span className="ink-brand-name" style={{ display: "block" }}>
              {isEn ? "Eric Wang" : "王涛作品集"}
            </span>
            <span className="ink-brand-sub" style={{ display: "block" }}>
              AI APPLICATION · PORTFOLIO
            </span>
          </span>
          {/* English seal kept in nav context for hero use; hidden here */}
          <span style={{ display: "none" }}>{EN_STAMP_SVG}</span>
        </a>
        <ul>
          {items.map((it) => (
            <li key={it.key}>
              <a href={it.href} style={active === it.key ? { color: "var(--ink)" } : undefined}>
                {it.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ink-nav-tools">
          <button
            type="button"
            className="ink-tool-btn"
            title="切换语言 / Switch language"
            aria-label="切换语言"
            onClick={toggleInkLang}
          >
            {isEn ? "中" : "EN"}
          </button>
          <button
            type="button"
            className="ink-tool-btn"
            title="切换明暗 / Toggle theme"
            aria-label="切换明暗"
            onClick={toggleInkTheme}
          >
            {inkTheme === "dark" ? ICON_SUN : ICON_MOON}
          </button>
        </div>
      </div>
    </nav>
  );
};

/* ============================================================
   InkFooter
   ============================================================ */

export const InkFooter: React.FC = () => {
  const { inkLang } = useInk();
  return (
    <footer className="ink-footer">
      <div className="ink-wrap">
        <span>{inkLang === "en" ? "© 2025 Eric Wang · AI Application Developer" : "© 2025 王涛 · AI 应用开发工程师"}</span>
        <span>{inkLang === "en" ? "Real knowledge comes from practice" : "纸上得来终觉浅 · 绝知此事要躬行"}</span>
      </div>
    </footer>
  );
};

/* ============================================================
   Reveal — IntersectionObserver-based reveal wrapper
   ============================================================ */

export const InkReveal: React.FC<{ children: ReactNode; className?: string; as?: keyof JSX.IntrinsicElements }> = ({
  children,
  className = "",
}) => {
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
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
    io.observe(node);
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
};

export const InkSectionHead: React.FC<{ num: string; title: string; en: string; more?: ReactNode }> = ({
  num,
  title,
  en,
  more,
}) => (
  <div className="ink-sec-head">
    <span className="ink-sec-title">
      <span className="num">{num}</span>
      {title}
    </span>
    <span className="ink-sec-en">{en}</span>
    <span className="ink-sec-line" />
    {more}
  </div>
);

export { EN_STAMP_SVG };
