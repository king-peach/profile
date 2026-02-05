/**
 * 构建时获取 Notion 数据
 * 在 build 前运行，将数据保存为静态 JSON 文件
 * 使用 Notion SDK 简化 API 调用
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { Client } from "@notionhq/client";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载 .env 文件
config({ path: path.resolve(__dirname, "../.env") });

// 配置
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.VITE_NOTION_DATASOURCE_ID;
const OUTPUT_DIR = path.resolve(__dirname, "../public/data");
const PUBLIC_DIR = path.resolve(__dirname, "../public");
const IMAGES_ARTICLES_DIR = path.join(PUBLIC_DIR, "images", "articles");

// 代理配置（开发环境可能需要）
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

/** 创建支持代理的 fetch 函数 */
function createProxyFetch() {
  if (PROXY_URL) {
    const agent = new HttpsProxyAgent(PROXY_URL);
    return (url: string | URL, init?: any) => {
      return fetch(url, { ...init, agent } as any);
    };
  }
  return undefined; // 使用默认 fetch
}

/** 创建支持代理的 Notion Client */
function createNotionClient(): Client {
  const options: any = { auth: NOTION_API_KEY };
  
  // Notion SDK v5 支持通过自定义 fetch 函数配置代理
  const proxyFetch = createProxyFetch();
  if (proxyFetch) {
    options.fetch = proxyFetch;
    console.log(`🌐 使用代理: ${PROXY_URL}`);
  }
  
  return new Client(options);
}

/** 将 Notion rich_text 片段转为 Markdown（bold/italic/code/link） */
function richTextToMarkdown(richText: any[]): string {
  if (!Array.isArray(richText)) return "";
  return richText
    .map((t: any) => {
      const text = t.plain_text ?? t.text?.content ?? "";
      const link = t.href ?? t.text?.link?.url;
      const a = t.annotations || {};
      let s = text
        .replace(/\\/g, "\\\\")
        .replace(/\*/g, "\\*")
        .replace(/_/g, "\\_")
        .replace(/`/g, "\\`")
        .replace(/\[/g, "\\[");
      if (a.code) s = "`" + s + "`";
      else {
        if (a.bold) s = "**" + s + "**";
        if (a.italic) s = "_" + s + "_";
        if (a.strikethrough) s = "~~" + s + "~~";
      }
      return link ? `[${s}](${link})` : s;
    })
    .join("");
}

/** 将 Notion blocks 转为 Markdown */
function blocksToMarkdown(blocks: any[]): string {
  if (!Array.isArray(blocks)) return "";
  const lines: string[] = [];
  let inCodeBlock = false;
  let codeLang = "";
  let codeLines: string[] = [];

  function flushCode() {
    if (!inCodeBlock) return;
    lines.push("```" + codeLang);
    lines.push(codeLines.join("\n"));
    lines.push("```");
    lines.push("");
    inCodeBlock = false;
    codeLang = "";
    codeLines = [];
  }

  for (const block of blocks) {
    const type = block.type;
    const payload = block[type];
    const richText = payload?.rich_text || [];
    const text = richTextToMarkdown(richText);

    if (type === "paragraph") {
      flushCode();
      if (text) lines.push(text);
      lines.push("");
    } else if (type === "heading_1") {
      flushCode();
      if (text) lines.push("# " + text);
      lines.push("");
    } else if (type === "heading_2") {
      flushCode();
      if (text) lines.push("## " + text);
      lines.push("");
    } else if (type === "heading_3") {
      flushCode();
      if (text) lines.push("### " + text);
      lines.push("");
    } else if (type === "bulleted_list_item") {
      flushCode();
      if (text) lines.push("- " + text);
    } else if (type === "numbered_list_item") {
      flushCode();
      if (text) lines.push("1. " + text);
    } else if (type === "to_do") {
      flushCode();
      const checked = payload?.checked ? "[x]" : "[ ]";
      if (text) lines.push("- " + checked + " " + text);
    } else if (type === "quote") {
      flushCode();
      if (text) lines.push("> " + text.replace(/\n/g, "\n> "));
      lines.push("");
    } else if (type === "code") {
      const lang = payload?.language || "";
      if (!inCodeBlock || codeLang !== lang) {
        flushCode();
        inCodeBlock = true;
        codeLang = lang;
      }
      codeLines.push(text);
    } else if (type === "divider") {
      flushCode();
      lines.push("---");
      lines.push("");
    } else if (type === "callout") {
      flushCode();
      const icon = payload?.icon?.emoji || "💡";
      if (text) lines.push("> " + icon + " " + text.replace(/\n/g, "\n> "));
      lines.push("");
    } else if (type === "toggle") {
      flushCode();
      if (text) lines.push("**" + text + "**");
      lines.push("");
      // 子块已在 getBlockChildren 中按文档顺序追加，会继续被渲染
    } else if (type === "child_page" || type === "child_database") {
      flushCode();
      const title = text || (payload?.title || "Untitled");
      if (title) lines.push("**" + title + "**");
      lines.push("");
    } else if (type === "image") {
      flushCode();
      const url = payload?.external?.url || payload?.file?.url || "";
      const caption = payload?.caption?.map((t: any) => t.plain_text).join("") || "";
      if (url) {
        lines.push("![" + (caption || "image") + "](" + url + ")");
      } else {
        lines.push("*(图片)*");
      }
      if (text && !caption && url) lines.push(text);
      lines.push("");
    } else if (type === "bookmark" || type === "embed" || type === "link_preview") {
      flushCode();
      const url = payload?.url || "";
      const title = text || payload?.title || url;
      if (url) lines.push("[" + (title || "Link") + "](" + url + ")");
      lines.push("");
    } else if (type === "video" || type === "file" || type === "pdf") {
      flushCode();
      const url = payload?.external?.url || payload?.file?.url || payload?.url || "";
      if (url) lines.push("[[" + (text || type) + "]](" + url + ")");
      lines.push("");
    } else if (type === "synced_block") {
      // 引用块：内容已在递归时拉取，此处可能无 rich_text，跳过避免重复
      if (text) {
        flushCode();
        lines.push(text);
        lines.push("");
      }
    } else if (type === "column_list" || type === "column") {
      // 布局块：无正文，子块已在递归时按顺序追加，不输出避免多余空行
      if (text) {
        flushCode();
        lines.push(text);
        lines.push("");
      }
    } else {
      flushCode();
      if (text) lines.push(text);
      lines.push("");
    }
  }
  flushCode();
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

/** 判断错误是否可重试 */
function isRetryableError(error: any): boolean {
  // 网络错误、超时错误、5xx 服务器错误可以重试
  if (error.message?.includes("fetch failed") || 
      error.message?.includes("timeout") ||
      error.message?.includes("ECONNRESET") ||
      error.message?.includes("ETIMEDOUT")) {
    return true;
  }
  // API 错误代码 500-599 可以重试
  if (error.code && typeof error.code === "number" && error.code >= 500 && error.code < 600) {
    return true;
  }
  // rate_limit 错误可以重试
  if (error.code === "rate_limit" || error.message?.includes("rate_limit")) {
    return true;
  }
  return false;
}

/** 延迟函数 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 获取全部内容块：使用 SDK 分页拉取 + 递归拉取 has_children 的子块，按文档顺序返回 */
async function getBlockChildren(
  notion: Client,
  blockId: string,
  maxRetries: number = 3,
  context?: { pageId?: string; pageTitle?: string }
): Promise<any[]> {
  const all: any[] = [];
  let startCursor: string | undefined;
  
  do {
    let retries = 0;
    let success = false;
    
    while (retries <= maxRetries && !success) {
      try {
        const response = await notion.blocks.children.list({
          block_id: blockId,
          page_size: 100,
          start_cursor: startCursor,
        });
        
        for (const block of response.results) {
          all.push(block);
          if ("has_children" in block && block.has_children) {
            const childBlocks = await getBlockChildren(notion, block.id, maxRetries, context);
            all.push(...childBlocks);
          }
        }
        
        startCursor = response.has_more && response.next_cursor ? response.next_cursor : undefined;
        success = true;
      } catch (error: any) {
        const errorInfo = {
          blockId,
          pageId: context?.pageId,
          pageTitle: context?.pageTitle,
          errorMessage: error.message,
          errorCode: error.code,
          errorStatus: error.status,
          retryAttempt: retries,
        };
        
        if (isRetryableError(error) && retries < maxRetries) {
          retries++;
          const delayMs = Math.min(1000 * Math.pow(2, retries - 1), 10000); // 指数退避，最多 10 秒
          console.warn(
            `⚠️  获取块失败（可重试），${delayMs}ms 后重试 (${retries}/${maxRetries}):`,
            error.message,
            context?.pageTitle ? `[文章: ${context.pageTitle}]` : ""
          );
          await delay(delayMs);
        } else {
          // 不可重试的错误或达到最大重试次数
          const errorDetails = [
            `获取块 ${blockId} 失败`,
            context?.pageId && `文章 ID: ${context.pageId}`,
            context?.pageTitle && `文章标题: ${context.pageTitle}`,
            `错误信息: ${error.message}`,
            error.code && `错误代码: ${error.code}`,
            error.status && `HTTP 状态: ${error.status}`,
            retries > 0 && `已重试 ${retries} 次`,
          ]
            .filter(Boolean)
            .join(", ");
          
          console.error(`❌ ${errorDetails}`);
          
          // 如果是权限错误或 404，可能是页面不存在或无权访问
          if (error.code === 404 || error.status === 404 || error.message?.includes("not found")) {
            console.warn(`   提示: 页面可能不存在或无权访问`);
          } else if (error.code === 401 || error.status === 401 || error.message?.includes("unauthorized")) {
            console.warn(`   提示: API Key 可能无效或无权访问此页面`);
          } else if (error.message?.includes("ECONNREFUSED") || error.message?.includes("connect")) {
            console.warn(`   提示: 网络连接失败`);
            if (PROXY_URL) {
              console.warn(`   代理配置: ${PROXY_URL}`);
              console.warn(`   请检查代理服务器是否运行，或尝试取消代理设置`);
            } else {
              console.warn(`   如果在中国大陆，可能需要配置代理`);
              console.warn(`   设置环境变量: HTTPS_PROXY=http://127.0.0.1:7890`);
            }
          }
          
          break;
        }
      }
    }
    
    // 如果重试后仍然失败，跳出循环
    if (!success) {
      break;
    }
  } while (startCursor);
  
  return all;
}

/** 从 URL 解析图片扩展名，默认 .jpg */
function getImageExt(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const m = pathname.match(/\.(jpe?g|png|gif|webp|svg)(\?|$)/i);
    return m ? "." + m[1].toLowerCase() : ".jpg";
  } catch {
    return ".jpg";
  }
}

/** 创建支持代理的 fetch 函数（用于图片下载） */
function createImageFetch() {
  if (PROXY_URL) {
    const agent = new HttpsProxyAgent(PROXY_URL);
    return (url: string, init?: any) => fetch(url, { ...init, agent } as any);
  }
  return fetch;
}

/** 下载图片到本地，成功返回 true */
async function downloadImage(imageFetch: any, url: string, filepath: string): Promise<boolean> {
  try {
    const res = await imageFetch(url, { method: "GET" });
    if (!res.ok) return false;
    let buffer: Buffer;
    if (typeof res.buffer === "function") {
      buffer = await res.buffer();
    } else {
      const ab = await res.arrayBuffer();
      buffer = Buffer.from(ab);
    }
    if (!buffer?.length) return false;
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filepath, buffer);
    return true;
  } catch {
    return false;
  }
}

/** 将 content 中的 Notion 图片下载到 public/images/articles/{pageId}/，并替换为本地 URL */
async function processContentImages(imageFetch: any, pageId: string, content: any[]): Promise<void> {
  if (!Array.isArray(content)) return;
  for (const block of content) {
    const type = block.type;
    const payload = block[type];
    if (!payload) continue;
    const url = payload?.external?.url || payload?.file?.url || "";
    if (!url || type !== "image") continue;
    const ext = getImageExt(url);
    const filename = block.id.replace(/-/g, "") + ext;
    const dir = path.join(IMAGES_ARTICLES_DIR, pageId);
    const filepath = path.join(dir, filename);
    const ok = await downloadImage(imageFetch, url, filepath);
    if (ok) {
      const localUrl = "/images/articles/" + pageId + "/" + filename;
      if (payload.file) payload.file.url = localUrl;
      if (payload.external) payload.external.url = localUrl;
    }
  }
}

/** 使用 HTTP 请求查询数据库（Notion SDK v5 不支持 databases.query） */
async function queryDatabaseViaHTTP(
  fetchFn: any,
  databaseId: string,
  startCursor?: string
): Promise<any> {
  const url = `https://api.notion.com/v1/databases/${databaseId}/query`;
  const body: any = {
    page_size: 100,
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
  };
  if (startCursor) {
    body.start_cursor = startCursor;
  }

  const response = await fetchFn(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

/** 使用 SDK 或 HTTP 获取所有页面 */
async function fetchAllPages(notion: Client, databaseId: string) {
  const allPages: any[] = [];
  let startCursor: string | undefined;

  console.log("📚 开始获取 Notion 数据...");
  console.log(`   数据库 ID: ${databaseId}`);

  // 创建支持代理的 fetch 函数
  const proxyFetch = createProxyFetch() || fetch;

  while (true) {
    try {
      let response: any;

      // 首先尝试使用 dataSources.query（如果 databaseId 实际上是 dataSourceId）
      try {
        response = await notion.dataSources.query({
          data_source_id: databaseId,
          page_size: 100,
          start_cursor: startCursor,
          sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
        });
        console.log(`   ✓ 使用 dataSources.query 成功`);
      } catch (dsError: any) {
        // 如果 dataSources.query 失败，使用 HTTP 请求查询数据库
        const errorMessage = dsError.message || "";
        const errorCode = dsError.code;
        const errorStatus = dsError.status;
        
        // 输出详细的错误信息，帮助调试
        console.log(`   ⚠️  dataSources.query 失败:`);
        console.log(`      错误信息: ${errorMessage}`);
        if (errorCode) console.log(`      错误代码: ${errorCode}`);
        if (errorStatus) console.log(`      HTTP 状态: ${errorStatus}`);
        
        // 检查是否是可回退的错误
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("Could not find database") ||
          errorMessage.includes("database") ||
          errorCode === 404 ||
          errorStatus === 404 ||
          errorMessage.includes("is not a function")
        ) {
          console.log(`   ⚠️  dataSources.query 不可用，使用 HTTP 请求查询数据库...`);
          response = await queryDatabaseViaHTTP(proxyFetch, databaseId, startCursor);
        } else {
          throw dsError;
        }
      }

      allPages.push(...response.results);
      
      if (!response.has_more) break;
      startCursor = response.next_cursor || undefined;
      
      console.log(`  已获取 ${allPages.length} 条记录...`);
    } catch (error: any) {
      console.error(`❌ 获取数据失败:`, error.message);
      if (error.cause) {
        console.error(`   原因:`, error.cause.message || error.cause);
      }
      
      // 提供详细的错误信息和解决建议
      if (error.message?.includes("Could not find database") || 
          error.message?.includes("not found") ||
          error.code === 404) {
        console.error("\n💡 数据库访问问题解决方案:");
        console.error(`   数据库 ID: ${databaseId}`);
        console.error(`   1. 确保数据库已与 Integration 共享:`);
        console.error(`      - 打开 Notion 数据库页面`);
        console.error(`      - 点击右上角 "..." 菜单`);
        console.error(`      - 选择 "Add connections" 或 "连接"`);
        console.error(`      - 搜索并添加你的 Integration`);
        console.error(`   2. 检查数据库 ID 是否正确`);
        console.error(`   3. 确保 Integration 有读取权限`);
      } else if (error.code === 401 || error.status === 401) {
        console.error("\n💡 API Key 问题:");
        console.error(`   1. 检查 NOTION_API_KEY 是否正确`);
        console.error(`   2. 确保 Integration 未被删除或禁用`);
      }
      
      throw error;
    }
  }

  return allPages;
}

async function main() {
  console.log("🚀 Notion SSG 数据获取脚本\n");

  if (!NOTION_API_KEY) {
    console.error("❌ NOTION_API_KEY 环境变量未设置");
    process.exit(1);
  }

  if (!DATABASE_ID) {
    console.error("❌ VITE_NOTION_DATASOURCE_ID 环境变量未设置");
    process.exit(1);
  }

  try {
    // 创建 Notion Client（支持代理）
    const notion = createNotionClient();
    const imageFetch = createImageFetch();

    // 确保输出目录存在
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 获取所有文章（使用 SDK，自动处理分页）
    const pages = await fetchAllPages(notion, DATABASE_ID);
    console.log(`\n✅ 共获取 ${pages.length} 篇文章`);

    // 为每篇文章生成唯一 URL 安全 slug，并构建 slug -> id 索引
    const usedSlugs = new Set<string>();
    const slugToId: Record<string, string> = {};
    for (const page of pages) {
      const urlSlug = getUrlSlug(page, usedSlugs);
      (page as any).urlSlug = urlSlug;
      slugToId[urlSlug] = page.id;
    }

    // 保存文章列表（含 urlSlug）
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

    // 保存 slug -> id 索引（详情页按 slug 查 id）
    const indexPath = path.join(OUTPUT_DIR, "articles-index.json");
    fs.writeFileSync(
      indexPath,
      JSON.stringify(
        { slugToId, generated_at: new Date().toISOString() },
        null,
        2
      )
    );
    console.log(`📄 文章索引已保存: ${indexPath}`);

    // 获取每篇文章的内容（使用 SDK，自动处理分页和递归）
    console.log("\n📖 获取文章内容...");
    const articlesWithContent: Record<string, any> = {};
    const failedArticles: Array<{ id: string; title: string; slug: string; reason: string }> = [];
    const emptyArticles: Array<{ id: string; title: string; slug: string }> = [];

    if (!fs.existsSync(IMAGES_ARTICLES_DIR)) {
      fs.mkdirSync(IMAGES_ARTICLES_DIR, { recursive: true });
    }
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageTitle = extractTitle(page);
      const pageSlug = (page as any).urlSlug || "unknown";
      
      try {
        const content = await getBlockChildren(notion, page.id, 3, {
          pageId: page.id,
          pageTitle: pageTitle,
        });
        
        // 检查内容是否为空
        if (!content || content.length === 0) {
          emptyArticles.push({
            id: page.id,
            title: pageTitle,
            slug: pageSlug,
          });
          console.warn(
            `\n⚠️  文章内容为空: [${i + 1}/${pages.length}] ${pageTitle} (${pageSlug})`
          );
        } else {
          console.log(
            `\n✓ [${i + 1}/${pages.length}] ${pageTitle} - 获取到 ${content.length} 个内容块`
          );
        }
        
        await processContentImages(imageFetch, page.id, content);
        const content_markdown = blocksToMarkdown(content);
        articlesWithContent[page.id] = {
          ...page,
          content,
          content_markdown,
        };
      } catch (error: any) {
        failedArticles.push({
          id: page.id,
          title: pageTitle,
          slug: pageSlug,
          reason: error.message || "未知错误",
        });
        console.error(
          `\n❌ 获取文章内容失败: [${i + 1}/${pages.length}] ${pageTitle} (${pageSlug})`
        );
        console.error(`   错误: ${error.message}`);
        
        // 即使失败也保存文章元数据，但 content 为空
        articlesWithContent[page.id] = {
          ...page,
          content: [],
          content_markdown: "",
        };
      }
    }
    
    // 输出统计信息
    console.log("\n" + "=".repeat(60));
    console.log("📊 内容获取统计:");
    console.log(`   总计: ${pages.length} 篇文章`);
    console.log(`   成功: ${pages.length - failedArticles.length - emptyArticles.length} 篇`);
    if (emptyArticles.length > 0) {
      console.log(`   ⚠️  内容为空: ${emptyArticles.length} 篇`);
      emptyArticles.forEach((art) => {
        console.log(`      - ${art.title} (${art.slug})`);
      });
    }
    if (failedArticles.length > 0) {
      console.log(`   ❌ 获取失败: ${failedArticles.length} 篇`);
      failedArticles.forEach((art) => {
        console.log(`      - ${art.title} (${art.slug}): ${art.reason}`);
      });
    }
    console.log("=".repeat(60));

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

    // 生成 Sitemap
    console.log("\n🗺️ 生成 Sitemap...");
    await generateSitemap(pages);

    console.log("\n✨ 数据获取完成！");
  } catch (error: any) {
    console.error("\n❌ 错误:", error.message);
    
    // 提供更详细的错误信息和解决建议
    if (error.message?.includes("ECONNREFUSED") || error.message?.includes("connect")) {
      console.error("\n💡 网络连接问题解决方案:");
      if (PROXY_URL) {
        console.error(`   当前代理配置: ${PROXY_URL}`);
        console.error(`   1. 检查代理服务器是否正在运行`);
        console.error(`   2. 验证代理地址和端口是否正确`);
        console.error(`   3. 尝试取消代理设置（如果不需要）:`);
        console.error(`      unset HTTPS_PROXY HTTP_PROXY`);
      } else {
        console.error(`   1. 如果在中国大陆，可能需要配置代理:`);
        console.error(`      export HTTPS_PROXY=http://127.0.0.1:7890`);
        console.error(`   2. 检查网络连接是否正常`);
        console.error(`   3. 检查防火墙设置`);
      }
    } else if (error.message?.includes("fetch failed")) {
      console.error("\n💡 请求失败，可能的原因:");
      console.error(`   1. 网络连接问题`);
      if (PROXY_URL) {
        console.error(`   2. 代理配置问题: ${PROXY_URL}`);
      } else {
        console.error(`   2. 可能需要配置代理`);
      }
      console.error(`   3. Notion API 服务暂时不可用`);
    }
    
    process.exit(1);
  }
}

// 辅助函数：提取 Rich Text 内容
function extractRichText(prop: any): string {
  if (!prop || prop.type !== "rich_text") return "";
  return prop.rich_text?.map((t: any) => t.plain_text).join("") || "";
}

// 辅助函数：提取 Title
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

// 辅助函数：提取原始 Slug 文本
function extractSlug(page: any): string {
  const props = page.properties || {};
  const slugProp = props["slug"] || props["Slug"] || props["SLUG"];
  if (slugProp) {
    return extractRichText(slugProp);
  }
  return "";
}

/** URL 安全 slug：小写、空格转 -、仅保留字母数字与连字符 */
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "") // 保留 Unicode 字母、数字、连字符
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "";
}

/** 为页面生成唯一 URL slug，无 Slug 时用 title 或 id */
function getUrlSlug(page: any, usedSlugs: Set<string>): string {
  const raw = extractSlug(page) || extractTitle(page) || page.id || "";
  let base = slugify(raw);
  if (!base) base = page.id?.replace(/-/g, "")?.slice(0, 12) || "page";
  let slug = base;
  let n = 0;
  while (usedSlugs.has(slug)) {
    n += 1;
    slug = `${base}-${n}`;
  }
  usedSlugs.add(slug);
  return slug;
}

// 生成 Sitemap（使用与前端一致的 urlSlug，URL 需编码）
async function generateSitemap(pages: any[]) {
  const baseUrl = "https://linxianglive.cn";
  const publicDir = path.resolve(__dirname, "../public");

  // 基础页面
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/articles</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

  // 文章页面（使用 urlSlug，与 articles.json 一致）
  let articleCount = 0;
  for (const page of pages) {
    const urlSlug = page.urlSlug;
    if (!urlSlug) continue;

    const lastMod = page.last_edited_time || new Date().toISOString();
    const encodedSlug = encodeURIComponent(urlSlug);

    sitemapContent += `
  <url>
    <loc>${baseUrl}/article/${encodedSlug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    articleCount++;
  }

  sitemapContent += `
</urlset>`;

  const sitemapPath = path.join(publicDir, "sitemap.xml");
  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log(
    `✅ Sitemap 已生成: ${sitemapPath} (包含 ${articleCount} 篇文章)`
  );
}

/** 仅根据已有 content 块重新生成 content_markdown，不请求 Notion API（用于修复旧数据） */
function fixMarkdownOnly() {
  const contentPath = path.join(OUTPUT_DIR, "articles-content.json");
  if (!fs.existsSync(contentPath)) {
    console.error("❌ 未找到 articles-content.json，请先执行 npm run fetch-notion");
    process.exit(1);
  }
  const raw = fs.readFileSync(contentPath, "utf-8");
  const data = JSON.parse(raw);
  const articles: Record<string, any> = data.articles || {};
  let fixed = 0;
  for (const id of Object.keys(articles)) {
    const article = articles[id];
    const content = article.content;
    if (!Array.isArray(content)) continue;
    const newMarkdown = blocksToMarkdown(content);
    const prev = (article.content_markdown || "").trim();
    const next = newMarkdown.trim();
    if (prev !== next) {
      article.content_markdown = newMarkdown;
      fixed += 1;
    }
  }
  fs.writeFileSync(contentPath, JSON.stringify(data, null, 2));
  console.log(`✅ 已根据 content 重新生成 content_markdown，更新 ${fixed} 篇文章`);
}

if (process.argv.includes("--fix-markdown-only")) {
  fixMarkdownOnly();
} else {
  main();
}
