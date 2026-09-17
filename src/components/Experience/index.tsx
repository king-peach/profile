import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ExperienceStat = {
  value: string;
  label: string;
};

type ExperienceItem = {
  company: string;
  role: string;
  period: string;
  desc: string;
  responsibilities?: string[];
  achievements?: string[];
  tech: string[];
};

const Experience: React.FC = () => {
  const [expTab, setExpTab] = useState(0);
  const { t, i18n } = useTranslation();
  const { baseText, accentText, accent, dark } = useTheme();

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const stats = t("experience.stats", { returnObjects: true }) as ExperienceStat[];
  const experienceItems = t("experience.companies", { returnObjects: true }) as ExperienceItem[];
  const currentExp = experienceItems[expTab];
  const isChinese = i18n.language.startsWith("zh");

  useEffect(() => {
    gsap.fromTo(
      [headingRef.current, statsRef.current, tabsRef.current, contentRef.current],
      { y: 36, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom-=110",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { y: 10, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
      }
    );
  }, [expTab]);

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20"
      id="experience"
      data-component="Experience"
      style={{ color: baseText }}
    >
      <div ref={headingRef} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>
            {isChinese ? "Career Snapshot" : "Career Snapshot"}
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl" style={{ color: accentText }}>
            {t("experience.header")}
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed opacity-80 md:text-base">
          {isChinese
            ? "重点展示我在复杂后台、中台和营销体系里的交付经历，尤其是架构治理、提效沉淀和带动团队协作的部分。"
            : "This section highlights the parts of my career most relevant to complex platforms, architecture governance, delivery acceleration, and team-level impact."}
        </p>
      </div>

      <div ref={statsRef} className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={`${stat.value}-${stat.label}`}
            className={`rounded-2xl border p-4 md:p-5 ${dark ? "glass-dark" : "glass"}`}
            style={{
              borderColor: `${accent}22`,
              backgroundColor: dark ? "rgba(24, 24, 48, 0.46)" : "rgba(255, 255, 255, 0.62)",
            }}
          >
            <div className="text-2xl font-extrabold md:text-3xl" style={{ color: accent }}>
              {stat.value}
            </div>
            <div className="mt-2 text-sm font-semibold leading-snug md:text-base">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.36fr_0.64fr]">
        <div
          ref={tabsRef}
          className={`rounded-[28px] border p-3 md:p-4 ${dark ? "glass-dark" : "glass"}`}
          style={{
            borderColor: `${accent}20`,
            backgroundColor: dark ? "rgba(24, 24, 48, 0.46)" : "rgba(255, 255, 255, 0.62)",
          }}
        >
          {experienceItems.map((item, idx) => {
            const active = idx === expTab;
            return (
              <button
                key={item.company}
                type="button"
                className="mb-2 w-full rounded-2xl border px-4 py-4 text-left transition-all duration-300 last:mb-0"
                style={{
                  borderColor: active ? `${accent}50` : dark ? "rgba(255, 255, 255, 0.08)" : "rgba(39, 48, 64, 0.08)",
                  backgroundColor: active
                    ? dark
                      ? "rgba(255, 255, 255, 0.07)"
                      : "rgba(255, 255, 255, 0.94)"
                    : "transparent",
                  boxShadow: active ? `0 12px 28px ${accent}16` : "none",
                }}
                onClick={() => setExpTab(idx)}
                aria-selected={active}
                aria-controls={`exp-panel-${idx}`}
              >
                <div className="text-sm font-semibold md:text-base" style={{ color: active ? accentText : baseText }}>
                  {item.company}
                </div>
                <div className="mt-2 text-xs font-medium opacity-75 md:text-sm">{item.role}</div>
                <div className="mt-2 text-xs opacity-60 md:text-sm">{item.period}</div>
              </button>
            );
          })}
        </div>

        <div
          ref={contentRef}
          id={`exp-panel-${expTab}`}
          className={`rounded-[28px] border p-6 md:p-8 ${dark ? "glass-dark" : "glass"}`}
          style={{
            borderColor: `${accent}24`,
            backgroundColor: dark ? "rgba(24, 24, 48, 0.46)" : "rgba(255, 255, 255, 0.66)",
          }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight md:text-3xl" style={{ color: accentText }}>
                {currentExp.role}
              </h3>
              <p className="mt-2 text-sm font-semibold md:text-base">{currentExp.company}</p>
            </div>
            <div
              className="inline-flex rounded-full px-4 py-2 text-xs font-medium md:text-sm"
              style={{
                backgroundColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(39, 48, 64, 0.07)",
                color: accentText,
              }}
            >
              {currentExp.period}
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed opacity-90 md:text-base">{currentExp.desc}</p>

          <div className="mt-7 grid gap-6 lg:grid-cols-2">
            {currentExp.responsibilities && currentExp.responsibilities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accentText }}>
                  {t("experience.responsibilitiesLabel")}
                </h4>
                <ul className="mt-4 space-y-3">
                  {currentExp.responsibilities.map((item, index) => (
                    <li key={`${expTab}-resp-${index}`} className="flex gap-3 text-sm leading-relaxed md:text-base">
                      <span className="mt-1.5 block h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentExp.achievements && currentExp.achievements.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>
                  {t("experience.achievementsLabel")}
                </h4>
                <div className="mt-4 grid gap-3">
                  {currentExp.achievements.map((item, index) => (
                    <div
                      key={`${expTab}-ach-${index}`}
                      className="rounded-2xl border px-4 py-4 text-sm leading-relaxed md:text-base"
                      style={{
                        borderColor: `${accent}22`,
                        backgroundColor: dark ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.86)",
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-7">
            <h4 className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>
              {isChinese ? "技术栈" : "Tech Stack"}
            </h4>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {currentExp.tech.map((tech, index) => (
                <span
                  key={`${expTab}-tech-${index}`}
                  className="rounded-full px-3 py-1.5 text-xs md:text-sm"
                  style={{
                    backgroundColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(39, 48, 64, 0.07)",
                    color: baseText,
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
