import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
  noindex?: boolean;
  schemaLD?: Record<string, unknown>;
  locale?: string;
}

const DEFAULT_LOCALE = 'zh_CN';

export default function SEO({
  title,
  description,
  keywords,
  ogImage = 'https://linxianglive.cn/avatar01.jpg',
  ogType = 'website',
  canonicalUrl,
  noindex = false,
  schemaLD,
  locale = DEFAULT_LOCALE,
}: SEOProps) {
  // 构建页面标题（如果标题中没有分隔符，添加默认的分隔符）
  const fullTitle = title.includes('|') ? title : `${title} | 王涛`;
  
  return (
    <Helmet>
      {/* 基础 Meta 标签 */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="王涛 / Eric Wang" />
      
      {/* Robots */}
      <meta
        name="robots"
        content={noindex ? 'noindex,nofollow' : 'index,follow'}
      />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* 语言和地区 */}
      <html lang={locale.replace('_', '-')} />
      <meta property="og:locale" content={locale.replace('_', '-')} />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="zh_CN" />
      
      {/* Open Graph 标签 */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Eric" />
      
      {/* Twitter Card 标签 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* 结构化数据 (JSON-LD) */}
      {schemaLD && (
        <script type="application/ld+json">
          {JSON.stringify(schemaLD)}
        </script>
      )}
    </Helmet>
  );
}
