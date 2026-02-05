/**
 * 测试 Notion API 错误处理机制
 */

import { Client } from "@notionhq/client";
import { config } from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env") });

const NOTION_API_KEY = process.env.NOTION_API_KEY;

async function testErrorHandling() {
  console.log("🧪 测试 Notion SDK 错误处理机制\n");
  console.log("=".repeat(60));

  // 测试 1: 无效的 API Key
  console.log("\n📡 测试 1: 无效的 API Key");
  try {
    const invalidClient = new Client({ auth: "invalid_key_12345" });
    await invalidClient.dataSources.query({
      data_source_id: "test",
      page_size: 1,
    });
    console.log("❌ 应该抛出错误但没有");
  } catch (error: any) {
    console.log(`✅ 正确捕获错误: ${error.message}`);
    if (error.code) {
      console.log(`   错误代码: ${error.code}`);
    }
  }

  // 测试 2: 无效的 DataSource ID
  console.log("\n📡 测试 2: 无效的 DataSource ID");
  if (NOTION_API_KEY) {
    try {
      const client = new Client({ auth: NOTION_API_KEY });
      await client.dataSources.query({
        data_source_id: "00000000-0000-0000-0000-000000000000",
        page_size: 1,
      });
      console.log("❌ 应该抛出错误但没有");
    } catch (error: any) {
      console.log(`✅ 正确捕获错误: ${error.message}`);
      if (error.code) {
        console.log(`   错误代码: ${error.code}`);
      }
    }
  } else {
    console.log("⚠️  跳过测试（需要 NOTION_API_KEY）");
  }

  // 测试 3: SDK 错误类型
  console.log("\n📡 测试 3: SDK 错误类型检查");
  try {
    const invalidClient = new Client({ auth: "invalid" });
    await invalidClient.dataSources.query({
      data_source_id: "test",
      page_size: 1,
    });
  } catch (error: any) {
    console.log(`✅ 错误类型: ${error.constructor.name}`);
    console.log(`   是否为 APIResponseError: ${error.code !== undefined}`);
    console.log(`   错误信息: ${error.message}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✨ 错误处理测试完成");
}

testErrorHandling().catch((error) => {
  console.error("❌ 测试过程出错:", error);
  process.exit(1);
});
