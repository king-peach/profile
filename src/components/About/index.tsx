import type React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type AboutCard = {
  title: string;
  description: string;
};

const About: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { baseText, accentText, accent, dark } = useTheme();

  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const factsRef = useRef<HTMLDivElement>(null);

  const cards = t("about.cards", { returnObjects: true }) as AboutCard[];
  const facts = t("about.facts", { returnObjects: true }) as string[];
  const isChinese = i18n.language.startsWith("zh");

  useEffect(() => {
    gsap.fromTo(
      [introRef.current, cardsRef.current, factsRef.current],
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20"
      id="about"
      data-component="About"
      style={{ color: baseText }}
    >
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div
          ref={introRef}
          className={`rounded-[28px] border p-6 md:p-8 ${dark ? "glass-dark" : "glass"}`}
          style={{
            borderColor: `${accent}24`,
            backgroundColor: dark ? "rgba(24, 24, 48, 0.46)" : "rgba(255, 255, 255, 0.64)",
          }}
        >
          <div className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>
            {isChinese ? "About Me" : "About Me"}
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-4xl" style={{ color: accentText }}>
            {t("about.header")}
          </h2>
          <p className="mt-5 text-base font-semibold leading-relaxed md:text-lg">{t("about.lead")}</p>
          <div className="mt-6 space-y-4 text-sm leading-relaxed opacity-90 md:text-base">
            <p>{t("about.para1")}</p>
            <p>{t("about.para2")}</p>
            <p>{t("about.para3")}</p>
          </div>
        </div>

        <div className="grid gap-6">
          <div ref={cardsRef} className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.title}
                className={`rounded-[24px] border p-5 md:p-6 ${dark ? "glass-dark" : "glass"}`}
                style={{
                  borderColor: `${accent}20`,
                  backgroundColor: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.74)",
                }}
              >
                <div className="text-sm font-semibold md:text-base" style={{ color: accentText }}>
                  {card.title}
                </div>
                <p className="mt-3 text-sm leading-relaxed opacity-80">{card.description}</p>
              </div>
            ))}
          </div>

          <div
            ref={factsRef}
            className={`rounded-[28px] border p-6 md:p-8 ${dark ? "glass-dark" : "glass"}`}
            style={{
              borderColor: `${accent}20`,
              backgroundColor: dark ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.72)",
            }}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>
              {isChinese ? "Background Facts" : "Background Facts"}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {facts.map((fact, index) => (
                <div key={`${fact}-${index}`} className="rounded-2xl border px-4 py-4" style={{
                  borderColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(39, 48, 64, 0.08)",
                  backgroundColor: dark ? "rgba(0, 0, 0, 0.12)" : "rgba(247, 248, 250, 0.9)",
                }}>
                  <div className="text-xs uppercase tracking-[0.2em] opacity-55">
                    {isChinese ? `Info 0${index + 1}` : `Info 0${index + 1}`}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed md:text-base">{fact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
