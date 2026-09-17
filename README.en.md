# Hi, I'm Eric Wang (王涛) 👋

> **AI Application Developer · 7 years of frontend architecture** — I turn AI capability into shipped applications, not demo toys.

🔗 **[Portfolio →](https://linxianglive.cn)** · [Blog](https://linxianglive.cn/articles) · [Upwork](https://www.upwork.com/freelancers/~014b9123cf6c2a2244) · **[中文](README.md)**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![LLM](https://img.shields.io/badge/LLM_Agent-191512?style=flat-square&logo=openai&logoColor=white)

---

## 🧭 What I Do

**Frontend architecture × AI application development.** Seven years of engineering foundation — micro-frontends, component systems, SSG — now focused on shipping LLM, Agent, and Prompt Engineering into real products. From requirements and prompt design to API integration and delivery, I run the full chain end to end.

## 💪 Quantified Track Record

| Dimension | Number | What it means |
|---|---|---|
| 🤖 AI velocity | **50%+** | AI-assisted programming boosted component development speed; built a team-level **AI Rules & Skills** system so AI-generated code ships straight to production |
| 🏗️ Micro-frontends | **5+ sub-apps** | Led qiankun/wujie adoption — style isolation, cross-app communication, permissions |
| 📈 Business impact | **+20% revenue** | 100+ SEM landing pages with analytics and monitoring, directly supporting conversion |
| 🧱 Component library | **10+ / 200h saved** | Reusable business components cutting duplicate development effort |
| 🔁 Data flywheel | **3x lower cost** | Automated Long-CoT curation → annotation → back into training |

## 🛠 Tech Stack

| Area | Technologies |
|---|---|
| **Frontend** | React · Vue2/3 · Next.js · TypeScript · TailwindCSS · Micro-frontends (qiankun/wujie) · SSG (Gatsby/Nuxt) |
| **AI Apps** | LLM application development · AI Agents · Prompt Engineering · RAG · LangChain · data annotation/synthesis pipelines |
| **Backend** | Node (Koa) · Python · FastAPI · Redis · PostgreSQL · MinIO |
| **Infrastructure** | Docker · Kubernetes · Nginx · CI/CD · OAuth2 SSO |
| **Engineering** | AI-assisted programming · Rules & Skills systems · ESLint/Commitlint standards · automated regression |

## 🚀 Selected Projects

| Project | In one line | Highlights |
|---|---|---|
| **[Enterprise AI Training & Distributed Inference Platform](https://www.upwork.com/freelancers/~014b9123cf6c2a2244?p=2098313970974490624)** | Full-chain AI platform from data asset management to K8s deployment pipelines | React/TS dashboards · real-time job tracking · Docker + K8s |
| **[Long CoT Annotation & Synthesis Platform](https://www.upwork.com/freelancers/~014b9123cf6c2a2244?p=2098322775645335552)** | A closed loop from Long-CoT curation to annotation and back into training | Enterprise easy-dataset extension · OAuth2 SSO · MinIO chunked uploads |
| **[ForgeC — AI Transpilation Engine](https://www.upwork.com/freelancers/~014b9123cf6c2a2244)** | Production-grade Python → compilable C/C++ transpilation | Isolated compile-verify-repair loop in Docker · 480+ automated tests |

## 📊 GitHub Stats

<p>
  <img height="160" src="https://github-readme-stats-sigma-five.vercel.app/api?username=king-peach&show_icons=true&hide_border=true&include_all_commits=true" alt="GitHub stats" />
  <img height="160" src="https://github-readme-stats-sigma-five.vercel.app/api/top-langs/?username=king-peach&layout=compact&hide_border=true&langs_count=8" alt="Top langs" />
</p>

## ✍️ Latest Writing

Engineering, design patterns, deep JavaScript notes, and AI application practice — [48 posts and counting →](https://linxianglive.cn/articles)

---

## 📮 Get in Touch

- 💼 Open to **full-time opportunities** (AI application development / frontend architecture)
- 🤝 Project collaboration and technical exchange — I usually reply within 1-2 days
- 📧 hello@linxianglive.cn

---

<details>
<summary>🛠 About this repo (engineering docs, click to expand)</summary>

This repository powers my portfolio site — an **ink-wash (水墨) themed personal portfolio** with Notion as CMS and static deployment.

**Stack**: React 18 + TypeScript + Vite + TailwindCSS + Framer Motion + Notion API + Nginx/Docker

**Highlights**:
- Ink dual theme (rice-paper light / ink-night dark) + zh/en i18n with cross-page state sync
- Full Notion archive page: tag / year / search filtering, published vs. draft separation
- rehype-prism highlighting (ink token palette) + copy buttons
- Notion data synced to static JSON at build time — zero runtime API calls

**Quick start**:
```bash
npm install
npm run dev                # local dev
npm run build              # build (fetches Notion data)
npm run build:skip-notion  # skip Notion sync
```

**How SSG works**: at build time the `fetch-notion` script pulls articles from the Notion API → writes `/data/*.json` → the frontend reads static files at runtime.

**License**: MIT

</details>
