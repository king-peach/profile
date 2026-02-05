/**
 * 检查数据库访问权限
 * 用法: npx tsx scripts/check-database-access.ts
 */

import { config } from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";
import { Client } from "@notionhq/client";
import { HttpsProxyAgent } from "https-proxy-agent";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env") });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.VITE_NOTION_DATASOURCE_ID;
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

/** 创建支持代理的 fetch 函数 */
function createProxyFetch() {
  if (PROXY_URL) {
    const agent = new HttpsProxyAgent(PROXY_URL);
    return (url: string | URL, init?: any) => {
      return fetch(url, { ...init, agent } as any);
    };
  }
  return undefined;
}

/** 创建支持代理的 Notion Client */
function createNotionClient(): Client {
  const options: any = { auth: NOTION_API_KEY };
  const proxyFetch = createProxyFetch();
  if (proxyFetch) {
    options.fetch = proxyFetch;
  }
  return new Client(options);
}

async function checkDatabaseAccess() {
  console.log("🔍 数据库访问权限检查工具\n");
  console.log("=".repeat(60));

  if (!NOTION_API_KEY) {
    console.error("❌ NOTION_API_KEY 环境变量未设置");
    process.exit(1);
  }

  if (!DATABASE_ID) {
    console.error("❌ VITE_NOTION_DATASOURCE_ID 环境变量未设置");
    process.exit(1);
  }

  console.log(`📋 数据库 ID: ${DATABASE_ID}`);
  console.log(`🔑 API Key: ${NOTION_API_KEY.slice(0, 15)}...`);
  if (PROXY_URL) {
    console.log(`🌐 代理: ${PROXY_URL}`);
  }
  console.log("=".repeat(60) + "\n");

  const notion = createNotionClient();

  // 1. 测试 API Key 是否有效
  console.log("1️⃣ 测试 API Key...");
  try {
    const meResponse = await notion.users.me();
    console.log(`   ✅ API Key 有效`);
    console.log(`   👤 Bot 名称: ${(meResponse as any).name || "未知"}`);
    console.log(`   🆔 Bot ID: ${(meResponse as any).id || "未知"}`);
  } catch (error: any) {
    console.error(`   ❌ API Key 无效: ${error.message}`);
    console.error("\n   💡 解决方案:");
    console.error(`      1. 检查 NOTION_API_KEY 是否正确`);
    console.error(`      2. 确保 Integration 未被删除或禁用`);
    process.exit(1);
  }

  // 2. 尝试使用 HTTP 请求查询数据库
  console.log("\n2️⃣ 尝试使用 HTTP 请求查询数据库...");
  try {
    const proxyFetch = createProxyFetch() || fetch;
    const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
    const response = await proxyFetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`   ✅ HTTP 请求查询数据库成功！`);
    console.log(`   📊 找到 ${data.results?.length || 0} 条记录（测试查询）`);
    console.log(`   ✅ 数据库已正确共享给 Integration`);
    return;
  } catch (error: any) {
    console.log(`   ❌ HTTP 请求查询数据库失败: ${error.message}`);
    if (error.code) {
      console.log(`   错误代码: ${error.code}`);
    }
  }

  // 3. 尝试使用 dataSources.query
  console.log("\n3️⃣ 尝试使用 dataSources.query...");
  try {
    const response = await notion.dataSources.query({
      data_source_id: DATABASE_ID,
      page_size: 1,
    });
    console.log(`   ✅ dataSources.query 成功！`);
    console.log(`   📊 找到 ${response.results.length} 条记录（测试查询）`);
    console.log(`   ✅ 数据源已正确配置`);
    return;
  } catch (error: any) {
    console.log(`   ❌ dataSources.query 失败: ${error.message}`);
    if (error.code) {
      console.log(`   错误代码: ${error.code}`);
    }
  }

  // 4. 搜索可访问的数据库
  console.log("\n4️⃣ 搜索可访问的数据库...");
  try {
    const searchResponse = await notion.search({
      filter: { property: "object", value: "database" },
      page_size: 100,
    });

    const databases = searchResponse.results || [];
    console.log(`   ✅ 找到 ${databases.length} 个可访问的数据库:\n`);

    if (databases.length === 0) {
      console.log("   ⚠️  没有找到任何数据库！");
      console.log("\n   💡 解决方案:");
      console.log("      1. 确保至少有一个数据库已与 Integration 共享");
      console.log("      2. 在 Notion 中:");
      console.log("         - 打开数据库页面");
      console.log("         - 点击右上角 \"...\" 菜单");
      console.log("         - 选择 \"Add connections\" 或 \"连接\"");
      console.log("         - 搜索并添加你的 Integration");
    } else {
      let foundTarget = false;
      databases.forEach((db: any, index: number) => {
        const title = db.title?.[0]?.plain_text || db.title?.[0]?.text?.content || "无标题";
        const id = db.id;
        const isTarget = id.replace(/-/g, "") === DATABASE_ID?.replace(/-/g, "");
        if (isTarget) foundTarget = true;
        
        console.log(
          `   ${index + 1}. ${isTarget ? "👉 " : "   "}${title}`
        );
        console.log(`      ID: ${id}`);
        if (isTarget) {
          console.log(`      ⭐ 这是你配置的目标数据库！`);
        }
        console.log();
      });

      if (!foundTarget) {
        console.log("   ⚠️  目标数据库不在可访问列表中！");
        console.log("\n   💡 解决方案:");
        console.log(`      1. 检查数据库 ID 是否正确: ${DATABASE_ID}`);
        console.log(`      2. 确保数据库已与 Integration 共享（见上面的步骤）`);
        console.log(`      3. 如果数据库 ID 错误，请更新 VITE_NOTION_DATASOURCE_ID`);
      }
    }
  } catch (error: any) {
    console.log(`   ❌ 搜索失败: ${error.message}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✨ 检查完成");
}

checkDatabaseAccess().catch((error) => {
  console.error("❌ 检查过程出错:", error);
  process.exit(1);
});
