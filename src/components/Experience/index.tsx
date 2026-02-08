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
        { y: 10, opacity: 0 },
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
    responsibilities?: string[];
    achievements?: string[];
    tech: string[];
  }>;

  const currentExp = experienceItems[expTab];

  return (
    <section className="py-12 md:py-16 px-4 md:px-6 max-w-7xl mx-auto" id="experience" data-component="Experience"
      style={{ color: baseText }}>
      <h2 ref={titleRef} className="font-bold text-xl md:text-2xl mb-8" style={{ color: accentText }}>{t('experience.header')}</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Vertical Tabs (Companies) */}
        <div ref={tabsRef} className="flex md:flex-col md:w-56 shrink-0 border-b md:border-b-0 w-full overflow-x-auto relative" style={{ height: 'fit-content' }}>
          {/* 左侧边框线 - 仅在桌面端显示，高度自适应 */}
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-[#E5E7EB] dark:bg-[#292950]" />
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
            <span>{currentExp.role}</span>
            <span className="block font-normal text-sm opacity-80">@ {currentExp.company}</span>
          </div>
          <div className="font-mono text-xs mb-3 text-[#888] dark:text-[#BBB]">{currentExp.period}</div>
          <div className="mb-4 leading-relaxed text-sm">{currentExp.desc}</div>

          {/* 主要职责 */}
          {currentExp.responsibilities && currentExp.responsibilities.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2" style={{ color: accentText }}>{t('experience.responsibilitiesLabel')}</h4>
              <ul className="list-disc pl-5 space-y-1">
                {currentExp.responsibilities.map((item, index) => (
                  <li key={`${expTab}-resp-${index}`} className="text-sm leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 关键成果 */}
          {currentExp.achievements && currentExp.achievements.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2" style={{ color: accent }}>{t('experience.achievementsLabel')}</h4>
              <ul className="list-disc pl-5 space-y-1">
                {currentExp.achievements.map((item, index) => (
                  <li key={`${expTab}-ach-${index}`} className="text-sm leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 技术栈 */}
          <div>
            <h4 className="font-semibold text-sm mb-2 text-[#666] dark:text-[#AAA]">技术栈</h4>
            <div className="flex flex-wrap gap-2">
              {currentExp.tech.map((tech, index) => (
                <span
                  key={`${expTab}-tech-${index}`}
                  className="px-2 py-1 text-xs rounded-md"
                  style={{
                    backgroundColor: dark ? 'rgba(138, 75, 255, 0.15)' : 'rgba(138, 75, 255, 0.1)',
                    color: accent
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;