import type React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProfileCard from "../ui/ProfileCard";
import SplitText from "../ui/SplitText";
import LogoLoop from "../ui/LogoLoop";
import {
  SiReact,
  SiVuedotjs,
  SiNodedotjs,
  SiTypescript,
  SiDocker,
  SiNginx,
  SiGnubash,
  SiGit,
  SiJavascript,
  SiTailwindcss,
  SiWebpack,
} from "react-icons/si";
import { FiDownload } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const Hero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { accent, accentHover, isOrange, dark, baseText } = useTheme();
  
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);

  // 欢迎语文本：优先使用换行；如无换行则按感叹号插入换行
  const greetingRaw = t('hero.greeting');
  const greetingText = greetingRaw.includes('\n')
    ? greetingRaw
    : greetingRaw.replace(/[!！]+/g, '!').replace(/!\s*/g, '!\n');
  const greetingLines = greetingText.split(/\n+/).filter((s) => s.trim().length > 0);

  // 根据语言调整逐字动画参数
  const isChinese = (i18n.language || '').toLowerCase().startsWith('zh');
  const charDelay = isChinese ? 0.05 : 0.03;
  const charDuration = isChinese ? 0.7 : 0.5;
  const fromY = isChinese ? 32 : 24;

  // 技术栈图标：使用 react-icons/si 品牌图标
  const techLogos: React.ReactNode[] = [
    <SiReact key="react" size={32} color={dark ? "#e5e7eb" : "#6b7280"} />,
    <SiVuedotjs key="vue" size={32} color={dark ? "#e5e7eb" : "#6b7280"} />,
    <SiNodedotjs key="node" size={32} color={dark ? "#e5e7eb" : "#6b7280"} />,
    <SiTypescript key="typescript" size={32} color={dark ? "#e5e7eb" : "#6b7280"} />,
    <SiDocker key="docker" size={32} color={dark ? "#e5e7eb" : "#6b7280"} />,
    <SiNginx key="nginx" size={32} color={dark ? "#e5e7eb" : "#6b7280"} />,
    <SiGnubash key="shell" size={32} color={dark ? "#e5e7eb" : "#6b7280"} />,
    <SiGit key="git" size={32} color={dark ? "#e5e7eb" : "#6b7280"} />,
    <SiJavascript key="javascript" size={32} color={dark ? "#e5e7eb" : "#6b7280"} />,
    <SiTailwindcss key="tailwindcss" size={32} color={dark ? "#e5e7eb" : "#6b7280"} />,
    <SiWebpack key="webpack" size={32} color={dark ? "#e5e7eb" : "#6b7280"} />,
  ];

  useEffect(() => {
    // 左侧内容动画
    gsap.fromTo(leftContentRef.current,
      { x: -100, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: leftContentRef.current,
          start: "top center",
          end: "bottom center",
          toggleActions: "play none none reverse"
        }
      }
    );

    // 右侧图片动画
    gsap.fromTo(rightImageRef.current,
      { x: 100, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1,
        scrollTrigger: {
          trigger: rightImageRef.current,
          start: "top center",
          end: "bottom center",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  return (
    <section
      id="hero"
      className="min-h-[calc(100vh-80px)] flex items-start md:items-center justify-between px-6 md:px-8 lg:px-12 xl:px-16 pt-20 md:pt-24 pb-16 md:pb-20"
      data-component="Hero"
    >
      <div className="mx-auto flex flex-col md:flex-row items-center justify-between max-w-[1600px] gap-12 md:gap-16 w-full">
        {/* 左侧内容：标签 + 主标题 + 副标题 + CTA */}
        <div
          ref={leftContentRef}
          className="flex flex-col items-start md:w-[58%] lg:w-[55%] space-y-6 md:space-y-8"
          style={{ color: baseText }}
        >
          {/* 顶部标签行：体现系统化学习 / 复盘 / 高级前端 / 工程化 */}
          <div 
            className={`tracking-[0.15em] uppercase mb-2 ${
              dark ? 'glass-dark' : 'glass'
            } px-4 py-2 rounded-full ${
              isChinese ? "text-xs md:text-sm" : "text-[10px] md:text-xs"
            }`}
            style={{
              opacity: 0.9,
              backdropFilter: dark ? 'blur(12px) saturate(180%)' : 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: dark ? 'blur(12px) saturate(180%)' : 'blur(12px) saturate(180%)',
              backgroundColor: dark 
                ? `rgba(24, 24, 48, 0.55)` 
                : `rgba(255, 255, 255, 0.25)`,
              borderColor: dark 
                ? `rgba(255, 255, 255, 0.12)` 
                : `rgba(255, 255, 255, 0.2)`,
            }}
          >
            {t("hero.tagline", {
              defaultValue:
                "Systematic Learning · Retrospective Driven · Advanced Frontend & Engineering",
            })}
          </div>

          {/* 主标题：保留逐字动画，根据语言调整字号 */}
          <h1 className={`font-extrabold leading-[1.15] tracking-tight space-y-2 ${
            isChinese 
              ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl" 
              : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
          }`}>
            {greetingLines.map((line, idx) => (
              <SplitText
                key={idx}
                tag="span"
                text={line.trim()}
                className="block"
                splitType="chars"
                delay={charDelay}
                duration={charDuration}
                ease="power3.out"
                from={{ opacity: 0, y: fromY }}
                to={{ opacity: 1, y: 0 }}
              />
            ))}
          </h1>

          {/* 副标题：具体说明内容方向和受众，英文时字号稍小 */}
          <p className={`max-w-2xl opacity-90 leading-relaxed mt-2 ${
            isChinese 
              ? "text-sm md:text-base lg:text-lg" 
              : "text-xs md:text-sm lg:text-base"
          }`}>
            {t("hero.subtitle", {
              defaultValue:
                "围绕设计模式、前端工程化、疑难问题复盘、JS 基础与随笔，记录真实项目中的技术决策和系统化学习路径，帮在职前端构建可复用的知识体系，也让雇主看见高级前端的工程化价值。",
            })}
          </p>

          {/* CTA 区域：主按钮引导到精选/进阶路线，次按钮到关于/合作 */}
          <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
            <button
              type="button"
              className="px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: accent,
                color: '#ffffff',
                boxShadow: `0 8px 24px ${accent}40`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = accentHover;
                e.currentTarget.style.boxShadow = `0 10px 28px ${accent}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = accent;
                e.currentTarget.style.boxShadow = `0 8px 24px ${accent}40`;
              }}
              onClick={() =>
                document.getElementById("blog")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              {t("hero.primaryCta", {
                defaultValue: "从进阶路线开始阅读 →",
              })}
            </button>
            <button
              type="button"
              className={`px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                dark ? 'glass-dark' : 'glass'
              } hover:scale-105 active:scale-95`}
              style={{
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                backgroundColor: dark 
                  ? `rgba(24, 24, 48, 0.55)` 
                  : `rgba(255, 255, 255, 0.28)`,
                borderColor: dark 
                  ? `rgba(255, 255, 255, 0.2)` 
                  : `rgba(255, 255, 255, 0.25)`,
                color: baseText,
              }}
              onClick={() =>
                document.getElementById("about")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              {t("hero.secondaryCta", {
                defaultValue: "关于我与合作 →",
              })}
            </button>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                dark ? 'glass-dark' : 'glass'
              } hover:scale-105 active:scale-95 flex items-center gap-2`}
              style={{
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                backgroundColor: dark 
                  ? `rgba(24, 24, 48, 0.55)` 
                  : `rgba(255, 255, 255, 0.28)`,
                borderColor: dark 
                  ? `rgba(255, 255, 255, 0.2)` 
                  : `rgba(255, 255, 255, 0.25)`,
                color: baseText,
              }}
            >
              <FiDownload className="w-4 h-4 md:w-5 md:h-5" />
              {t("hero.downloadResume", { defaultValue: "下载简历" })}
            </a>
          </div>

          {/* 承诺/风格说明：过程型信息而非数据 */}
          <p className={`mt-4 opacity-75 ${
            dark ? 'glass-dark' : 'glass'
          } px-4 py-2 rounded-lg inline-block ${
            isChinese ? "text-xs md:text-sm" : "text-[10px] md:text-xs"
          }`}
          style={{
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            backgroundColor: dark 
              ? `rgba(24, 24, 48, 0.5)` 
              : `rgba(255, 255, 255, 0.22)`,
            borderColor: dark 
              ? `rgba(255, 255, 255, 0.12)` 
              : `rgba(255, 255, 255, 0.2)`,
          }}>
            {t("hero.promise", {
              defaultValue:
                "以系统化学习和复盘为核心，持续更新的高级前端与工程化笔记。",
            })}
          </p>
        </div>

        {/* 右侧 Profile Card */}
        <div
          ref={rightImageRef}
          className="w-full md:w-[42%] lg:w-[45%] flex justify-center md:justify-end mt-12 md:mt-0"
        >
          <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
            <ProfileCard
              avatarUrl="/avatar01.jpg"
              name={t("hero.name")}
              title={t("hero.title")}
              contactText={t("hero.cta")}
              showUserInfo
              enableTilt
              className="h-auto min-h-[260px] sm:min-h-[280px] md:min-h-[300px] lg:min-h-[320px] max-h-[400px] md:max-h-[420px]"
              onContactClick={() =>
                document.getElementById("contact")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              techStack={
                <LogoLoop
                  logos={techLogos}
                  speed={80}
                  repeatCount={4}
                  direction="left"
                  logoHeight={28}
                  gap={24}
                  pauseOnHover
                  fadeOut
                  fadeOutColor="transparent"
                  scaleOnHover
                  ariaLabel="Technology stack"
                  className="py-1"
                />
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;