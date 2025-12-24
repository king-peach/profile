import React, { useEffect, useMemo, useState } from "react";
import { ThemeProvider, useTheme } from "../components/ThemeContext";
import PrismBackground from "../components/ui/PrismBackground";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { format } from "date-fns";

type StrapiImage = {
  data?: {
    attributes?: {
      url?: string;
      alternativeText?: string;
    };
  };
};

type StrapiArticle = {
  id: number;
  attributes: {
    title?: string;
    slug?: string;
    content?: string;
    coverImage?: StrapiImage;
    updatedAt?: string;
    publishedAt?: string;
  };
};

function useArticleBySlug(slug: string | undefined) {
  const [data, setData] = useState<StrapiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      setError(null);
      setData(null);
      if (!slug) {
        setError("缺少文章标识");
        setLoading(false);
        return;
      }
      try {
        const base = import.meta.env.VITE_STRAPI_URL as string | undefined;
        if (!base) {
          throw new Error("未配置 VITE_STRAPI_URL");
        }
        const url = new URL("/api/articles", base);
        url.searchParams.set("filters[slug][$eq]", slug);
        url.searchParams.set("populate", "coverImage");
        const headers: Record<string, string> = {};
        const token = import.meta.env.VITE_STRAPI_TOKEN as string | undefined;
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(url.toString(), { headers });
        if (!res.ok) throw new Error(`请求失败 ${res.status}`);
        const json = await res.json();
        const item: StrapiArticle | undefined = json?.data?.[0];
        if (!item) throw new Error("文章不存在");
        if (active) setData(item);
      } catch (e: any) {
        if (active) setError(e?.message || "加载失败");
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [slug]);

  return { data, loading, error };
}

function HeaderHero({ title, date, coverUrl }: { title?: string; date?: string; coverUrl?: string }) {
  const { accentText, baseText, dark } = useTheme();
  const formatted = useMemo(() => {
    if (!date) return "";
    try {
      return format(new Date(date), "yyyy-MM-dd HH:mm");
    } catch {
      return date;
    }
  }, [date]);

  return (
    <section className="relative mb-10">
      <PrismBackground
        animationType="3drotate"
        timeScale={0.35}
        colorFrequency={0.9}
        glow={1.2}
        bloom={1.2}
        noise={0.2}
        baseHue={210}
        hueRange={22}
        satBase={65}
        satRange={22}
        lumBase={66}
        lumRange={14}
        suspendWhenOffscreen
        className="z-0"
      />
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-10">
        <div className="grid md:grid-cols-[1fr,320px] gap-6 items-center">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight" style={{ color: accentText }}>{title || "文章"}</h1>
            <div className="mt-3 text-sm" style={{ color: baseText }}>{formatted ? `更新于 ${formatted}` : ""}</div>
          </div>
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            {coverUrl ? (
              <img src={coverUrl} alt={title || "cover"} className="w-full h-40 md:h-48 object-cover" />
            ) : (
              <div className="w-full h-40 md:h-48 bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-pink-500/40" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Markdown({ content }: { content?: string }) {
  const { baseText } = useTheme();
  if (!content) return null;
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6">
      <div className="md-content" style={{ color: baseText }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

function ArticleDetailInner({ slug: slugProp }: { slug?: string }) {
  const slug = useMemo(() => {
    if (slugProp) return slugProp;
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[1];
  }, [slugProp]);
  const { data, loading, error } = useArticleBySlug(slug);
  const coverUrl = useMemo(() => {
    const url = data?.attributes?.coverImage?.data?.attributes?.url;
    const base = import.meta.env.VITE_STRAPI_URL as string | undefined;
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    if (base) return new URL(url, base).toString();
    return url;
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-pulse text-sm">加载中…</div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-sm">{error || "未找到文章"}</div>
      </div>
    );
  }

  const a = data.attributes;
  return (
    <div className="min-h-screen" data-page="ArticleDetail">
      <HeaderHero title={a.title} date={a.updatedAt || a.publishedAt} coverUrl={coverUrl} />
      <Markdown content={a.content} />
    </div>
  );
}

export default function ArticleDetail({ slug }: { slug?: string }) {
  return (
    <ThemeProvider>
      <ArticleDetailInner slug={slug} />
    </ThemeProvider>
  );
}