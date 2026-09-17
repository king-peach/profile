import type React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowUpRight } from "react-icons/fi";
import datagradientScreenshot from "../../assets/datagradient-screenshot.jpg";

gsap.registerPlugin(ScrollTrigger);

interface ProjectItem {
  name: string;
  description: string;
  summary?: string;
  role?: string;
  highlights?: string[];
  metrics?: string[];
  tools: string[];
  link?: string;
  linkText?: string;
  image: string;
  imageZh?: string;
}

const Projects: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { baseText, accentText, accent, dark } = useTheme();
  const isChinese = i18n.language.startsWith("zh");

  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  const projectRefs = useRef<HTMLDivElement[]>([]);

  const projectImages: Record<string, string> = {
    datagradient: datagradientScreenshot,
  };

  const projects = t("projects.items", { returnObjects: true }) as ProjectItem[];

  useEffect(() => {
    gsap.fromTo(
      [titleRef.current, introRef.current],
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom-=120",
          toggleActions: "play none none reverse",
        },
      }
    );

    projectRefs.current.forEach((ref, index) => {
      if (!ref) return;
      gsap.fromTo(
        ref,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: index * 0.12,
          scrollTrigger: {
            trigger: ref,
            start: "top bottom-=80",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24"
      id="projects"
      data-component="Projects"
      style={{ color: baseText }}
    >
      <h2 ref={titleRef} className="text-xl font-bold md:text-2xl" style={{ color: accentText }}>
        {t("projects.header")}
      </h2>
      <p
        ref={introRef}
        className="mt-4 max-w-3xl text-sm leading-relaxed opacity-80 md:text-base"
      >
        {isChinese
          ? "这里优先展示最能代表复杂系统交付能力的项目，重点不是“做过什么页面”，而是如何拆复杂度、稳交付、做沉淀。"
          : "These projects are selected to show how I handle system complexity, delivery reliability, and reusable engineering patterns rather than isolated page building."}
      </p>

      <div className="mt-10 space-y-10">
        {projects.map((project, index) => {
          const isExternalLink = /^https?:\/\//.test(project.link || "");
          return (
          <div
            key={project.name}
            ref={(el) => {
              if (el) projectRefs.current[index] = el;
            }}
            className={`grid gap-8 overflow-hidden rounded-[28px] border p-5 md:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 xl:gap-12 ${
              dark ? "glass-dark" : "glass"
            }`}
            style={{
              borderColor: `${accent}26`,
              backgroundColor: dark ? "rgba(24, 24, 48, 0.44)" : "rgba(255, 255, 255, 0.62)",
            }}
          >
            <div className="flex flex-col">
              <div className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>
                {isChinese ? "代表案例" : "Featured Case"}
              </div>
              <h3 className="mt-4 text-2xl font-bold tracking-tight md:text-4xl" style={{ color: accentText }}>
                {project.name}
              </h3>
              {project.role && (
                <p className="mt-3 text-sm font-semibold md:text-base" style={{ color: accent }}>
                  {project.role}
                </p>
              )}
              <p className="mt-4 text-sm leading-relaxed opacity-90 md:text-base">{project.description}</p>
              {project.summary && (
                <p className="mt-4 rounded-2xl border px-4 py-4 text-sm leading-relaxed md:text-base" style={{
                  borderColor: `${accent}22`,
                  backgroundColor: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.7)",
                }}>
                  {project.summary}
                </p>
              )}

              {project.highlights && project.highlights.length > 0 && (
                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>
                    {isChinese ? "我的核心推动事项" : "What I Drove"}
                  </div>
                  <ul className="mt-4 space-y-3">
                    {project.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3 text-sm leading-relaxed md:text-base">
                        <span className="mt-1 block h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6">
                <div className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>
                  {t("projects.toolsLabel")}
                </div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {project.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full px-3 py-1.5 text-xs md:text-sm"
                      style={{
                        backgroundColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(39, 48, 64, 0.07)",
                        color: baseText,
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {project.link && (
                  <a
                    href={project.link}
                    target={isExternalLink ? "_blank" : undefined}
                    rel={isExternalLink ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 md:text-base"
                    style={{
                      backgroundColor: accent,
                      color: "#ffffff",
                      boxShadow: `0 12px 30px ${accent}42`,
                    }}
                  >
                    {project.linkText || t("projects.viewProject")}
                    <FiArrowUpRight className="h-4 w-4" />
                  </a>
                )}
                <button
                  type="button"
                  className="rounded-full border px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 md:text-base"
                  style={{
                    borderColor: `${accent}30`,
                    color: accentText,
                  }}
                  onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                >
                  {isChinese ? "交流项目细节" : "Discuss the project"}
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[24px] border p-3" style={{
                borderColor: `${accent}24`,
                backgroundColor: dark ? "rgba(13, 16, 28, 0.8)" : "rgba(247, 248, 250, 0.95)",
                boxShadow: dark
                  ? "0 24px 60px rgba(0, 0, 0, 0.45)"
                  : "0 24px 60px rgba(15, 23, 42, 0.14)",
              }}>
                <div className="mb-3 flex items-center justify-between rounded-2xl px-4 py-3" style={{
                  backgroundColor: dark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.85)",
                }}>
                    <div>
                    <div className="text-xs uppercase tracking-[0.2em] opacity-60">
                      {isChinese ? "案例预览" : "Case Preview"}
                    </div>
                    <div className="mt-1 text-sm font-semibold md:text-base">{project.name}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  </div>
                </div>

                {project.image ? (
                  <img
                    src={projectImages[project.image] || (isChinese && project.imageZh ? project.imageZh : project.image)}
                    alt={project.name}
                    className="w-full rounded-[18px] object-cover"
                  />
                ) : (
                  <div className="flex w-full items-center justify-center rounded-[18px] py-16 text-4xl" style={{
                    background: dark
                      ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))"
                      : "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))",
                  }}>
                    🤖
                  </div>
                )}
              </div>

              {project.metrics && project.metrics.length > 0 && (
                <div className="pointer-events-none mt-4 flex flex-wrap gap-3 lg:absolute lg:bottom-5 lg:left-5 lg:right-5 lg:mt-0">
                  {project.metrics.map((metric) => (
                    <div
                      key={metric}
                      className={`rounded-full px-4 py-2 text-xs font-semibold md:text-sm ${
                        dark ? "glass-dark" : "glass"
                      }`}
                      style={{
                        color: accentText,
                        borderColor: `${accent}28`,
                      }}
                    >
                      {metric}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
};

export default Projects;
