/**
 * Notion to Local MDX Synchronization Script
 * 
 * 功能：
 * 1. 从 Notion 数据库获取已发布的文章
 * 2. 下载所有图片到本地 public/images/notion/
 * 3. 生成 .mdx 文件（带 YAML frontmatter）到 posts/ 目录
 * 
 * 使用方法：npm run sync:notion
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
config({ path: path.resolve(__dirname, "../.env") });

// ============== 配置 ==============
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID || process.env.VITE_NOTION_DATASOURCE_ID;
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

// 输出目录
const POSTS_DIR = path.resolve(__dirname, "../posts");
const IMAGES_DIR = path.resolve(__dirname, "../public/images/notion");

// ============== 类型定义 ==============
interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, any>;
  url?: string;
}

interface ArticleFrontmatter {
  title: string;
  slug: string;
  date: string;
  lastModified: string;
  description: string;
  tags: string[];
  cover?: string;
  draft: boolean;
}

// ============== 工具函数 ==============

/** 创建支持代理的 fetch */
function createProxyFetch() {
  if (PROXY_URL) {
    const agent = new HttpsProxyAgent(PROXY_URL);
    return (url: string | URL, init?: any) => fetch(url, { ...init, agent } as any);
  }
  return fetch;
}

/** 创建 Notion Client */
function createNotionClient(): Client {
  const options: any = { auth: NOTION_API_KEY };
  
  if (PROXY_URL) {
    const agent = new HttpsProxyAgent(PROXY_URL);
    options.fetch = (url: string | URL, init?: any) => fetch(url, { ...init, agent } as any);
    console.log(`🌐 使用代理: ${PROXY_URL}`);
  }
  
  return new Client(options);
}

/** 生成文件名安全的 hash */
function generateImageHash(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex").slice(0, 12);
}

/** 从 URL 获取图片扩展名 */
function getImageExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.(jpe?g|png|gif|webp|svg|avif)(\?|$)/i);
    return match ? "." + match[1].toLowerCase() : ".jpg";
  } catch {
    return ".jpg";
  }
}

/** 延迟函数 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** URL 安全的 slug 生成 */
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "";
}

/** 提取 Notion 属性值 */
function extractProperty(prop: any, type: string): any {
  if (!prop) return null;
  
  switch (type) {
    case "title":
      return prop.title?.map((t: any) => t.plain_text).join("") || "";
    case "rich_text":
      return prop.rich_text?.map((t: any) => t.plain_text).join("") || "";
    case "select":
      return prop.select?.name || null;
    case "multi_select":
      return prop.multi_select?.map((s: any) => s.name) || [];
    case "date":
      return prop.date?.start || null;
    case "checkbox":
      return prop.checkbox || false;
    case "url":
      return prop.url || null;
    case "files":
      if (prop.files?.length > 0) {
        const file = prop.files[0];
        return file.external?.url || file.file?.url || null;
      }
      return null;
    default:
      return null;
  }
}

/** 从页面提取 frontmatter 数据 */
function extractFrontmatter(page: NotionPage): ArticleFrontmatter {
  const props = page.properties;
  
  // 查找各个属性（支持多种命名方式）
  const findProp = (names: string[]) => {
    for (const name of names) {
      if (props[name]) return props[name];
    }
    return null;
  };
  
  const titleProp = findProp(["Name", "name", "Title", "title", "标题"]);
  const slugProp = findProp(["Slug", "slug", "SLUG", "url"]);
  const dateProp = findProp(["Date", "date", "PublishDate", "发布日期", "日期"]);
  const descProp = findProp(["Summary", "summary", "Description", "description", "摘要", "描述"]);
  const tagsProp = findProp(["Tags", "tags", "标签", "类型"]);
  const statusProp = findProp(["Status", "status", "Published", "状态"]);
  const coverProp = findProp(["Cover", "cover", "封面"]);
  
  const title = extractProperty(titleProp, "title") || "Untitled";
  const slugText = extractProperty(slugProp, "rich_text") || title;
  const slug = slugify(slugText) || page.id.replace(/-/g, "").slice(0, 12);
  const date = extractProperty(dateProp, "date") || page.created_time?.split("T")[0] || "";
  const description = extractProperty(descProp, "rich_text") || "";
  const tags = extractProperty(tagsProp, "multi_select") || 
               (extractProperty(tagsProp, "select") ? [extractProperty(tagsProp, "select")] : []);
  const status = extractProperty(statusProp, "select") || extractProperty(statusProp, "checkbox");
  const cover = extractProperty(coverProp, "files") || extractProperty(coverProp, "url");
  
  // 判断是否为草稿
  const draft = status === "Draft" || status === "草稿" || status === false;
  
  return {
    title,
    slug,
    date,
    lastModified: page.last_edited_time?.split("T")[0] || date,
    description,
    tags,
    cover,
    draft,
  };
}

/** 下载图片到本地 */
async function downloadImage(
  fetchFn: any,
  url: string,
  slug: string,
  index: number
): Promise<string | null> {
  try {
    // 生成唯一文件名
    const hash = generateImageHash(url);
    const ext = getImageExtension(url);
    const filename = `${slug}-${hash}${ext}`;
    const filepath = path.join(IMAGES_DIR, filename);
    const localUrl = `/images/notion/${filename}`;
    
    // 如果文件已存在，跳过下载
    if (fs.existsSync(filepath)) {
      console.log(`   ✓ 图片已存在: ${filename}`);
      return localUrl;
    }
    
    // 下载图片
    const response = await fetchFn(url, { method: "GET" });
    if (!response.ok) {
      console.warn(`   ⚠️  图片下载失败 (HTTP ${response.status}): ${url.slice(0, 50)}...`);
      return null;
    }
    
    let buffer: Buffer;
    if (typeof response.buffer === "function") {
      buffer = await response.buffer();
    } else {
      const ab = await response.arrayBuffer();
      buffer = Buffer.from(ab);
    }
    
    if (!buffer || buffer.length === 0) {
      console.warn(`   ⚠️  图片内容为空: ${url.slice(0, 50)}...`);
      return null;
    }
    
    // 确保目录存在
    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
    
    // 保存文件
    fs.writeFileSync(filepath, buffer);
    console.log(`   ✓ 图片已下载: ${filename} (${(buffer.length / 1024).toFixed(1)}KB)`);
    
    return localUrl;
  } catch (error: any) {
    console.warn(`   ⚠️  图片下载错误: ${error.message}`);
    return null;
  }
}

/** 处理 Markdown 中的图片：下载并替换 URL */
async function processMarkdownImages(
  fetchFn: any,
  markdown: string,
  slug: string
): Promise<string> {
  // 匹配 Markdown 图片语法 ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const matches = [...markdown.matchAll(imageRegex)];
  
  if (matches.length === 0) {
    return markdown;
  }
  
  console.log(`   📷 处理 ${matches.length} 张图片...`);
  
  let result = markdown;
  let imageIndex = 0;
  
  for (const match of matches) {
    const [fullMatch, alt, originalUrl] = match;
    
    // 跳过已经是本地路径的图片
    if (originalUrl.startsWith("/") || originalUrl.startsWith("./")) {
      continue;
    }
    
    // 跳过 data URL
    if (originalUrl.startsWith("data:")) {
      continue;
    }
    
    const localUrl = await downloadImage(fetchFn, originalUrl, slug, imageIndex++);
    
    if (localUrl) {
      // 替换为本地 URL
      result = result.replace(fullMatch, `![${alt}](${localUrl})`);
    } else {
      // 保留原始 URL，添加注释
      console.warn(`   ⚠️  保留原始图片链接: ${originalUrl.slice(0, 50)}...`);
    }
    
    // 避免请求过快
    await delay(100);
  }
  
  return result;
}

/** 生成 YAML frontmatter */
function generateFrontmatter(data: ArticleFrontmatter): string {
  const lines = ["---"];
  
  // 标题需要转义引号
  lines.push(`title: "${data.title.replace(/"/g, '\\"')}"`);
  lines.push(`slug: "${data.slug}"`);
  lines.push(`date: "${data.date}"`);
  lines.push(`lastModified: "${data.lastModified}"`);
  
  if (data.description) {
    lines.push(`description: "${data.description.replace(/"/g, '\\"')}"`);
  }
  
  if (data.tags.length > 0) {
    lines.push(`tags:`);
    data.tags.forEach((tag) => {
      lines.push(`  - "${tag}"`);
    });
  }
  
  if (data.cover) {
    lines.push(`cover: "${data.cover}"`);
  }
  
  lines.push(`draft: ${data.draft}`);
  lines.push("---");
  
  return lines.join("\n");
}

/** 使用 HTTP 请求查询数据库 */
async function queryDatabase(fetchFn: any, startCursor?: string): Promise<any> {
  const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
  
  const body: any = {
    page_size: 100,
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
  };
  
  // 可选：只获取已发布的文章
  // body.filter = {
  //   property: "Status",
  //   select: { equals: "Published" }
  // };
  
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
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

/** 获取所有页面 */
async function fetchAllPages(fetchFn: any): Promise<NotionPage[]> {
  const allPages: NotionPage[] = [];
  let startCursor: string | undefined;
  
  console.log("📚 获取 Notion 数据库内容...");
  console.log(`   数据库 ID: ${DATABASE_ID}`);
  
  while (true) {
    const response = await queryDatabase(fetchFn, startCursor);
    allPages.push(...response.results);
    
    if (!response.has_more) break;
    startCursor = response.next_cursor;
    
    console.log(`   已获取 ${allPages.length} 篇文章...`);
  }
  
  return allPages;
}

/** 主函数 */
async function main() {
  console.log("🚀 Notion to MDX 同步脚本\n");
  console.log("=".repeat(60));
  
  // 验证环境变量
  if (!NOTION_API_KEY) {
    console.error("❌ 错误: NOTION_API_KEY 环境变量未设置");
    console.error("   请在 .env 文件中添加: NOTION_API_KEY=your_api_key");
    process.exit(1);
  }
  
  if (!DATABASE_ID) {
    console.error("❌ 错误: NOTION_DATABASE_ID 或 VITE_NOTION_DATASOURCE_ID 未设置");
    console.error("   请在 .env 文件中添加: NOTION_DATABASE_ID=your_database_id");
    process.exit(1);
  }
  
  try {
    const notion = createNotionClient();
    const n2m = new NotionToMarkdown({ notionClient: notion });
    const fetchFn = createProxyFetch();
    
    // 确保输出目录存在
    if (!fs.existsSync(POSTS_DIR)) {
      fs.mkdirSync(POSTS_DIR, { recursive: true });
      console.log(`📁 创建目录: ${POSTS_DIR}`);
    }
    
    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
      console.log(`📁 创建目录: ${IMAGES_DIR}`);
    }
    
    // 获取所有页面
    const pages = await fetchAllPages(fetchFn);
    console.log(`\n✅ 共获取 ${pages.length} 篇文章\n`);
    
    // 统计
    const stats = {
      total: pages.length,
      success: 0,
      skipped: 0,
      failed: 0,
      images: 0,
    };
    
    const usedSlugs = new Set<string>();
    
    // 处理每篇文章
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const frontmatter = extractFrontmatter(page);
      
      // 确保 slug 唯一
      let slug = frontmatter.slug;
      let counter = 1;
      while (usedSlugs.has(slug)) {
        slug = `${frontmatter.slug}-${counter++}`;
      }
      usedSlugs.add(slug);
      frontmatter.slug = slug;
      
      console.log(`\n[${i + 1}/${pages.length}] ${frontmatter.title}`);
      console.log(`   Slug: ${slug}`);
      
      // 跳过草稿（可选）
      // if (frontmatter.draft) {
      //   console.log(`   ⏭️  跳过草稿`);
      //   stats.skipped++;
      //   continue;
      // }
      
      try {
        // 使用 notion-to-md 转换内容
        console.log(`   📝 转换 Markdown...`);
        const mdBlocks = await n2m.pageToMarkdown(page.id);
        let markdown = n2m.toMarkdownString(mdBlocks).parent;
        
        // 处理封面图片
        if (frontmatter.cover && !frontmatter.cover.startsWith("/")) {
          const localCover = await downloadImage(fetchFn, frontmatter.cover, slug, -1);
          if (localCover) {
            frontmatter.cover = localCover;
          }
        }
        
        // 处理内容中的图片
        const imageCountBefore = (markdown.match(/!\[.*?\]\(/g) || []).length;
        markdown = await processMarkdownImages(fetchFn, markdown, slug);
        stats.images += imageCountBefore;
        
        // 生成 MDX 文件内容
        const yamlFrontmatter = generateFrontmatter(frontmatter);
        const mdxContent = `${yamlFrontmatter}\n\n${markdown}`;
        
        // 写入文件
        const filename = `${slug}.mdx`;
        const filepath = path.join(POSTS_DIR, filename);
        fs.writeFileSync(filepath, mdxContent, "utf-8");
        
        console.log(`   ✅ 已保存: ${filename}`);
        stats.success++;
        
      } catch (error: any) {
        console.error(`   ❌ 处理失败: ${error.message}`);
        stats.failed++;
      }
      
      // 避免 API 限速
      await delay(300);
    }
    
    // 输出统计
    console.log("\n" + "=".repeat(60));
    console.log("📊 同步统计:");
    console.log(`   总计: ${stats.total} 篇`);
    console.log(`   成功: ${stats.success} 篇`);
    console.log(`   跳过: ${stats.skipped} 篇`);
    console.log(`   失败: ${stats.failed} 篇`);
    console.log(`   图片: ${stats.images} 张`);
    console.log("=".repeat(60));
    
    console.log("\n✨ 同步完成!");
    console.log(`   MDX 文件: ${POSTS_DIR}`);
    console.log(`   图片目录: ${IMAGES_DIR}`);
    
  } catch (error: any) {
    console.error("\n❌ 同步失败:", error.message);
    
    if (error.message?.includes("Could not find database")) {
      console.error("\n💡 解决方案:");
      console.error("   1. 确保数据库已与 Integration 共享");
      console.error("   2. 打开 Notion 数据库 → 点击右上角 '...' → Add connections");
      console.error("   3. 检查 DATABASE_ID 是否正确");
    }
    
    if (error.message?.includes("ECONNREFUSED") || error.message?.includes("connect")) {
      console.error("\n💡 网络问题:");
      if (PROXY_URL) {
        console.error(`   当前代理: ${PROXY_URL}`);
        console.error("   请检查代理服务器是否运行");
      } else {
        console.error("   如果在中国大陆，可能需要配置代理:");
        console.error("   export HTTPS_PROXY=http://127.0.0.1:7890");
      }
    }
    
    process.exit(1);
  }
}

// 运行
main();
