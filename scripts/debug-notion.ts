/**
 * 诊断脚本：检查 Notion Integration 可以访问的内容
 */

import { config } from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env") });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.VITE_NOTION_DATASOURCE_ID;
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

async function createFetch() {
  if (PROXY_URL) {
    const { HttpsProxyAgent } = await import("https-proxy-agent");
    const nodeFetch = (await import("node-fetch")).default;
    const agent = new HttpsProxyAgent(PROXY_URL);
    return (url: string, init?: any) => nodeFetch(url, { ...init, agent });
  }
  const nodeFetch = (await import("node-fetch")).default;
  return nodeFetch;
}

async function main() {
  console.log("🔍 Notion Integration 诊断工具\n");
  console.log("=".repeat(50));

  if (!NOTION_API_KEY) {
    console.error("❌ NOTION_API_KEY 未设置");
    process.exit(1);
  }

  console.log(`✅ NOTION_API_KEY: ${NOTION_API_KEY.slice(0, 15)}...`);
  console.log(`📋 DATABASE_ID: ${DATABASE_ID || "未设置"}`);
  console.log(`🌐 代理: ${PROXY_URL || "未使用"}`);
  console.log("=".repeat(50));

  const fetchFn = await createFetch();

  // 1. 测试 API Key 是否有效（通过获取用户信息）
  console.log("\n📡 测试 1: 验证 API Key...");
  try {
    const meResponse = await fetchFn("https://api.notion.com/v1/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
      },
    });
    const meData = await meResponse.json();
    if (meResponse.ok) {
      console.log(`   ✅ API Key 有效`);
      console.log(`   👤 Bot 名称: ${(meData as any).name || "未知"}`);
    } else {
      console.log(`   ❌ API Key 无效: ${(meData as any).message}`);
      process.exit(1);
    }
  } catch (error: any) {
    console.log(`   ❌ 请求失败: ${error.message}`);
    process.exit(1);
  }

  // 2. 搜索所有可访问的数据库
  console.log("\n📡 测试 2: 搜索可访问的数据库...");
  try {
    const searchResponse = await fetchFn("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: { property: "object", value: "database" },
        page_size: 100,
      }),
    });
    const searchData: any = await searchResponse.json();

    if (searchResponse.ok) {
      const databases = searchData.results || [];
      console.log(`   ✅ 找到 ${databases.length} 个可访问的数据库:\n`);

      if (databases.length === 0) {
        console.log("   ⚠️  没有找到任何数据库！");
        console.log("   💡 请确保在 Notion 中将数据库共享给你的 Integration");
      } else {
        databases.forEach((db: any, index: number) => {
          const title =
            db.title?.[0]?.plain_text ||
            db.title?.[0]?.text?.content ||
            "无标题";
          const id = db.id;
          const isTarget = id.replace(/-/g, "") === DATABASE_ID?.replace(/-/g, "");
          console.log(
            `   ${index + 1}. ${isTarget ? "👉 " : "   "}${title}`
          );
          console.log(`      ID: ${id}`);
          console.log(`      URL: ${db.url || "无"}`);
          if (isTarget) {
            console.log(`      ⭐ 这是你配置的目标数据库！`);
          }
          console.log();
        });
      }
    } else {
      console.log(`   ❌ 搜索失败: ${searchData.message}`);
    }
  } catch (error: any) {
    console.log(`   ❌ 请求失败: ${error.message}`);
  }

  // 3. 直接尝试访问配置的数据库
  if (DATABASE_ID) {
    console.log("\n📡 测试 3: 直接访问配置的数据库...");
    try {
      const dbResponse = await fetchFn(
        `https://api.notion.com/v1/databases/${DATABASE_ID}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${NOTION_API_KEY}`,
            "Notion-Version": "2022-06-28",
          },
        }
      );
      const dbData: any = await dbResponse.json();

      if (dbResponse.ok) {
        console.log(`   ✅ 数据库可访问！`);
        console.log(
          `   📋 标题: ${dbData.title?.[0]?.plain_text || "无标题"}`
        );
      } else {
        console.log(`   ❌ 无法访问数据库`);
        console.log(`   错误: ${dbData.message}`);
        console.log(`\n   💡 解决方案:`);
        console.log(
          `   1. 打开 Notion，找到你的数据库页面`
        );
        console.log(`   2. 点击右上角 "..." 菜单`);
        console.log(`   3. 选择 "Add connections" 或 "连接"`);
        console.log(`   4. 搜索并添加 "profile" Integration`);
      }
    } catch (error: any) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("诊断完成");
}

main();
