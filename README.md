# 你好，我是王涛 (Eric Wang) 👋

> **AI 应用开发工程师 · 7 年前端架构背景** — 把 AI 能力做成可上线的应用，不做 Demo 式玩具。

🔗 **[我的作品集 →](https://linxianglive.cn)** · [技术博客](https://linxianglive.cn/articles) · [Upwork](https://www.upwork.com/freelancers/~014b9123cf6c2a2244)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![LLM](https://img.shields.io/badge/LLM_Agent-191512?style=flat-square&logo=openai&logoColor=white)

---

## 🧭 技术定位

**前端架构 × AI 应用开发双栈**。7 年前端工程化底座（微前端、组件体系、SSG），现在专注 LLM/Agent/Prompt Engineering 在业务场景的端到端落地——从需求分析、Prompt 设计、API 对接到产品交付，一个人走完全链路。

## 💪 量化过的技术优势

| 维度 | 数据 | 说明 |
|---|---|---|
| 🤖 AI 提效 | **50%+** | 引入 AI 辅助编程，组件开发效率提升；沉淀团队级 **AI Rules & Skills** 体系，AI 生成代码可直接部署上线 |
| 🏗️ 微前端 | **5+ 子应用** | qiankun/wujie 微前端架构落地，解决样式隔离、通信、权限三大难题 |
| 📈 业务影响 | **+20% 营收** | 100+ SEM 落地页体系 + 埋点监控，直接支撑业务转化 |
| 🧱 组件沉淀 | **10+ / 200h** | 通用业务组件库，减少重复开发约 200 工时 |
| 🔁 数据闭环 | **3x 降本** | Long-CoT 数据策划 → 标注 → 回流训练的全链路自动化 |

## 🛠 技术栈

| 领域 | 技术 |
|---|---|
| **前端** | React · Vue2/3 · Next.js · TypeScript · TailwindCSS · 微前端 (qiankun/wujie) · SSG (Gatsby/Nuxt) |
| **AI 应用** | LLM 应用开发 · AI Agent · Prompt Engineering · RAG · LangChain · 数据标注/合成管线 |
| **后端** | Node (Koa) · Python · FastAPI · Redis · PostgreSQL · MinIO |
| **基础设施** | Docker · Kubernetes · Nginx · CI/CD · OAuth2 SSO |
| **工程效率** | AI 辅助编程 · Rules & Skills 体系 · ESLint/Commitlint 工程规范 · 自动化回归 |

## 🚀 代表项目

| 项目 | 一句话 | 技术亮点 |
|---|---|---|
| **[企业级 AI 训练与分布式推理平台](https://www.upwork.com/freelancers/~014b9123cf6c2a2244?p=2098313970974490624)** | 从数据资产管理到 K8s 部署管线的全链路 AI 平台 | React/TS 仪表盘 · 实时作业追踪 · Docker + K8s 部署管线 |
| **[Long CoT 思维链数据标注与合成平台](https://www.upwork.com/freelancers/~014b9123cf6c2a2244?p=2098322775645335552)** | Long-CoT 数据策划→标注→回流训练的完整闭环 | easy-dataset 企业级扩展 · OAuth2 SSO · MinIO 分块上传 |
| **[ForgeC — AI 转译引擎](https://www.upwork.com/freelancers/~014b9123cf6c2a2244)** | Python 代码库 → 可编译 C/C++ 的生产级转译 | Docker 隔离编译验证 · compile-verify-repair 自动循环 · 480+ 自动化测试 |

## 📊 GitHub 统计

<p>
  <img height="160" src="https://github-readme-stats.vercel.app/api?username=king-peach&show_icons=true&hide_border=true&include_all_commits=true" alt="GitHub stats" />
  <img height="160" src="https://github-readme-stats.vercel.app/api/top-langs/?username=king-peach&layout=compact&hide_border=true&langs_count=8" alt="Top langs" />
</p>

## ✍️ 最近在写

工程化、设计模式、JavaScript 深度笔记与 AI 应用实践，[48 篇持续更新 →](https://linxianglive.cn/articles)

---

## 📮 联系我

- 💼 可沟通**全职机会**（AI 应用开发 / 前端架构方向）
- 🤝 也欢迎项目合作与技术交流，默认 1-2 天内回复
- 📧 hello@linxianglive.cn

---

<details>
<summary>🛠 关于本仓库（工程文档，点击展开）</summary>

本仓库是我作品集站点的源码——**水墨风个人作品集**，集成 Notion 作为 CMS，SSG 静态化部署。

**技术栈**: React 18 + TypeScript + Vite + TailwindCSS + Framer Motion + Notion API + Nginx/Docker

**亮点设计**:
- 水墨双主题（宣纸亮色 / 墨夜暗色）+ 中英双语，跨页状态同步
- Notion 全量文章档案页：标签/年份/搜索三路筛选、已发布与草稿分离
- rehype-prism 代码高亮（水墨 token 配色）+ 复制按钮
- 构建时同步 Notion 数据为静态 JSON，运行时零 API 依赖

**快速开始**:
```bash
npm install
npm run dev          # 本地开发
npm run build        # 构建（自动拉取 Notion 数据）
npm run build:skip-notion  # 跳过 Notion 同步
```

**SSG 原理**: 构建时 `fetch-notion` 脚本从 Notion API 拉取文章 → 落地为 `/data/*.json` → 前端运行时直接读静态文件，无需 API 调用。

**License**: MIT

</details>
