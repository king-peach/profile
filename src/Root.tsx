import React, { useEffect, useState } from "react";
import App from "./App";
import ArticleDetail from "./pages/ArticleDetail";
import ArticleList from "./pages/ArticleList";

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
  if (route.name === "article") return <ArticleDetail slug={route.slug} />;
  if (route.name === "articles") return <ArticleList />;
  return <App />;
}