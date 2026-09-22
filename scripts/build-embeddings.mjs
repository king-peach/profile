#!/usr/bin/env node
/**
 * Build-time RAG indexer.
 * Reads public/data/articles-content.json (+ curated profile facts),
 * chunks by markdown headings (~600 chars), embeds via SiliconFlow
 * BAAI/bge-m3, writes public/data/embeddings.json for client-side
 * cosine retrieval.
 *
 * Usage: SF_API_KEY=xxx node scripts/build-embeddings.mjs
 */
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const ROOT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const API = "https://api.siliconflow.cn/v1";
const MODEL = "BAAI/bge-m3";
const KEY = process.env.SF_API_KEY;
if (!KEY) {
  console.error("SF_API_KEY missing");
  process.exit(1);
}

const content = JSON.parse(
  fs.readFileSync(path.join(ROOT, "public/data/articles-content.json"), "utf8")
);
const slugMap = JSON.parse(
  fs.readFileSync(path.join(ROOT, "public/data/articles-index.json"), "utf8")
).slugToId;

function prop(p, type, field) {
  for (const v of Object.values(p || {})) {
    if (v && v.type === type) {
      if (type === "title") return (v.title || []).map((x) => x.plain_text || "").join("");
      if (type === "rich_text") return (v.rich_text || []).map((x) => x.plain_text || "").join("");
      if (type === "select") return v.select?.name || "";
      if (type === "date") return v.date?.start?.slice(0, 10) || "";
      if (type === "status") return v.status?.name || "";
    }
  }
  return field === undefined ? "" : field;
}

// ---- chunking ----
const chunks = [];
function add(slug, title, date, tag, published, text) {
  text = text.replace(/\s+/g, " ").trim();
  if (text.length < 30) return;
  const header = `《${title}》${date ? `(${date})` : ""}${tag ? `[${tag}]` : ""}`;
  chunks.push({
    slug,
    title,
    published,
    text: (header + "\n" + text).slice(0, 900),
  });
}

for (const [slug, aid] of Object.entries(slugMap)) {
  const a = content.articles[aid];
  const p = a.properties || {};
  const title = prop(p, "title");
  const tag = prop(p, "select");
  const date = prop(p, "date") || (a.created_time || "").slice(0, 10);
  const published = prop(p, "status") === "Published";
  const md = a.content_markdown || "";
  const summary = Object.values(p).find((v) => v && v.type === "rich_text" && (v.rich_text || []).length && JSON.stringify(v).includes("summary"));
  // split by headings, pack to ~600 chars
  const parts = md.split(/\n(?=#{1,3} )/);
  let buf = "";
  for (const part of parts) {
    const t = part.trim();
    if (!t) continue;
    if (buf.length + t.length > 600 && buf) {
      add(slug, title, date, tag, published, buf);
      buf = t;
    } else {
      buf = (buf + "\n" + t).trim();
    }
  }
  if (buf) add(slug, title, date, tag, published, buf);
}

// ---- curated profile facts (site owner) ----
const profileChunks = [
  "王涛 (Eric Wang)，AI 应用开发工程师，7 年前端架构背景，现居长沙。专注 LLM / Agent / Prompt Engineering 的业务落地，主张端到端交付：需求分析 → Prompt 设计 → API 对接 → 前端交付。联系方式：邮箱 wtiroo@163.com，可沟通全职机会与项目合作，默认 1-2 天内回复。作品集 https://linxianglive.cn ，Upwork: https://www.upwork.com/freelancers/~014b9123cf6c2a2244",
  "王涛的量化业绩：引入 AI 辅助编程使组件开发效率提升 50%+，沉淀团队级 AI Rules & Skills 体系使 AI 生成代码可直接部署；qiankun/wujie 微前端集成 5+ 子应用；100+ SEM 落地页支撑业务营收提升约 20%；封装 10+ 通用组件节省约 200 工时；Long-CoT 数据策划开销降低 3 倍。",
  "王涛的代表项目：1) 企业级 AI 训练与分布式推理平台（React/TS 仪表盘、Docker+K8s 部署管线、实时作业追踪）；2) Long CoT 思维链数据标注与合成平台（easy-dataset 企业级扩展、OAuth2 SSO、MinIO 分块上传、推理轨迹回流训练）；3) ForgeC AI 转译引擎（Python→可编译 C/C++，Docker 隔离 compile-verify-repair 循环，480+ 自动化测试）。",
  "王涛的技术栈：前端 React/Vue2-3/Next.js/TypeScript/TailwindCSS/微前端(qiankun,wujie)/SSG(Gatsby,Nuxt)；AI 应用 LLM/Agent/Prompt Engineering/RAG/LangChain/数据标注与合成管线；后端 Node(Koa)/Python/FastAPI/Redis/PostgreSQL/MinIO；基础设施 Docker/Kubernetes/Nginx/CI/CD/OAuth2 SSO。",
];
for (const text of profileChunks) {
  chunks.push({ slug: "", title: "关于王涛（站点主人）", published: true, text });
}

console.log(`chunks: ${chunks.length}`);

// ---- embed in batches ----
async function embed(inputs) {
  const res = await fetch(`${API}/embeddings`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, input: inputs }),
  });
  if (!res.ok) throw new Error(`embed ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  return json.data.map((d) => d.embedding);
}

const vectors = [];
const BATCH = 32;
for (let i = 0; i < chunks.length; i += BATCH) {
  const batch = chunks.slice(i, i + BATCH).map((c) => c.text);
  const vs = await embed(batch);
  vectors.push(...vs);
  process.stdout.write(`\r${Math.min(i + BATCH, chunks.length)}/${chunks.length}`);
}
console.log("");

const out = {
  model: MODEL,
  dim: vectors[0].length,
  builtAt: new Date().toISOString(),
  chunks: chunks.map((c, i) => ({ ...c, v: vectors[i].map((x) => Math.round(x * 1e4) / 1e4) })),
};
const dest = path.join(ROOT, "public/data/embeddings.json");
fs.writeFileSync(dest, JSON.stringify(out));
console.log(`written: ${dest} (${(fs.statSync(dest).size / 1024 / 1024).toFixed(2)} MB)`);
