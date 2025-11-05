import type React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProfileCard from "../ui/ProfileCard";
import SplitText from "../ui/SplitText";

gsap.registerPlugin(ScrollTrigger);

const Hero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { accent, accentHover, isOrange, dark } = useTheme();
  
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
    <section className="h-[50vh] min-h-[600px] flex items-center justify-between text-white px-4 md:px-8" id="hero">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between max-w-7xl">
        {/* 左侧内容 */}
        <div ref={leftContentRef} className="flex flex-col items-start md:w-1/2">
          <h1 className="text-5xl font-extrabold space-y-2">
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
        </div>
        
        {/* 右侧 Profile Card */}
        <div ref={rightImageRef} className="md:w-1/2 flex justify-end mt-8 md:mt-0">
          <div className="w-full max-w-xl">
            <ProfileCard
              avatarUrl="/avatar.jpg"
              name={t('hero.name')}
              title={t('hero.title')}
              contactText={t('hero.cta')}
              showUserInfo
              enableTilt
              className="h-[40vh] min-h-[300px]"
              onContactClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;