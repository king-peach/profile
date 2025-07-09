import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";

type HeaderProps = {
  sections: Array<{ id: string; label: string }>;
};

function scrollToSection(id: string) {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const Header: React.FC<HeaderProps> = ({ sections }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { dark, setDark, accent, accentText } = useTheme();

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
    <header
      className="flex items-center justify-between px-4 md:px-8 py-5 sticky top-0 z-50"
      style={{ backgroundColor: accent }}
    >
      <div className="font-extrabold text-2xl tracking-widest">{/* Logo SVG goes here */}</div>
      {/* Desktop Nav */}
      <nav className="hidden md:flex space-x-4 lg:space-x-8 items-center">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="hover:underline font-mono text-base lg:text-lg"
            style={{ color: "#fff" }}
          >
            {t(`nav.${section.id}`)}
          </button>
        ))}
        <button
          className="ml-6 px-3 py-1 rounded text-sm flex items-center border border-white/40 hover:bg-white hover:text-black transition"
          aria-label="Toggle language"
          style={{ borderColor: 'rgba(255,255,255,0.4)' }}
          onClick={toggleLanguage}
        >
          {currentLanguage === 'zh' ? 'English' : '中文'}
        </button>
        <button
          className="ml-2 px-2 py-1 rounded text-xs flex items-center border border-white/40 hover:bg-white hover:text-black transition"
          aria-label="Toggle dark mode"
          style={{ borderColor: 'rgba(255,255,255,0.4)' }}
          onClick={toggleDarkMode}
        >
          {/* Sun / Moon icons */}
          {dark ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><path d="M12 1v2m0 16v2m11-9h-2M5 12H3m16.24 7.24l-1.42-1.42M6.34 6.34L4.92 4.92m14.14 0l-1.42 1.42M6.34 17.66l-1.42 1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          )}
        </button>
      </nav>
      {/* Hamburger Icon for Mobile */}
      <button
        className="md:hidden block focus:outline-none p-2"
        aria-label="Open menu"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Mobile Nav Overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center md:hidden transition-all"
          style={{ backgroundColor: accent }}
        >
          <button className="absolute top-7 right-6 text-white text-3xl p-2" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">×</button>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => handleMobileNav(section.id)}
              className="w-full text-2xl my-2 py-2 font-mono text-white hover:underline"
            >
              {t(`nav.${section.id}`)}
            </button>
          ))}
          <div className="flex mt-8 gap-4">
            <button
              className="px-3 py-1 rounded text-sm flex items-center border border-white/40 hover:bg-white hover:text-black transition"
              aria-label="Toggle language"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={toggleLanguage}
            >
              {currentLanguage === 'zh' ? 'English' : '中文'}
            </button>
            <button
              className="px-2 py-1 rounded text-xs flex items-center border border-white/40 hover:bg-white hover:text-black transition"
              aria-label="Toggle dark mode"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={toggleDarkMode}
            >
              {dark ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><path d="M12 1v2m0 16v2m11-9h-2M5 12H3m16.24 7.24l-1.42-1.42M6.34 6.34L4.92 4.92m14.14 0l-1.42 1.42M6.34 17.66l-1.42 1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;