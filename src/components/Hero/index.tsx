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
  SiDocker,
  SiGit,
  SiGnubash,
  SiJavascript,
  SiNginx,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVuedotjs,
  SiWebpack,
} from "react-icons/si";
import { FiArrowRight } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

type HeroProof = {
  value: string;
  label: string;
  detail: string;
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const Hero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { accent, accentHover, dark, baseText } = useTheme();

  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const proofGridRef = useRef<HTMLDivElement>(null);

  const greetingRaw = t("hero.greeting");
  const greetingText = greetingRaw.includes("\n")
    ? greetingRaw
    : greetingRaw.replace(/[!！]+/g, "!").replace(/!\s*/g, "!\n");
  const greetingLines = greetingText.split(/\n+/).filter((s) => s.trim().length > 0);

  const isChinese = (i18n.language || "").toLowerCase().startsWith("zh");
  const charDelay = isChinese ? 0.05 : 0.03;
  const charDuration = isChinese ? 0.7 : 0.5;
  const fromY = isChinese ? 32 : 24;
  const proofItems = t("hero.proofs", { returnObjects: true }) as HeroProof[];

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
    gsap.fromTo(
      leftContentRef.current,
      { x: -80, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.9,
        scrollTrigger: {
          trigger: leftContentRef.current,
          start: "top center",
          end: "bottom center",
          toggleActions: "play none none reverse",
        },
      }
    );

    gsap.fromTo(
      rightImageRef.current,
      { x: 80, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.9,
        scrollTrigger: {
          trigger: rightImageRef.current,
          start: "top center",
          end: "bottom center",
          toggleActions: "play none none reverse",
        },
      }
    );

    if (proofGridRef.current?.children.length) {
      gsap.fromTo(
        Array.from(proofGridRef.current.children),
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          delay: 0.2,
          scrollTrigger: {
            trigger: proofGridRef.current,
            start: "top bottom-=80",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, []);

  return (
    <section
      id="hero"
      className="min-h-[calc(100vh-80px)] px-6 pt-20 pb-16 md:px-8 md:pt-24 md:pb-20 lg:px-12 xl:px-16"
      data-component="Hero"
    >
      <div className="mx-auto grid max-w-[1600px] items-center gap-12 md:gap-16 xl:grid-cols-[1.15fr_0.85fr]">
        <div ref={leftContentRef} className="flex flex-col items-start" style={{ color: baseText }}>
          <div
            className={`mb-5 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] md:text-xs ${
              dark ? "glass-dark" : "glass"
            }`}
            style={{
              borderColor: `${accent}33`,
              color: accent,
            }}
          >
            {t("hero.tagline")}
          </div>

          <h1
            className={`space-y-2 font-extrabold leading-[1.05] tracking-tight ${
              isChinese
                ? "text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem]"
                : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
            }`}
          >
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

          <p
            className={`mt-6 max-w-3xl leading-relaxed opacity-90 ${
              isChinese ? "text-base md:text-lg" : "text-sm md:text-base lg:text-lg"
            }`}
          >
            {t("hero.subtitle")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              className="rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 md:text-base"
              style={{
                backgroundColor: accent,
                color: "#ffffff",
                boxShadow: `0 12px 30px ${accent}45`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = accentHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = accent;
              }}
              onClick={() => scrollToSection("projects")}
            >
              {t("hero.primaryCta")}
            </button>

            <button
              type="button"
              className={`rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 md:text-base ${
                dark ? "glass-dark" : "glass"
              }`}
              style={{
                color: baseText,
                borderColor: `${accent}26`,
              }}
              onClick={() => scrollToSection("experience")}
            >
              {t("hero.secondaryCta")}
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full px-2 py-3 text-sm font-medium transition-all duration-300 hover:gap-3 md:text-base"
              style={{ color: accent }}
              onClick={() => scrollToSection("blog")}
            >
              {t("hero.tertiaryCta")}
              <FiArrowRight className="h-4 w-4" />
            </button>
          </div>

          <p
            className={`mt-5 inline-block rounded-2xl px-4 py-3 ${
              dark ? "glass-dark" : "glass"
            } ${isChinese ? "text-xs md:text-sm" : "text-[11px] md:text-sm"}`}
            style={{
              maxWidth: "52rem",
            }}
          >
            {t("hero.promise")}
          </p>

          <div
            ref={proofGridRef}
            className="mt-8 grid w-full gap-3 md:grid-cols-2 xl:max-w-3xl"
          >
            {proofItems.map((item) => (
              <div
                key={`${item.value}-${item.label}`}
                className={`rounded-2xl border p-4 md:p-5 ${dark ? "glass-dark" : "glass"}`}
                style={{
                  borderColor: `${accent}24`,
                  backgroundColor: dark ? "rgba(24, 24, 48, 0.48)" : "rgba(255, 255, 255, 0.5)",
                }}
              >
                <div className="text-2xl font-extrabold md:text-3xl" style={{ color: accent }}>
                  {item.value}
                </div>
                <div className="mt-1 text-sm font-semibold md:text-base">{item.label}</div>
                <div className="mt-2 text-xs leading-relaxed opacity-75 md:text-sm">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div ref={rightImageRef} className="flex w-full justify-center xl:justify-end xl:pl-6">
          <div className="relative w-full max-w-[22.5rem] md:max-w-[26rem] lg:max-w-[29rem] xl:max-w-[31.5rem]">
            <ProfileCard
              avatarUrl="/avatar01.jpg"
              name={t("hero.name")}
              title={t("hero.title")}
              contactText={t("hero.cta")}
              showUserInfo
              enableTilt={false}
              className="h-auto min-h-[300px] md:min-h-[340px]"
              onContactClick={() => scrollToSection("contact")}
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
