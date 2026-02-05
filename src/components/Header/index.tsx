import type React from "react";
import { useState, useEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";

type HeaderProps = {
  /** 导航区块列表 */
  sections?: Array<{ id: string; label: string }>;
  /** 是否显示导航按钮，默认 true */
  showNav?: boolean;
  /** 是否显示语言切换按钮，默认 true */
  showLanguage?: boolean;
  /** 是否显示主题切换按钮，默认 true */
  showTheme?: boolean;
  /** 插槽内容，显示在其他按钮左边 */
  leftSlot?: ReactNode;
};

function scrollToSection(id: string) {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const Header: React.FC<HeaderProps> = ({
  sections = [],
  showNav = true,
  showLanguage = true,
  showTheme = true,
  leftSlot,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, i18n } = useTranslation();
  const { dark, setDark, accent, accentText, baseText } = useTheme();

  // 监听滚动，超过一屏后激活吸顶效果
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      // 超过一屏高度时激活吸顶效果
      setIsScrolled(scrollY >= viewportHeight - 100);
    };

    // 使用 requestAnimationFrame 优化性能
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // 监听滚动事件
    window.addEventListener('scroll', onScroll, { passive: true });
    // 监听 resize 事件，确保视窗大小变化时重新计算
    window.addEventListener('resize', handleScroll, { passive: true });
    // 初始检查
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // 获取当前语言
  const currentLanguage = i18n.language || 'zh';

  // 切换语言函数
  const toggleLanguage = () => {
    const newLang = currentLanguage === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // 切换暗黑模式
  const toggleDarkMode = () => {
    setDark(!dark);
  };

  // Close menu after navigation on mobile
  const handleMobileNav = (id: string) => {
    scrollToSection(id);
    setMobileNavOpen(false);
  };

  return (
    <>
      {/* 占位元素，避免内容跳动 */}
      {isScrolled && (
        <div 
          className="h-16 md:h-20"
          aria-hidden="true"
        />
      )}
      <header
        className={`flex items-center justify-between px-4 md:px-6 lg:px-8 py-4 md:py-5 z-50 transition-all duration-300 ${
          isScrolled ? 'fixed top-0 left-0 right-0 w-full' : 'relative'
        }`}
        style={{ 
          color: baseText,
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
          backgroundColor: isScrolled
            ? (dark 
                ? "rgba(24, 24, 48, 0.85)" 
                : "rgba(255, 255, 255, 0.75)")
            : (dark 
                ? "rgba(24, 24, 48, 0.5)" 
                : "rgba(255, 255, 255, 0.25)"),
          borderBottom: isScrolled
            ? `1px solid ${dark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.08)"}`
            : `1px solid ${dark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.15)"}`,
          boxShadow: isScrolled
            ? (dark
                ? "0 8px 32px rgba(0, 0, 0, 0.3)"
                : "0 8px 32px rgba(0, 0, 0, 0.1)")
            : (dark
                ? "0 4px 24px rgba(0, 0, 0, 0.15)"
                : "0 4px 24px rgba(0, 0, 0, 0.03)"),
        }}
        data-component="Header"
      >
      <a
        href="/"
        className="flex items-center gap-3 font-extrabold text-xl md:text-2xl lg:text-3xl tracking-widest cursor-pointer transition-transform duration-300 hover:scale-105"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {/* Logo SVG goes here */}
        <img
          src="/eric.ico"
          alt="Eric logo"
          className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-lg"
          style={{
            boxShadow: dark
              ? "0 4px 12px rgba(0, 0, 0, 0.3)"
              : "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        />
        <span className="ml-1" style={{
          textShadow: dark ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "0 2px 8px rgba(255, 255, 255, 0.5)",
        }}>Eric</span>
      </a>
      {/* Desktop Nav */}
      <nav className="hidden md:flex space-x-5 lg:space-x-6 xl:space-x-8 items-center">
        {showNav && sections.map(section => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="font-mono text-base lg:text-lg transition-all duration-300 hover:scale-105 relative group"
            style={{
              textShadow: dark ? "0 1px 4px rgba(0, 0, 0, 0.3)" : "0 1px 4px rgba(255, 255, 255, 0.5)",
            }}
          >
            {t(`nav.${section.id}`)}
            <span 
              className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
              style={{ backgroundColor: accent }}
            />
          </button>
        ))}
        {/* 插槽内容 */}
        {leftSlot}
        {showLanguage && (
          <button
            className="ml-4 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Toggle language"
            style={{
              backdropFilter: "blur(16px) saturate(180%)",
              WebkitBackdropFilter: "blur(16px) saturate(180%)",
              backgroundColor: dark 
                ? "rgba(255, 255, 255, 0.1)" 
                : "rgba(255, 255, 255, 0.2)",
              border: `1px solid ${dark ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.3)"}`,
              color: baseText,
              boxShadow: dark
                ? "0 4px 12px rgba(0, 0, 0, 0.2)"
                : "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
            onClick={toggleLanguage}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = dark 
                ? "rgba(255, 255, 255, 0.2)" 
                : "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.borderColor = accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = dark 
                ? "rgba(255, 255, 255, 0.1)" 
                : "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.borderColor = dark 
                ? "rgba(255, 255, 255, 0.2)" 
                : "rgba(255, 255, 255, 0.3)";
            }}
          >
            {currentLanguage === 'zh' ? 'English' : '中文'}
          </button>
        )}
        {showTheme && (
          <button
            className="ml-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center"
            aria-label="Toggle dark mode"
            style={{
              backdropFilter: "blur(16px) saturate(180%)",
              WebkitBackdropFilter: "blur(16px) saturate(180%)",
              backgroundColor: dark 
                ? "rgba(255, 255, 255, 0.1)" 
                : "rgba(255, 255, 255, 0.2)",
              border: `1px solid ${dark ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.3)"}`,
              color: baseText,
              boxShadow: dark
                ? "0 4px 12px rgba(0, 0, 0, 0.2)"
                : "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
            onClick={toggleDarkMode}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = dark 
                ? "rgba(255, 255, 255, 0.2)" 
                : "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.borderColor = accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = dark 
                ? "rgba(255, 255, 255, 0.1)" 
                : "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.borderColor = dark 
                ? "rgba(255, 255, 255, 0.2)" 
                : "rgba(255, 255, 255, 0.3)";
            }}
          >
            {/* Sun / Moon icons */}
            {dark ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><path d="M12 1v2m0 16v2m11-9h-2M5 12H3m16.24 7.24l-1.42-1.42M6.34 6.34L4.92 4.92m14.14 0l-1.42 1.42M6.34 17.66l-1.42 1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            )}
          </button>
        )}
      </nav>
      {/* Hamburger Icon for Mobile */}
      <button
        className="md:hidden block focus:outline-none p-2.5 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Open menu"
        style={{
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          backgroundColor: dark 
            ? "rgba(255, 255, 255, 0.1)" 
            : "rgba(255, 255, 255, 0.2)",
          border: `1px solid ${dark ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.3)"}`,
        }}
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Mobile Nav Overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center md:hidden transition-all"
          style={{ 
            backgroundColor: dark 
              ? "rgba(24, 24, 48, 0.95)" 
              : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(24px) saturate(200%)",
            WebkitBackdropFilter: "blur(24px) saturate(200%)",
          }}
        >
          <button
            className="absolute text-white rounded-2xl w-12 h-12 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            style={{ 
              top: "calc(1rem + env(safe-area-inset-top))", 
              right: "1rem",
              backdropFilter: "blur(16px) saturate(180%)",
              WebkitBackdropFilter: "blur(16px) saturate(180%)",
              backgroundColor: dark 
                ? "rgba(0, 0, 0, 0.3)" 
                : "rgba(255, 255, 255, 0.2)",
              border: `1px solid ${dark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"}`,
            }}
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {showNav && sections.map(section => (
            <button
              key={section.id}
              onClick={() => handleMobileNav(section.id)}
              className="w-full text-2xl md:text-3xl my-3 py-3 font-mono transition-all duration-300 hover:scale-105"
              style={{
                color: baseText,
                textShadow: dark ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "0 2px 8px rgba(255, 255, 255, 0.5)",
              }}
            >
              {t(`nav.${section.id}`)}
            </button>
          ))}
          {/* 移动端插槽内容 */}
          {leftSlot && <div className="my-6">{leftSlot}</div>}
          <div className="flex mt-8 gap-4">
            {showLanguage && (
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center"
                aria-label="Toggle language"
                style={{
                  backdropFilter: "blur(16px) saturate(180%)",
                  WebkitBackdropFilter: "blur(16px) saturate(180%)",
                  backgroundColor: dark 
                    ? "rgba(255, 255, 255, 0.15)" 
                    : "rgba(0, 0, 0, 0.08)",
                  border: `1px solid ${dark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.15)"}`,
                  color: baseText,
                }}
                onClick={toggleLanguage}
              >
                {currentLanguage === 'zh' ? 'English' : '中文'}
              </button>
            )}
            {showTheme && (
              <button
                className="px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center"
                aria-label="Toggle dark mode"
                style={{
                  backdropFilter: "blur(16px) saturate(180%)",
                  WebkitBackdropFilter: "blur(16px) saturate(180%)",
                  backgroundColor: dark 
                    ? "rgba(255, 255, 255, 0.15)" 
                    : "rgba(0, 0, 0, 0.08)",
                  border: `1px solid ${dark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.15)"}`,
                  color: baseText,
                }}
                onClick={toggleDarkMode}
              >
                {dark ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><path d="M12 1v2m0 16v2m11-9h-2M5 12H3m16.24 7.24l-1.42-1.42M6.34 6.34L4.92 4.92m14.14 0l-1.42 1.42M6.34 17.66l-1.42 1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
    </>
  );
};

export default Header;