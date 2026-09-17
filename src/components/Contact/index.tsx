import type React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowRight, FiGithub, FiMail, FiBookOpen, FiDownload } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const Contact: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { baseText, accentText, accent, accentHover, dark } = useTheme();

  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const isChinese = i18n.language.startsWith("zh");
  const availability = t("contact.availability", { returnObjects: true }) as string[];
  const resumeHref = isChinese ? "/resume/eric-wang-resume-zh.md" : "/resume/eric-wang-resume-en.md";

  useEffect(() => {
    gsap.fromTo(
      [contentRef.current, sideRef.current],
      { y: 36, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom-=110",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24"
      style={{ color: baseText }}
      data-component="Contact"
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div
          ref={contentRef}
          className={`rounded-[32px] border p-6 md:p-8 lg:p-10 ${dark ? "glass-dark" : "glass"}`}
          style={{
            borderColor: `${accent}24`,
            backgroundColor: dark ? "rgba(24, 24, 48, 0.48)" : "rgba(255, 255, 255, 0.68)",
          }}
        >
          <div className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>
            Contact & Collaboration
          </div>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight md:text-5xl" style={{ color: accentText }}>
            {t("contact.header")}
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed opacity-90 md:text-base lg:text-lg">
            {t("contact.lead")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="mailto:wtiroo@163.com"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 md:text-base"
              style={{
                backgroundColor: accent,
                color: "#ffffff",
                boxShadow: `0 12px 30px ${accent}42`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = accentHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = accent;
              }}
            >
              <FiMail className="h-4 w-4" />
              {t("contact.cta")}
            </a>

            <a
              href="https://github.com/king-peach"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 md:text-base"
              style={{
                borderColor: `${accent}30`,
                color: accentText,
              }}
            >
              <FiGithub className="h-4 w-4" />
              {t("contact.secondaryCta")}
            </a>

            <a
              href={resumeHref}
              download
              className="inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 md:text-base"
              style={{
                borderColor: `${accent}30`,
                color: accentText,
              }}
            >
              <FiDownload className="h-4 w-4" />
              {t("contact.resumeCta", { defaultValue: "Download Resume" })}
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {availability.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="rounded-2xl border px-4 py-4"
                style={{
                  borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(39, 48, 64, 0.08)",
                  backgroundColor: dark ? "rgba(255,255,255,0.03)" : "rgba(247, 248, 250, 0.94)",
                }}
              >
                <div className="text-xs uppercase tracking-[0.2em] opacity-55">
                  {isChinese ? `Status 0${index + 1}` : `Status 0${index + 1}`}
                </div>
                <p className="mt-3 text-sm leading-relaxed md:text-base">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div ref={sideRef} className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          <a
            href="https://github.com/king-peach"
            target="_blank"
            rel="noopener noreferrer"
            className={`group rounded-[24px] border p-5 transition-all duration-300 hover:-translate-y-1 ${dark ? "glass-dark" : "glass"}`}
            style={{
              borderColor: `${accent}20`,
              backgroundColor: dark ? "rgba(24, 24, 48, 0.42)" : "rgba(255,255,255,0.62)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] opacity-60">{t("contact.links.github")}</div>
                <div className="mt-2 text-lg font-semibold" style={{ color: accentText }}>
                  GitHub / king-peach
                </div>
              </div>
              <FiGithub className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" style={{ color: accent }} />
            </div>
            <p className="mt-4 text-sm leading-relaxed opacity-80">
              {isChinese ? "查看代码、个人项目和持续更新的工程实践。" : "Browse code, personal experiments, and ongoing engineering practice."}
            </p>
          </a>

          <a
            href="https://www.yuque.com/wpeach"
            target="_blank"
            rel="noopener noreferrer"
            className={`group rounded-[24px] border p-5 transition-all duration-300 hover:-translate-y-1 ${dark ? "glass-dark" : "glass"}`}
            style={{
              borderColor: `${accent}20`,
              backgroundColor: dark ? "rgba(24, 24, 48, 0.42)" : "rgba(255,255,255,0.62)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] opacity-60">{t("contact.links.yuque")}</div>
                <div className="mt-2 text-lg font-semibold" style={{ color: accentText }}>
                  Yuque / wpeach
                </div>
              </div>
              <FiBookOpen className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" style={{ color: accent }} />
            </div>
            <p className="mt-4 text-sm leading-relaxed opacity-80">
              {isChinese ? "更偏记录与沉淀的写作内容，适合继续了解我的知识体系。" : "More writing-focused notes and knowledge accumulation if you want a broader view of my thinking."}
            </p>
          </a>

          <a
            href="mailto:wtiroo@163.com"
            className={`group rounded-[24px] border p-5 transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-1 ${dark ? "glass-dark" : "glass"}`}
            style={{
              borderColor: `${accent}20`,
              backgroundColor: dark ? "rgba(24, 24, 48, 0.42)" : "rgba(255,255,255,0.62)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] opacity-60">{t("contact.links.email")}</div>
                <div className="mt-2 text-lg font-semibold break-all" style={{ color: accentText }}>
                  wtiroo@163.com
                </div>
              </div>
              <FiArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" style={{ color: accent }} />
            </div>
            <p className="mt-4 text-sm leading-relaxed opacity-80">
              {isChinese ? "适合直接聊机会、项目背景、团队现状或合作方式。" : "Best for direct conversation about opportunities, team context, or project collaboration."}
            </p>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
