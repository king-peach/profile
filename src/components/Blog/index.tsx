import type React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Blog: React.FC = () => {
  const { t } = useTranslation();
  const { baseCard, baseText, accentText, dark } = useTheme();
  
  const titleRef = useRef<HTMLHeadingElement>(null);

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
  }, []);

  return (
    <section id="blog" className="py-12 md:py-16 px-4 md:px-6" style={{ color: baseText }}>
      <h2 ref={titleRef} className="font-bold text-xl md:text-2xl mb-8 md:mb-10" style={{ color: accentText }}>{t('blog.header')}</h2>
      {/* Blog post previews go here */}
    </section>
  );
};

export default Blog;