/**
 * 诊断特定文章的内容获取问题
 * 用法: npx tsx scripts/diagnose-article.ts <article-id|slug>
 */

import { config } from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";
import { Client } from "@notionhq/client";
import { HttpsProxyAgent } from "https-proxy-agent";
import * as fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env") });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.VITE_NOTION_DATASOURCE_ID;
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

/** 创建支持代理的 Notion Client */
function createNotionClient(): Client {
  const options: any = { auth: NOTION_API_KEY };
  if (PROXY_URL) {
    const agent = new HttpsProxyAgent(PROXY_URL);
    options.agent = agent;
  }
  return new Client(options);
}

/** 从 slug 查找文章 ID */
function findArticleIdBySlug(slug: string): string | null {
  const indexPath = path.resolve(__dirname, "../public/data/articles-index.json");
  if (!fs.existsSync(indexPath)) {
    return null;
  }
  const indexData = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  return indexData.slugToId?.[slug] || null;
}

/** 获取文章信息 */
function getArticleInfo(articleId: string): any {
  const articlesPath = path.resolve(__dirname, "../public/data/articles.json");
  if (!fs.existsSync(articlesPath)) {
    return null;
  }
  const articlesData = JSON.parse(fs.readFileSync(articlesPath, "utf-8"));
  return articlesData.results?.find((page: any) => page.id === articleId);
}

/** 提取标题 */
function extractTitle(page: any): string {
  const props = page.properties || {};
  for (const key of Object.keys(props)) {
    const prop = props[key];
    if (prop?.type === "title" && Array.isArray(prop.title) && prop.title.length > 0) {
      return prop.title.map((t: any) => t.plain_text).join("") || "";
    }
  }
  return "";
}

async function diagnoseArticle(articleIdOrSlug: string) {
  console.log("🔍 文章内容获取诊断工具\n");
  console.log("=".repeat(60));

  if (!NOTION_API_KEY) {
    console.error("❌ NOTION_API_KEY 环境变量未设置");
    process.exit(1);
  }

  // 确定文章 ID
  let articleId = articleIdOrSlug;
  // 如果看起来不像 UUID（没有足够的连字符），可能是 slug
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(articleId)) {
    // 可能是 slug，尝试查找
    const foundId = findArticleIdBySlug(articleId);
    if (foundId) {
      console.log(`📋 通过 slug "${articleId}" 找到文章 ID: ${foundId}`);
      articleId = foundId;
    } else {
      console.error(`❌ 未找到 slug "${articleId}" 对应的文章 ID`);
      console.log(`\n💡 提示: 请检查 slug 是否正确，或直接使用文章 ID`);
      process.exit(1);
    }
  }

  // 获取文章信息
  const articleInfo = getArticleInfo(articleId);
  if (articleInfo) {
    const title = extractTitle(articleInfo);
    console.log(`📄 文章标题: ${title}`);
    console.log(`🆔 文章 ID: ${articleId}`);
    console.log(`🔗 URL Slug: ${(articleInfo as any).urlSlug || "未知"}`);
    console.log(`📅 最后编辑时间: ${articleInfo.last_edited_time || "未知"}`);
    console.log(`🔒 是否锁定: ${articleInfo.is_locked ? "是" : "否"}`);
    console.log(`📦 是否归档: ${articleInfo.archived ? "是" : "否"}`);
    console.log(`🗑️  是否在回收站: ${articleInfo.in_trash ? "是" : "否"}`);
  } else {
    console.log(`⚠️  未在本地数据中找到文章信息，将直接查询 Notion API`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("📡 开始诊断...\n");

  const notion = createNotionClient();

  // 1. 测试能否访问页面
  console.log("1️⃣ 测试页面访问权限...");
  try {
    const pageResponse = await notion.pages.retrieve({ page_id: articleId });
    console.log("   ✅ 可以访问页面");
    console.log(`   📄 页面对象类型: ${pageResponse.object}`);
    console.log(`   🔒 是否锁定: ${(pageResponse as any).is_locked ? "是" : "否"}`);
    console.log(`   📦 是否归档: ${(pageResponse as any).archived ? "是" : "否"}`);
  } catch (error: any) {
    console.log(`   ❌ 无法访问页面: ${error.message}`);
    if (error.code) {
      console.log(`   错误代码: ${error.code}`);
    }
    if (error.status) {
      console.log(`   HTTP 状态: ${error.status}`);
    }
    console.log("\n   💡 可能的原因:");
    console.log("      - API Key 无效或无权访问此页面");
    console.log("      - 页面不存在或已被删除");
    console.log("      - 页面 ID 不正确");
    process.exit(1);
  }

  // 2. 测试获取内容块
  console.log("\n2️⃣ 测试获取内容块...");
  try {
    const blocksResponse = await notion.blocks.children.list({
      block_id: articleId,
      page_size: 10, // 先获取前 10 个块
    });

    console.log(`   ✅ 成功获取内容块`);
    console.log(`   📊 返回的块数量: ${blocksResponse.results.length}`);
    console.log(`   📄 是否有更多内容: ${blocksResponse.has_more ? "是" : "否"}`);

    if (blocksResponse.results.length === 0) {
      console.log("\n   ⚠️  页面内容为空！");
      console.log("   💡 可能的原因:");
      console.log("      - 页面确实没有内容");
      console.log("      - 内容在子页面中");
      console.log("      - 内容需要特殊权限才能访问");
    } else {
      console.log("\n   📋 前几个内容块类型:");
      blocksResponse.results.slice(0, 5).forEach((block: any, index: number) => {
        const type = block.type;
        const hasChildren = (block as any).has_children;
        console.log(`      ${index + 1}. ${type}${hasChildren ? " (有子块)" : ""}`);
      });
    }
  } catch (error: any) {
    console.log(`   ❌ 获取内容块失败: ${error.message}`);
    if (error.code) {
      console.log(`   错误代码: ${error.code}`);
    }
    if (error.status) {
      console.log(`   HTTP 状态: ${error.status}`);
    }
    console.log("\n   💡 可能的原因:");
    console.log("      - API Key 无权访问页面内容");
    console.log("      - 页面被锁定");
    console.log("      - 网络连接问题");
  }

  // 3. 获取所有内容块
  console.log("\n3️⃣ 获取所有内容块...");
  try {
    const allBlocks: any[] = [];
    let startCursor: string | undefined;

    do {
      const response = await notion.blocks.children.list({
        block_id: articleId,
        page_size: 100,
        start_cursor: startCursor,
      });

      allBlocks.push(...response.results);
      startCursor = response.has_more && response.next_cursor ? response.next_cursor : undefined;

      // 递归获取子块
      for (const block of response.results) {
        if ((block as any).has_children) {
          console.log(`   📦 获取子块: ${block.type} (${block.id})`);
          const childResponse = await notion.blocks.children.list({
            block_id: block.id,
            page_size: 100,
          });
          allBlocks.push(...childResponse.results);
        }
      }
    } while (startCursor);

    console.log(`   ✅ 总共获取到 ${allBlocks.length} 个内容块`);

    if (allBlocks.length === 0) {
      console.log("\n   ⚠️  页面确实没有内容块");
    } else {
      console.log("\n   📊 内容块类型统计:");
      const typeCount: Record<string, number> = {};
      allBlocks.forEach((block: any) => {
        typeCount[block.type] = (typeCount[block.type] || 0) + 1;
      });
      Object.entries(typeCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
          console.log(`      ${type}: ${count}`);
        });
    }
  } catch (error: any) {
    console.log(`   ❌ 获取所有内容块失败: ${error.message}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✨ 诊断完成");
}

// 主函数
async function main() {
  const articleIdOrSlug = process.argv[2];

  if (!articleIdOrSlug) {
    console.error("❌ 请提供文章 ID 或 slug");
    console.log("\n用法:");
    console.log("  npx tsx scripts/diagnose-article.ts <article-id>");
    console.log("  npx tsx scripts/diagnose-article.ts <article-slug>");
    console.log("\n示例:");
    console.log("  npx tsx scripts/diagnose-article.ts 2d228bdf-58f2-80b3-a5d1-db01608a55a7");
    console.log("  npx tsx scripts/diagnose-article.ts concurrent-cache-optimization-techniques-for-large-scale-projects");
    process.exit(1);
  }

  await diagnoseArticle(articleIdOrSlug);
}

main().catch((error) => {
  console.error("❌ 诊断过程出错:", error);
  process.exit(1);
});
