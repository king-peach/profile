import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import App from "./App";
import SEO from "./components/SEO";
import { HOME_SEO, ARTICLES_SEO, WORLDCUP_SEO, getCanonicalUrl, SITE_URL } from "./config/seo";
import type ArticleDetailComponent from "./pages/ArticleDetail";
import type ArticleListComponent from "./pages/ArticleList";

type Route = { name: "home" } | { name: "article"; slug: string } | { name: "articles" } | { name: "worldcup" };

function match(path: string, pattern: string): Record<string, string> | null {
  const names: string[] = [];
  const re = new RegExp(
    "^" +
      pattern
        .replace(/([.*+?^${}()|\[\]\\])/g, "\\$1")
        .replace(/:(\w+)/g, (_: string, n: string) => {
          names.push(n);
          return "([^/]+)";
        }) +
      "$"
  );
  const m = path.match(re);
  if (!m) return null;
  const params: Record<string, string> = {};
  names.forEach((n, i) => (params[n] = decodeURIComponent(m[i + 1])));
  return params;
}

function getRoute(): Route {
  const p = window.location.pathname.replace(/\/+$/, "") || "/";
  if (p === "/worldcup") return { name: "worldcup" };
  const article = match(p, "/article/:slug");
  if (article) return { name: "article", slug: article.slug };
  if (p === "/articles") return { name: "articles" };
  return { name: "home" };
}

function RouteLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-background/80 px-5 py-3 shadow-sm backdrop-blur">
        <div className="relative h-6 w-6">
          <div className="absolute inset-0 rounded-full border-2 border-foreground/20 border-t-transparent animate-spin" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] opacity-60">Eric Wang</div>
          <div className="text-sm font-medium">{label}</div>
        </div>
      </div>
    </div>
  );
}

type ArticleDetailModule = typeof ArticleDetailComponent;
type ArticleListModule = typeof ArticleListComponent;
type WorldCupModule = typeof import("./pages/WorldCup").default;

export default function Root() {
  const [route, setRoute] = useState<Route>(getRoute());
  const [ArticleDetailPage, setArticleDetailPage] = useState<ArticleDetailModule | null>(null);
  const [ArticleListPage, setArticleListPage] = useState<ArticleListModule | null>(null);
  const [WorldCupPage, setWorldCupPage] = useState<WorldCupModule | null>(null);
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("en") ? "en" : "zh";
  const locale = lang === "zh" ? "zh_CN" : "en_US";

  // 获取当前路由的 SEO 配置
  const seoConfig = useMemo(() => {
    if (route.name === "home") {
      return HOME_SEO[lang];
    }
    if (route.name === "articles") {
      return ARTICLES_SEO[lang];
    }
    if (route.name === "worldcup") {
      return WORLDCUP_SEO[lang];
    }
    // 文章详情页的 SEO 由 ArticleDetail 组件内部处理
    return null;
  }, [route, lang]);

  // 获取 canonical URL
  const canonicalUrl = useMemo(() => {
    return getCanonicalUrl(window.location.pathname);
  }, [route]);

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    const onRouteChange = () => setRoute(getRoute());
    window.addEventListener("popstate", onPop);
    window.addEventListener("routechange", onRouteChange);
    (window as any).navigateTo = (path: string) => {
      history.pushState({}, "", path);
      window.dispatchEvent(new Event("routechange"));
    };
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("routechange", onRouteChange);
    };
  }, []);

  useEffect(() => {
    if (route.name === "article" && !ArticleDetailPage) {
      import("./pages/ArticleDetail").then((module) => {
        setArticleDetailPage(() => module.default);
      });
    }

    if (route.name === "articles" && !ArticleListPage) {
      import("./pages/ArticleList").then((module) => {
        setArticleListPage(() => module.default);
      });
    }

    if (route.name === "worldcup" && !WorldCupPage) {
      import("./pages/WorldCup").then((module) => {
        setWorldCupPage(() => module.default);
      });
    }
  }, [route.name, ArticleDetailPage, ArticleListPage, WorldCupPage]);

  // 如果是文章详情页，不在这里渲染 SEO（由 ArticleDetail 处理）
  if (route.name === "article") {
    if (!ArticleDetailPage) {
      return <RouteLoading label={t("articles.loading", { defaultValue: "Loading..." })} />;
    }
    return <ArticleDetailPage slug={route.slug} />;
  }

  if (route.name === "worldcup") {
    if (!WorldCupPage) {
      return <RouteLoading label="Loading World Cup..." />;
    }
    return (
      <>
        {seoConfig && (
          <SEO
            title={seoConfig.title}
            description={seoConfig.description}
            keywords={seoConfig.keywords}
            ogImage={seoConfig.ogImage}
            ogType={seoConfig.ogType}
            canonicalUrl={canonicalUrl}
            locale={locale}
            schemaLD={{
              "@context": "https://schema.org",
              "@type": "SportsEvent",
              "name": "2026 FIFA World Cup",
              "description": "2026 FIFA World Cup live scores, schedule, and standings for 48 teams across 12 groups.",
              "url": "https://linxianglive.cn/worldcup",
              "startDate": "2026-06-11",
              "endDate": "2026-07-19",
              "location": {
                "@type": "Place",
                "name": "United States, Canada, Mexico",
                "address": "USA, Canada, Mexico"
              },
              "organizer": {
                "@type": "SportsOrganization",
                "name": "FIFA",
                "url": "https://www.fifa.com"
              },
              "sport": "Football",
              "offers": {
                "@type": "Offer",
                "url": "https://linxianglive.cn/worldcup",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              }
            }}
          />
        )}
        <WorldCupPage />
      </>
    );
  }

  return (
    <>
      {seoConfig && (
        <SEO
          title={seoConfig.title}
          description={seoConfig.description}
          keywords={seoConfig.keywords}
          ogImage={seoConfig.ogImage}
          ogType={seoConfig.ogType}
          canonicalUrl={canonicalUrl}
          locale={locale}
        />
      )}
      {route.name === "articles"
        ? (ArticleListPage ? <ArticleListPage /> : <RouteLoading label={t("articles.loading", { defaultValue: "Loading..." })} />)
        : <App />}
    </>
  );
}
