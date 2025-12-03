# Profile - 个人主页

一个现代化的个人主页网站，集成 Notion 作为 CMS，支持 SSG 静态化部署。

## ✨ 核心功能

- **个人展示** - Hero、关于我、工作经历、联系方式等模块
- **博客系统** - 集成 Notion Database，文章数据自动同步
- **SSG 静态化** - 构建时获取 Notion 数据，无需运行时 API 调用
- **国际化** - 支持中英文切换
- **主题切换** - 支持亮色/暗色主题
- **响应式设计** - 完美适配移动端和桌面端

## 🛠 技术栈

- **框架**: React 18 + TypeScript + Vite
- **样式**: TailwindCSS + Framer Motion
- **动画**: GSAP + ScrollTrigger
- **CMS**: Notion API
- **部署**: Nginx + Docker

## 📦 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env` 文件：

```env
NOTION_API_KEY=your_notion_api_key
VITE_NOTION_API_KEY=your_notion_api_key
VITE_NOTION_DATASOURCE_ID=your_notion_database_id
```

### 本地开发

```bash
npm run dev
```

### 构建部署

```bash
# 构建（自动获取 Notion 数据）
npm run build

# 部署到服务器
./deploy.sh root@your-server
```

## 📁 项目结构

```
src/
├── components/
│   ├── Hero/          # 首屏展示
│   ├── About/         # 关于我
│   ├── Experience/    # 工作经历
│   ├── Blog/          # 博客列表
│   ├── Contact/       # 联系方式
│   └── ui/            # 通用组件
├── pages/
│   ├── ArticleList    # 文章列表页
│   └── ArticleDetail  # 文章详情页
├── i18n/              # 国际化配置
└── scripts/
    └── fetch-notion-data.ts  # Notion 数据获取脚本
```

## 🔧 SSG 工作原理

1. **构建时** - `npm run build` 自动执行 `fetch-notion` 脚本
2. **数据获取** - 从 Notion API 获取文章数据
3. **静态化** - 数据保存为 `/data/articles.json`
4. **运行时** - 前端直接读取静态 JSON，无需 API 调用

## 📝 License

MIT
