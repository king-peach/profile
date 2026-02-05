/**
 * 验证 Notion API 优化效果
 * 自动检查输出文件的格式、完整性和一致性
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, "../public");
const DATA_DIR = path.join(PUBLIC_DIR, "data");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images", "articles");

interface VerificationResult {
  passed: boolean;
  message: string;
  details?: any;
}

interface VerificationReport {
  timestamp: string;
  results: VerificationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

const results: VerificationResult[] = [];

function addResult(passed: boolean, message: string, details?: any) {
  results.push({ passed, message, details });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} ${message}`);
  if (details && !passed) {
    console.log(`   详情:`, details);
  }
}

/** 验证文件是否存在且可读 */
function verifyFileExists(filePath: string, description: string): boolean {
  if (!fs.existsSync(filePath)) {
    addResult(false, `${description} 不存在: ${filePath}`);
    return false;
  }
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    addResult(true, `${description} 存在且可读`);
    return true;
  } catch (error: any) {
    addResult(false, `${description} 无法读取: ${error.message}`);
    return false;
  }
}

/** 验证 JSON 文件格式 */
function verifyJsonFile(filePath: string, description: string): any | null {
  if (!verifyFileExists(filePath, description)) {
    return null;
  }
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    addResult(true, `${description} JSON 格式正确`);
    return data;
  } catch (error: any) {
    addResult(false, `${description} JSON 格式错误: ${error.message}`);
    return null;
  }
}

/** 验证 XML 文件格式 */
function verifyXmlFile(filePath: string, description: string): boolean {
  if (!verifyFileExists(filePath, description)) {
    return false;
  }
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    // 简单验证 XML 格式
    if (!content.includes("<?xml") || !content.includes("<urlset")) {
      addResult(false, `${description} XML 格式不正确`);
      return false;
    }
    addResult(true, `${description} XML 格式正确`);
    return true;
  } catch (error: any) {
    addResult(false, `${description} XML 格式错误: ${error.message}`);
    return false;
  }
}

/** 验证 articles.json */
function verifyArticlesJson() {
  console.log("\n📄 验证 articles.json...");
  const data = verifyJsonFile(
    path.join(DATA_DIR, "articles.json"),
    "articles.json"
  );
  if (!data) return;

  // 检查必需字段
  if (!data.results || !Array.isArray(data.results)) {
    addResult(false, "articles.json 缺少 results 数组");
    return;
  }
  addResult(true, `articles.json 包含 ${data.results.length} 篇文章`);

  // 检查每篇文章的必需字段
  let validArticles = 0;
  let articlesWithSlug = 0;
  for (const article of data.results) {
    if (article.id && article.properties) {
      validArticles++;
      if (article.urlSlug) {
        articlesWithSlug++;
      }
    }
  }
  addResult(
    validArticles === data.results.length,
    `所有文章都有必需字段 (${validArticles}/${data.results.length})`
  );
  addResult(
    articlesWithSlug === data.results.length,
    `所有文章都有 urlSlug (${articlesWithSlug}/${data.results.length})`
  );

  // 检查 generated_at
  if (data.generated_at) {
    addResult(true, `生成时间: ${data.generated_at}`);
  } else {
    addResult(false, "缺少 generated_at 字段");
  }

  return data;
}

/** 验证 articles-index.json */
function verifyArticlesIndexJson() {
  console.log("\n📄 验证 articles-index.json...");
  const data = verifyJsonFile(
    path.join(DATA_DIR, "articles-index.json"),
    "articles-index.json"
  );
  if (!data) return;

  if (!data.slugToId || typeof data.slugToId !== "object") {
    addResult(false, "articles-index.json 缺少 slugToId 对象");
    return;
  }

  const slugCount = Object.keys(data.slugToId).length;
  addResult(true, `索引包含 ${slugCount} 个 slug 映射`);

  // 验证所有值都是有效的 ID（非空字符串）
  let validMappings = 0;
  for (const [slug, id] of Object.entries(data.slugToId)) {
    if (typeof id === "string" && id.length > 0 && slug.length > 0) {
      validMappings++;
    }
  }
  addResult(
    validMappings === slugCount,
    `所有映射都有效 (${validMappings}/${slugCount})`
  );

  return data;
}

/** 验证 articles-content.json */
function verifyArticlesContentJson() {
  console.log("\n📄 验证 articles-content.json...");
  const data = verifyJsonFile(
    path.join(DATA_DIR, "articles-content.json"),
    "articles-content.json"
  );
  if (!data) return;

  if (!data.articles || typeof data.articles !== "object") {
    addResult(false, "articles-content.json 缺少 articles 对象");
    return;
  }

  const articleIds = Object.keys(data.articles);
  addResult(true, `包含 ${articleIds.length} 篇文章的内容`);

  // 检查每篇文章的内容字段
  let articlesWithContent = 0;
  let articlesWithMarkdown = 0;
  for (const [id, article] of Object.entries(data.articles)) {
    const art = article as any;
    if (art.content && Array.isArray(art.content)) {
      articlesWithContent++;
    }
    if (art.content_markdown && typeof art.content_markdown === "string") {
      articlesWithMarkdown++;
    }
  }
  addResult(
    articlesWithContent === articleIds.length,
    `所有文章都有 content 字段 (${articlesWithContent}/${articleIds.length})`
  );
  addResult(
    articlesWithMarkdown === articleIds.length,
    `所有文章都有 content_markdown 字段 (${articlesWithMarkdown}/${articleIds.length})`
  );

  return data;
}

/** 验证数据一致性 */
function verifyDataConsistency(
  articlesData: any,
  indexData: any,
  contentData: any
) {
  console.log("\n🔗 验证数据一致性...");

  if (!articlesData || !indexData || !contentData) {
    addResult(false, "缺少必要的数据文件，无法验证一致性");
    return;
  }

  const articlesCount = articlesData.results?.length || 0;
  const indexCount = Object.keys(indexData.slugToId || {}).length;
  const contentCount = Object.keys(contentData.articles || {}).length;

  // 检查数量一致性
  addResult(
    articlesCount === indexCount,
    `文章数量与索引数量一致 (${articlesCount} === ${indexCount})`
  );
  addResult(
    articlesCount === contentCount,
    `文章数量与内容数量一致 (${articlesCount} === ${contentCount})`
  );

  // 验证 slug 映射一致性
  if (articlesData.results && indexData.slugToId) {
    let matchingSlugs = 0;
    for (const article of articlesData.results) {
      const slug = article.urlSlug;
      const id = article.id;
      if (slug && indexData.slugToId[slug] === id) {
        matchingSlugs++;
      }
    }
    addResult(
      matchingSlugs === articlesCount,
      `Slug 映射一致性 (${matchingSlugs}/${articlesCount})`
    );
  }

  // 验证 ID 一致性
  if (articlesData.results && contentData.articles) {
    const articleIds = new Set(articlesData.results.map((a: any) => a.id));
    const contentIds = new Set(Object.keys(contentData.articles));
    const missingInContent = Array.from(articleIds).filter(
      (id) => !contentIds.has(id)
    );
    const missingInArticles = Array.from(contentIds).filter(
      (id) => !articleIds.has(id)
    );

    addResult(
      missingInContent.length === 0,
      `所有文章 ID 都在 content 中 (缺失: ${missingInContent.length})`,
      missingInContent.length > 0 ? missingInContent : undefined
    );
    addResult(
      missingInArticles.length === 0,
      `所有 content ID 都在 articles 中 (多余: ${missingInArticles.length})`,
      missingInArticles.length > 0 ? missingInArticles : undefined
    );
  }
}

/** 验证 sitemap.xml */
function verifySitemapXml(articlesData: any) {
  console.log("\n🗺️ 验证 sitemap.xml...");
  if (!verifyXmlFile(path.join(PUBLIC_DIR, "sitemap.xml"), "sitemap.xml")) {
    return;
  }

  const content = fs.readFileSync(
    path.join(PUBLIC_DIR, "sitemap.xml"),
    "utf-8"
  );

  // 统计 URL 数量
  const urlMatches = content.match(/<url>/g);
  const urlCount = urlMatches ? urlMatches.length : 0;
  addResult(true, `Sitemap 包含 ${urlCount} 个 URL`);

  // 验证文章 URL 是否都在 sitemap 中
  if (articlesData?.results) {
    let foundUrls = 0;
    for (const article of articlesData.results) {
      if (article.urlSlug) {
        const encodedSlug = encodeURIComponent(article.urlSlug);
        if (content.includes(`/article/${encodedSlug}`)) {
          foundUrls++;
        }
      }
    }
    addResult(
      foundUrls === articlesData.results.length,
      `所有文章 URL 都在 sitemap 中 (${foundUrls}/${articlesData.results.length})`
    );
  }
}

/** 验证图片目录 */
function verifyImagesDirectory(contentData: any) {
  console.log("\n🖼️ 验证图片目录...");

  if (!fs.existsSync(IMAGES_DIR)) {
    addResult(false, "图片目录不存在");
    return;
  }
  addResult(true, "图片目录存在");

  if (!contentData?.articles) return;

  // 检查是否有文章引用了本地图片
  let articlesWithLocalImages = 0;
  let totalLocalImages = 0;
  for (const [id, article] of Object.entries(contentData.articles)) {
    const art = article as any;
    if (art.content && Array.isArray(art.content)) {
      let hasLocalImage = false;
      for (const block of art.content) {
        if (block.type === "image") {
          const url =
            block.image?.file?.url ||
            block.image?.external?.url ||
            "";
          if (url && url.startsWith("/images/articles/")) {
            hasLocalImage = true;
            totalLocalImages++;
          }
        }
      }
      if (hasLocalImage) {
        articlesWithLocalImages++;
      }
    }
  }

  if (totalLocalImages > 0) {
    addResult(
      true,
      `${articlesWithLocalImages} 篇文章包含本地图片，共 ${totalLocalImages} 张`
    );
  } else {
    addResult(true, "未检测到本地图片（可能文章中没有图片）");
  }
}

/** 验证 Markdown 格式 */
function verifyMarkdownFormat(contentData: any) {
  console.log("\n📝 验证 Markdown 格式...");

  if (!contentData?.articles) return;

  let validMarkdown = 0;
  let markdownWithContent = 0;
  for (const [id, article] of Object.entries(contentData.articles)) {
    const art = article as any;
    const markdown = art.content_markdown;
    if (typeof markdown === "string") {
      validMarkdown++;
      if (markdown.trim().length > 0) {
        markdownWithContent++;
      }
    }
  }

  addResult(
    validMarkdown === Object.keys(contentData.articles).length,
    `所有文章都有有效的 Markdown (${validMarkdown}/${Object.keys(contentData.articles).length})`
  );
  addResult(
    markdownWithContent === Object.keys(contentData.articles).length,
    `所有文章的 Markdown 都有内容 (${markdownWithContent}/${Object.keys(contentData.articles).length})`
  );
}

/** 生成验证报告 */
function generateReport(): VerificationReport {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      passed,
      failed,
    },
  };
}

/** 主函数 */
async function main() {
  console.log("🔍 Notion API 优化效果验证\n");
  console.log("=".repeat(60));

  // 验证输出文件
  const articlesData = verifyArticlesJson();
  const indexData = verifyArticlesIndexJson();
  const contentData = verifyArticlesContentJson();

  // 验证数据一致性
  verifyDataConsistency(articlesData, indexData, contentData);

  // 验证 sitemap
  verifySitemapXml(articlesData);

  // 验证图片目录
  verifyImagesDirectory(contentData);

  // 验证 Markdown 格式
  verifyMarkdownFormat(contentData);

  // 生成报告
  console.log("\n" + "=".repeat(60));
  const report = generateReport();
  console.log("\n📊 验证总结:");
  console.log(`   总计: ${report.summary.total} 项检查`);
  console.log(`   ✅ 通过: ${report.summary.passed}`);
  console.log(`   ❌ 失败: ${report.summary.failed}`);

  // 保存报告
  const reportPath = path.join(__dirname, "verification-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 详细报告已保存: ${reportPath}`);

  // 如果有失败项，退出码为 1
  if (report.summary.failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ 验证过程出错:", error);
  process.exit(1);
});
