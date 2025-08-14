import type React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { baseCard, accentText, dark } = useTheme();

  const footerRef = useRef<HTMLElement>(null);

  // useEffect(() => {
  //   gsap.fromTo(footerRef.current,
  //     { y: 20, opacity: 0 },
  //     {
  //       y: 0,
  //       opacity: 1,
  //       duration: 0.6,
  //       scrollTrigger: {
  //         trigger: footerRef.current,
  //         start: "top bottom",
  //         toggleActions: "play none none reverse"
  //       }
  //     }
  //   );
  // }, []);

  return (
    <footer ref={footerRef} className="py-6 md:py-8 px-4 md:px-6 text-xs flex flex-col md:flex-row justify-between items-center border-t border-[#c7c1b2] gap-2" style={{ color: dark ? '#c8cac4' : '#8b97a6' }}>
      <span>{t('footer.copyright')} <a target="_blank" href="https://beian.miit.gov.cn/" rel="noreferrer" style={{ color: accentText }}>湘ICP备2022001339号</a> </span>
      <span>
        <a href="https://github.com/king-peach" target="_blank" rel="noopener noreferrer" className="mx-2">Github</a>
        <a href="https://www.yuque.com/wpeach" target="_blank" rel="noopener noreferrer" className="mx-2">Yuque</a>
        { /* <a href="https://www.linkedin.com/in/chase-ohlson-21013349/" target="_blank" rel="noopener noreferrer" className="mx-2">LinkedIn</a> */}
      </span>
    </footer>
  );
};

export default Footer;