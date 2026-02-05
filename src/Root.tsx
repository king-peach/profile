import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import App from "./App";
import ArticleDetail from "./pages/ArticleDetail";
import ArticleList from "./pages/ArticleList";
import SEO from "./components/SEO";
import { HOME_SEO, ARTICLES_SEO, getCanonicalUrl, SITE_URL } from "./config/seo";

type Route = { name: "home" } | { name: "article"; slug: string } | { name: "articles" };

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
  const p = window.location.pathname;
  const article = match(p, "/article/:slug");
  if (article) return { name: "article", slug: article.slug };
  if (p === "/articles") return { name: "articles" };
  return { name: "home" };
}

export default function Root() {
  const [route, setRoute] = useState<Route>(getRoute());
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

  // 如果是文章详情页，不在这里渲染 SEO（由 ArticleDetail 处理）
  if (route.name === "article") {
    return <ArticleDetail slug={route.slug} />;
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
      {route.name === "articles" ? <ArticleList /> : <App />}
    </>
  );
}
