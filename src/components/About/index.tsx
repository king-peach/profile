import type React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const About: React.FC = () => {
  const { t } = useTranslation();
  const { baseCard, baseText, accentText, dark } = useTheme();
  
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

    // 内容动画
    if (contentRef.current?.children) {
      gsap.fromTo(Array.from(contentRef.current.children),
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.2,
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top bottom-=50",
          toggleActions: "play none none reverse"
        }
      }
    );
    }
  }, []);

  return (
    <section className="py-12 md:py-16 px-4 md:px-6 max-w-7xl mx-auto" id="about"
      style={{ color: baseText }}>
      <h2 ref={titleRef} className="font-bold text-xl md:text-2xl mb-4" style={{ color: accentText }}>{t('about.header')}</h2>
      <div ref={contentRef}>
        <p className="mb-4">{t('about.para1')}</p>
        <p className="mb-4">{t('about.para2')}</p>
        <p className="mb-4">{t('about.para3')}</p>
      </div>
    </section>
  );
};

export default About;