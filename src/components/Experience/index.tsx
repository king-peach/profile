import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Experience: React.FC = () => {
  const [expTab, setExpTab] = useState(0);
  const { t } = useTranslation();
  const { baseCard, baseText, accentText, accent, dark } = useTheme();

  const titleRef = useRef<HTMLHeadingElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
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

    // 选项卡动画
    if (tabsRef.current?.children) {
      gsap.fromTo(Array.from(tabsRef.current.children),
      { x: -30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: tabsRef.current,
          start: "top bottom-=50",
          toggleActions: "play none none reverse"
        }
      }
    );
    }
  }, []);

  // 内容切换动画
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        }
      );
    }
  }, [expTab]);

  const experienceItems = t('experience.companies', { returnObjects: true }) as Array<{
    company: string;
    role: string;
    period: string;
    desc: string;
    tech: string[];
  }>;

  return (
    <section className="py-12 md:py-16 px-4 md:px-6 max-w-7xl mx-auto" id="experience"
      style={{ color: baseText }}>
      <h2 ref={titleRef} className="font-bold text-xl md:text-2xl mb-8" style={{ color: accentText }}>{t('experience.header')}</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Vertical Tabs (Companies) */}
        <div ref={tabsRef} className="flex md:flex-col md:w-56 shrink-0 border-b md:border-b-0  md:border-l w-full overflow-x-auto border-[#E5E7EB] dark:border-[#292950]">
          {experienceItems.map((item, idx) => (
            <button
              key={item.company}
              className={
                `px-3 py-2 md:py-3 w-full text-left font-mono text-sm md:text-base cursor-pointer transition
                 border-l-2 md:border-l-4 border-transparent hover:border-opacity-70
                 ${expTab === idx ? 'font-bold border-l-accent bg-[#F5F3FF] dark:bg-[#1b1b2a] text-accent' : ''}`
              }
              style={{
                borderLeftColor: expTab === idx ? accent : 'transparent',
                color: expTab === idx ? accent : baseText
              }}
              onClick={() => setExpTab(idx)}
              aria-selected={expTab === idx}
              aria-controls={`exp-panel-${idx}`}
            >
              {item.company}
            </button>
          ))}
        </div>
        {/* Content Display */}
        <div ref={contentRef} className="flex-1 p-2 md:pl-6">
          <div
            className="text-lg font-bold mb-1 flex flex-col md:flex-row md:items-baseline gap-2"
            id={`exp-panel-${expTab}`}
            tabIndex={0}
          >
            <span>{experienceItems[expTab].role}</span>
            <span className="block font-normal text-sm opacity-80">@ {experienceItems[expTab].company}</span>
          </div>
          <div className="font-mono text-xs mb-2 text-[#888] dark:text-[#BBB]">{experienceItems[expTab].period}</div>
          <div className="mb-2 leading-relaxed">{experienceItems[expTab].desc}</div>
          <ul className="list-disc pl-6 space-y-1 mt-1">
            {experienceItems[expTab].tech.map((tech, index) => (
              <li key={`${expTab}-tech-${index}`} className="text-sm">{tech}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Experience;