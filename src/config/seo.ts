// SEO 配置文件
export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  ogType: 'website' | 'article';
}

export const SITE_URL = 'https://linxianglive.cn';
export const DEFAULT_OG_IMAGE = 'https://linxianglive.cn/avatar01.jpg';

// 首页 SEO 配置
export const HOME_SEO: Record<string, SEOConfig> = {
  zh: {
    title: '王涛 | AI 应用开发 · 工程化 · 前端架构背景',
    description: 'AI 应用开发工程师，拥有 7 年前端架构经验。聚焦 AI Agent、Prompt Engineering、LLM 应用落地，用工程化思维做 AI 产品。',
    keywords: 'AI应用开发,AI Agent,Prompt Engineering,LLM应用,AI辅助开发,前端架构,前端工程化,JavaScript,TypeScript,React,Vite,王涛,Eric Wang',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },
  en: {
    title: 'Eric Wang | AI Application Developer · Frontend Architecture',
    description: 'AI application developer with 7 years of frontend architecture experience. Focused on AI Agents, Prompt Engineering, and LLM application delivery with engineering discipline.',
    keywords: 'AI application development,AI Agent,Prompt Engineering,LLM applications,AI-assisted development,frontend architecture,frontend engineering,JavaScript,TypeScript,React,Vite,Eric Wang',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },
};

// 文章列表页 SEO 配置
export const ARTICLES_SEO: Record<string, SEOConfig> = {
  zh: {
    title: '探索文章 | 王涛',
    description: '从 Notion 数据库同步的精选技术文章，涵盖前端工程化、设计模式、疑难问题复盘、JS 基础与随笔。探索前端技术，记录真实项目中的技术决策和系统化学习路径。',
    keywords: '前端文章,技术博客,前端工程化,设计模式,JavaScript,React,Vue,前端开发',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },
  en: {
    title: 'Explore Articles | Eric Wang',
    description: 'Curated technical articles synced from Notion database, covering frontend engineering, design patterns, troubleshooting retrospectives, JS basics, and essays. Explore frontend technologies and document technical decisions.',
    keywords: 'frontend articles,tech blog,frontend engineering,design patterns,JavaScript,React,Vue,frontend development',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },
};

// 文章详情页 SEO 配置（基础模板）
export const ARTICLE_DETAIL_BASE_SEO: Record<string, Partial<SEOConfig>> = {
  zh: {
    keywords: '前端开发,JavaScript,技术文章',
  },
  en: {
    keywords: 'frontend development,JavaScript,tech article',
  },
};

// 世界杯页面 SEO 配置
export const WORLDCUP_SEO: Record<string, SEOConfig> = {
  zh: {
    title: '2026 世界杯实时比分 · 赛程 · 积分榜',
    description: '2026 FIFA 美加墨世界杯实时数据看板：48 队 12 组赛程、实时比分、积分榜、射手榜。数据来源于 FIFA 官方 API，自动更新。',
    keywords: '2026世界杯,世界杯比分,世界杯赛程,世界杯积分榜,FIFA World Cup,美加墨世界杯,世界杯实时数据,48强赛程,小组赛积分',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },
  en: {
    title: '2026 FIFA World Cup Live Scores · Schedule · Standings',
    description: '2026 FIFA World Cup live dashboard: 48 teams across 12 groups, real-time scores, group standings, and top scorers. Data sourced from FIFA official API.',
    keywords: '2026 World Cup,World Cup scores,World Cup schedule,World Cup standings,FIFA World Cup 2026,USA Canada Mexico World Cup,live football scores',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },
};

// 根据 URL 获取 canonical URL
export function getCanonicalUrl(path: string = ''): string {
  return `${SITE_URL}${path}`;
}

// 截取描述文本（限制在 160 字符）
export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// 从 HTML 内容提取纯文本描述
export function extractTextFromHTML(html: string, maxLength: number = 160): string {
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return truncateDescription(text, maxLength);
}
