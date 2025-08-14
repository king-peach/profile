import type React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

const Blog: React.FC = () => {
  const { t } = useTranslation();
  const { baseCard, baseText, accentText, dark } = useTheme();
  
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 标题动画
    gsap.fromTo(titleRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        }
      }
    );

    // 卡片动画
    if (cardsRef.current && cardsRef.current.children.length > 0) {
      gsap.fromTo(Array.from(cardsRef.current.children),
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top bottom-=50",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, []);

  return (
    <section id="blog" className="py-12 md:py-16 px-4 md:px-6 max-w-7xl mx-auto" style={{ color: baseText }}>
      <h2 ref={titleRef} className="font-bold text-xl md:text-2xl mb-8 md:mb-10" style={{ color: accentText }}>{t('blog.header')}</h2>
      
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 第一个博客卡片 */}
        <Card className={cn("overflow-hidden transition-all hover:shadow-lg", dark ? "bg-zinc-800 border-zinc-700" : "")}>
          <CardHeader>
            <CardTitle style={{ color: accentText }}>React 18 新特性解析</CardTitle>
            <CardDescription className="text-sm" style={{ color: baseText }}>2023-10-15</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm" style={{ color: baseText }}>
              React 18 带来了许多令人兴奋的新特性，包括并发渲染、自动批处理和过渡API。本文将深入探讨这些特性如何提升应用性能和用户体验。
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-xs" style={{ color: baseText }}>阅读时间: 5分钟</p>
            <button className="text-sm font-medium" style={{ color: accentText }}>阅读更多 →</button>
          </CardFooter>
        </Card>

        {/* 第二个博客卡片 */}
        <Card className={cn("overflow-hidden transition-all hover:shadow-lg", dark ? "bg-zinc-800 border-zinc-700" : "")}>
          <CardHeader>
            <CardTitle style={{ color: accentText }}>TypeScript 高级类型技巧</CardTitle>
            <CardDescription className="text-sm" style={{ color: baseText }}>2023-09-28</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm" style={{ color: baseText }}>
              掌握TypeScript的高级类型系统可以大幅提升代码质量和开发效率。本文介绍条件类型、映射类型和类型推断等高级技巧，帮助你编写更安全、更灵活的代码。
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-xs" style={{ color: baseText }}>阅读时间: 8分钟</p>
            <button className="text-sm font-medium" style={{ color: accentText }}>阅读更多 →</button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
};

export default Blog;