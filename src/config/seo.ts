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
    title: '王涛 | 高级前端 · 工程化 · 复盘驱动',
    description: '高级前端与工程化实践：系统化学习、设计模式、疑难问题复盘、前端工程化与 JS 基础笔记。围绕设计模式、前端工程化、疑难问题复盘、JS 基础与随笔，记录真实项目中的技术决策和系统化学习路径。',
    keywords: '前端,高级前端,前端工程化,设计模式,疑难问题复盘,JavaScript,TypeScript,React,Vite,性能优化,架构,王涛,Eric Wang',
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
  },
  en: {
    title: 'Eric Wang | Advanced Frontend & Engineering',
    description: 'Advanced frontend and engineering practice: systematic learning, design patterns, troubleshooting retrospectives, frontend engineering, and JS basic notes. Documenting real-world technical decisions and systematic learning paths.',
    keywords: 'frontend,advanced frontend,frontend engineering,design patterns,troubleshooting retrospectives,JavaScript,TypeScript,React,Vite,performance optimization,architecture,Eric Wang',
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
