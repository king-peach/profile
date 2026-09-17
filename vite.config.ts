import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import type { Plugin } from "vite";
import { Client } from "@notionhq/client";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

// Notion API 代理插件
function notionProxyPlugin(): Plugin {
  return {
    name: "notion-proxy",
    configureServer(server) {
      // 在 configureServer 中初始化 Notion Client
      const env = loadEnv('development', process.cwd(), '');
      const apiKey = env.NOTION_API_KEY || process.env.NOTION_API_KEY;
      let notion: Client | null = null;
      
      // 配置代理
      const proxyUrl = env.HTTPS_PROXY || env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7890';
      const agent = new HttpsProxyAgent(proxyUrl);
      
      // 创建支持代理的 fetch 函数
      const proxyFetch = (url: any, init?: any) => {
        return fetch(url, { ...init, agent });
      };
      
      if (apiKey) {
        notion = new Client({ auth: apiKey, fetch: proxyFetch as any });
        console.log("[Notion Proxy] Client initialized with key:", apiKey.slice(0, 10) + "...");
        console.log("[Notion Proxy] Using proxy:", proxyUrl);
      } else {
        console.warn("[Notion Proxy] NOTION_API_KEY not found");
      }
      // 搜索接口
      server.middlewares.use("/api/notion/search", async (req, res) => {
        if (!notion) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "NOTION_API_KEY not configured" }));
          return;
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(Buffer.from(chunk));
          }
          const body = chunks.length > 0 ? JSON.parse(Buffer.concat(chunks).toString("utf-8")) : {};

          console.log("[Notion Proxy] Search request:", JSON.stringify(body));

          const result = await notion.search(body);

          console.log("[Notion Proxy] Search success, results:", result.results?.length || 0);

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result));
        } catch (error: any) {
          console.error("[Notion Proxy] Search error:", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error.message || "Search failed" }));
        }
      });

      // 获取页面接口
      server.middlewares.use("/api/notion/pages", async (req, res) => {
        if (!notion) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "NOTION_API_KEY not configured" }));
          return;
        }

        try {
          // 从 URL 提取 page_id: /api/notion/pages/:id
          const pageId = req.url?.split("/").filter(Boolean)[0];
          if (!pageId) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing page_id" }));
            return;
          }

          console.log("[Notion Proxy] Get page:", pageId);

          const result = await notion.pages.retrieve({ page_id: pageId });

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result));
        } catch (error: any) {
          console.error("[Notion Proxy] Get page error:", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error.message || "Get page failed" }));
        }
      });

      // 查询数据源接口（支持分页）- Notion SDK v5 使用 dataSources.query
      server.middlewares.use("/api/notion/databases", async (req, res) => {
        if (!notion) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "NOTION_API_KEY not configured" }));
          return;
        }

        try {
          // 从 URL 提取 data_source_id: /api/notion/databases/:id/query
          const parts = req.url?.split("/").filter(Boolean) || [];
          const dataSourceId = parts[0];
          if (!dataSourceId) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing data_source_id" }));
            return;
          }

          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(Buffer.from(chunk));
          }
          const body = chunks.length > 0 ? JSON.parse(Buffer.concat(chunks).toString("utf-8")) : {};

          console.log("[Notion Proxy] Query dataSource:", dataSourceId, JSON.stringify(body));

          // Notion SDK v5: 使用 dataSources.query 替代 databases.query
          const result = await notion.dataSources.query({
            data_source_id: dataSourceId,
            ...body,
          });

          console.log("[Notion Proxy] DataSource query success, results:", result.results?.length || 0);

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result));
        } catch (error: any) {
          console.error("[Notion Proxy] DataSource query error:", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error.message || "DataSource query failed" }));
        }
      });

      // 获取页面内容块接口
      server.middlewares.use("/api/notion/blocks", async (req, res) => {
        if (!notion) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "NOTION_API_KEY not configured" }));
          return;
        }

        try {
          // 从 URL 提取 block_id: /api/notion/blocks/:id/children
          const parts = req.url?.split("/").filter(Boolean) || [];
          const blockId = parts[0];
          if (!blockId) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing block_id" }));
            return;
          }

          console.log("[Notion Proxy] Get blocks:", blockId);

          const result = await notion.blocks.children.list({ block_id: blockId });

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result));
        } catch (error: any) {
          console.error("[Notion Proxy] Get blocks error:", error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error.message || "Get blocks failed" }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), "");
  process.env.NOTION_API_KEY = env.NOTION_API_KEY;

  return {
    test: {
      environment: 'happy-dom', // 模拟浏览器 DOM 环境
      globals: true,           // 支持全局 describe, it, expect
    },
    plugins: [react(), notionProxyPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api/worldcup": {
          target: "https://api.fifa.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/worldcup/, "/api/v3"),
          headers: {
            Origin: "https://www.fifa.com",
            Referer: "https://www.fifa.com/",
          },
        },
      },
    },
    build: {
      modulePreload: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            const bucketByFirstChar = (name: string, prefix: string) => {
              const lang = name.toLowerCase();
              const first = lang.charCodeAt(0);

              if (first >= 97 && first <= 100) return `${prefix}-a-d`;
              if (first >= 101 && first <= 104) return `${prefix}-e-h`;
              if (first >= 105 && first <= 108) return `${prefix}-i-l`;
              if (first >= 109 && first <= 112) return `${prefix}-m-p`;
              if (first >= 113 && first <= 116) return `${prefix}-q-t`;
              return `${prefix}-u-z`;
            };

            const syntaxLanguageMatch = id.match(/react-syntax-highlighter\/dist\/esm\/languages\/prism\/([^/]+)\.js$/);
            if (syntaxLanguageMatch?.[1]) {
              return bucketByFirstChar(syntaxLanguageMatch[1], "syntax-lang");
            }

            const refractorLanguageMatch = id.match(/refractor\/lang\/([^/]+)\.js$/);
            if (refractorLanguageMatch?.[1]) {
              return bucketByFirstChar(refractorLanguageMatch[1], "refractor-lang");
            }

            if (id.includes("react-syntax-highlighter/dist/esm/styles/")) {
              return "syntax-style";
            }

            if (
              id.includes("rehype-raw") ||
              id.includes("rehype-slug") ||
              id.includes("react-syntax-highlighter") ||
              id.includes("refractor")
            ) {
              return "syntax-core";
            }

            if (
              id.includes("react-markdown") ||
              id.includes("remark-gfm") ||
              id.includes("remark-") ||
              id.includes("rehype-") ||
              id.includes("micromark") ||
              id.includes("mdast") ||
              id.includes("hast") ||
              id.includes("unist") ||
              id.includes("vfile") ||
              id.includes("unified") ||
              id.includes("mdurl") ||
              id.includes("character-entities") ||
              id.includes("property-information") ||
              id.includes("decode-named-character-reference") ||
              id.includes("comma-separated-tokens") ||
              id.includes("space-separated-tokens") ||
              id.includes("html-url-attributes")
            ) {
              return "markdown-vendor";
            }

            if (
              id.includes("framer-motion") ||
              id.includes("motion-dom") ||
              id.includes("motion-utils") ||
              id.includes("popmotion")
            ) {
              return "motion-vendor";
            }

            if (id.includes("gsap")) {
              return "gsap-vendor";
            }

            if (id.includes("react-icons")) {
              return "icons-vendor";
            }

            if (id.includes("date-fns")) {
              return "date-vendor";
            }

            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("react-helmet-async") ||
              id.includes("react-i18next") ||
              id.includes("i18next")
            ) {
              return "react-vendor";
            }

            return "vendor";
          },
        },
      },
    },
  };
});
