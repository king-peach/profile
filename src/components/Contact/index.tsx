import type React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const { baseCard, baseText, accentText, accent, accentHover, dark } = useTheme();

  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const socialLinksRef = useRef<HTMLDivElement>(null);

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

    // 按钮动画
    gsap.fromTo(buttonRef.current,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        delay: 0.2,
        scrollTrigger: {
          trigger: buttonRef.current,
          start: "top bottom-=80",
          toggleActions: "play none none reverse"
        }
      }
    );

    // 社交链接动画
    if (socialLinksRef.current?.children) {
      gsap.fromTo(Array.from(socialLinksRef.current.children),
      { x: 30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.1,
        scrollTrigger: {
          trigger: socialLinksRef.current,
          start: "top bottom-=50",
          toggleActions: "play none none reverse"
        }
      }
    );
    }
  }, []);

  return (
    <section id="contact" className="py-16 md:py-24 px-4 md:px-8 flex flex-col items-center max-w-[1400px] mx-auto" style={{ color: baseText }}>
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="w-full md:w-1/3">
            <h2 ref={titleRef} className="font-bold text-2xl md:text-3xl mb-8" style={{ color: accentText }}>{t('contact.header')}</h2>
            <a
              ref={buttonRef}
              href="mailto:wtiroo@163.com"
              className="border-2 px-6 py-3 rounded font-mono font-bold hover:text-white hover:bg-opacity-85 transition inline-block"
              style={{
                color: accentText,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.backgroundColor = accentHover;
                (e.target as HTMLElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
                (e.target as HTMLElement).style.color = accentText;
              }}
            >
              {t('contact.cta')}
            </a>
          </div>
          <div ref={socialLinksRef} className="w-full md:w-1/3 flex flex-col gap-4">
            <a 
              href="https://github.com/king-peach" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 group"
            >
              <span className="text-[#d93f31] font-bold text-xl transition-transform group-hover:scale-110">+</span>
              <span className="text-sm font-mono tracking-wider transition-colors group-hover:text-[#d93f31] group-hover:font-semibold">GITHUB</span>
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 group"
            >
              <span className="text-[#d93f31] font-bold text-xl transition-transform group-hover:scale-110">+</span>
              <span className="text-sm font-mono tracking-wider transition-colors group-hover:text-[#d93f31] group-hover:font-semibold">TWITTER</span>
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 group"
            >
              <span className="text-[#d93f31] font-bold text-xl transition-transform group-hover:scale-110">+</span>
              <span className="text-sm font-mono tracking-wider transition-colors group-hover:text-[#d93f31] group-hover:font-semibold">LINKEDIN</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;