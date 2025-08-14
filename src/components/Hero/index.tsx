import type React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const { accent, accentHover, isOrange, dark } = useTheme();
  
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);

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
    <section className="h-[50vh] min-h-[600px] flex items-center justify-between text-white px-4 md:px-8" id="hero" style={{ backgroundColor: accent }}>
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between max-w-7xl">
        {/* 左侧内容 */}
        <div ref={leftContentRef} className="flex flex-col items-start md:w-1/2">
          <p className="text-sm font-mono mb-2">{t('hero.hi')}</p>
          <h1 className="text-5xl font-extrabold mb-2">{t('hero.name')}</h1>
          <p className="text-lg font-mono text-white/80">{t('hero.title')}</p>
          <button 
            className="mt-6 px-6 py-2 border border-white/40 text-white font-mono text-sm hover:bg-white hover:text-black transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.4)' }}
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('hero.cta')}
          </button>
        </div>
        
        {/* 右侧图片 */}
        <div ref={rightImageRef} className="md:w-1/2 flex justify-end mt-8 md:mt-0">
          <div className="w-full max-w-xl">
            <img src="/avatar.jpg" alt="Profile" className="w-full h-[40vh] min-h-[300px] object-cover" onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22288%22%20height%3D%22288%22%20viewBox%3D%220%200%20288%20288%22%3E%3Crect%20fill%3D%22%23ffffff%22%20opacity%3D%220.2%22%20width%3D%22288%22%20height%3D%22288%22%2F%3E%3Ctext%20fill%3D%22%23ffffff%22%20font-family%3D%22Arial%22%20font-size%3D%2224%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%20x%3D%22144%22%20y%3D%22144%22%20dominant-baseline%3D%22middle%22%3E图片占位符%3C%2Ftext%3E%3C%2Fsvg%3E';
            }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;