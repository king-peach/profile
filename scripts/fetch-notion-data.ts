/**
 * 构建时获取 Notion 数据
 * 在 build 前运行，将数据保存为静态 JSON 文件
 */

import { Client } from "@notionhq/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载 .env 文件
config({ path: path.resolve(__dirname, "../.env") });

// 配置
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.VITE_NOTION_DATASOURCE_ID;
const OUTPUT_DIR = path.resolve(__dirname, "../public/data");

// 代理配置（开发环境可能需要）
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

async function createNotionClient() {
  if (!NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY 环境变量未设置");
  }

  // 如果需要代理
  if (PROXY_URL) {
    const { HttpsProxyAgent } = await import("https-proxy-agent");
    const fetch = (await import("node-fetch")).default;
    const agent = new HttpsProxyAgent(PROXY_URL);

    return new Client({
      auth: NOTION_API_KEY,
      fetch: ((url: any, init?: any) => fetch(url, { ...init, agent })) as any,
    });
  }

  return new Client({ auth: NOTION_API_KEY });
}

async function fetchAllPages(notion: Client, databaseId: string) {
  const allPages: any[] = [];
  let hasMore = true;
  let startCursor: string | undefined;

  console.log("📚 开始获取 Notion 数据...");

  while (hasMore) {
    // Notion SDK v5 使用 dataSources.query
    const response = await (notion as any).dataSources.query({
      data_source_id: databaseId,
      start_cursor: startCursor,
      page_size: 100,
      sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    });

    allPages.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor || undefined;

    console.log(`  已获取 ${allPages.length} 条记录...`);
  }

  return allPages;
}

async function fetchPageContent(notion: Client, pageId: string) {
  try {
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });
    return blocks.results;
  } catch (error) {
    console.warn(`  ⚠️ 无法获取页面 ${pageId} 的内容`);
    return [];
  }
}

async function main() {
  console.log("🚀 Notion SSG 数据获取脚本\n");

  if (!DATABASE_ID) {
    console.error("❌ VITE_NOTION_DATASOURCE_ID 环境变量未设置");
    process.exit(1);
  }

  try {
    const notion = await createNotionClient();

    // 确保输出目录存在
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 获取所有文章
    const pages = await fetchAllPages(notion, DATABASE_ID);
    console.log(`\n✅ 共获取 ${pages.length} 篇文章`);

    // 保存文章列表
    const articlesPath = path.join(OUTPUT_DIR, "articles.json");
    fs.writeFileSync(
      articlesPath,
      JSON.stringify(
        {
          results: pages,
          total: pages.length,
          generated_at: new Date().toISOString(),
        },
        null,
        2
      )
    );
    console.log(`📄 文章列表已保存: ${articlesPath}`);

    // 获取每篇文章的内容（可选，用于文章详情页）
    console.log("\n📖 获取文章内容...");
    const articlesWithContent: Record<string, any> = {};

    for (const page of pages) {
      const content = await fetchPageContent(notion, page.id);
      articlesWithContent[page.id] = {
        ...page,
        content,
      };
      process.stdout.write(".");
    }
    console.log("\n");

    // 保存带内容的文章
    const contentPath = path.join(OUTPUT_DIR, "articles-content.json");
    fs.writeFileSync(
      contentPath,
      JSON.stringify(
        {
          articles: articlesWithContent,
          generated_at: new Date().toISOString(),
        },
        null,
        2
      )
    );
    console.log(`📄 文章内容已保存: ${contentPath}`);

    console.log("\n✨ 数据获取完成！");
  } catch (error: any) {
    console.error("\n❌ 错误:", error.message);
    process.exit(1);
  }
}

main();
