import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const sections = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
];

const THEMES = {
  purple: {
    accent: "#9333EA",
    accentHover: "#6D28D9",
    accentText: "#9333EA",
    accentDark: "#A78BFA",
    accentDarkHover: "#d93f31"
  },
  orange: {
    accent: "#d93f31",
    accentHover: "#ba281d",
    accentText: "#d93f31",
    accentDark: "#ff884d",
    accentDarkHover: "#ffad86"
  }
};

const experienceItems = [
  {
    company: "The Noun Project",
    role: "Software Engineer",
    period: "May 2019 - Present",
    description: "Global marketplace for design assets serving millions. Web app & Sketch plugin for digital asset manager, Lingo.",
    tech: ["Python (Django/Flask)", "React (Redux & Hooks)", "CSS-in-JS (Emotion)", "Docker", "AWS"]
  },
  {
    company: "Wondersauce",
    role: "Engineer",
    period: "Jul 2018 - May 2019",
    description: "Integrated advertising agency. Worked on & led projects using a variety of web development technologies.",
    tech: ["React", "React Native", "Vue", "SSGs (Gatsby, Nuxt)", "Wordpress", "Shopify", "Google Cloud", "Firebase/Firestore"]
  },
  {
    company: "Sensai",
    role: "Frontend Developer",
    period: "Feb 2016 - Jul 2018",
    description: "Hybrid social media app. Built features for a React/Redux hybrid app, Go APIs, and internal Ruby on Rails/React app.",
    tech: ["React/Redux", "Go APIs", "Docker", "Cordova", "Rails+React", "Wordpress"]
  }
];

type ThemeKey = keyof typeof THEMES;

function scrollToSection(id: string) {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function getInitialColor(): ThemeKey {
  return (localStorage.getItem('accentColor') as ThemeKey) || 'orange';
}
function getInitialDark(): boolean {
  return localStorage.getItem('darkMode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeKey>(getInitialColor());
  const [dark, setDark] = useState(getInitialDark());
  const [expTab, setExpTab] = useState(0);
  const [t, i18n] = useTranslation()

  const themeColors = THEMES[theme];

  // Get accent color for current mode
  const isOrange = theme === "orange";
  const accent = isOrange && dark ? themeColors.accentDark : themeColors.accent;
  const accentHover = isOrange && dark ? themeColors.accentDarkHover : themeColors.accentHover;
  const accentText = isOrange && dark ? themeColors.accentDark : themeColors.accentText;

  // 获取当前语言
  const currentLanguage = i18n.language || 'zh';

  useEffect(() => {
    localStorage.setItem('accentColor', theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('darkMode', dark ? 'true' : 'false');
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  const baseBg = dark ? '#181830' : '#fff';
  const baseText = dark ? '#fafafa' : '#273040';
  const baseCard = dark ? '#181830' : '#fff';
  
  // 切换语言函数
  const toggleLanguage = () => {
    const newLang = currentLanguage === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // Close menu after navigation on mobile
  const handleMobileNav = (id: string) => {
    scrollToSection(id);
    setMobileNavOpen(false);
  };

  return (
    <div className={dark ? 'dark' : ''} style={{ background: baseBg, color: baseText, minHeight: '100vh' }}>
      {/* Header Navigation */}
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
              {section.label}
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
          {/* <label className="ml-6">
            <select
              aria-label="Accent color"
              value={theme}
              onChange={e => setTheme(e.target.value as ThemeKey)}
              className="rounded px-2 py-1 text-sm ml-2 text-black"
              style={{ background: '#fff', borderColor: accent, color: accentText }}
            >
              <option value="purple">Purple</option>
              <option value="orange">Orange</option>
            </select>
          </label> */}
          <button
            className="ml-2 px-2 py-1 rounded text-xs flex items-center border border-white/40 hover:bg-white hover:text-black transition"
            aria-label="Toggle dark mode"
            style={{ borderColor: 'rgba(255,255,255,0.4)' }}
            onClick={() => setDark(v => !v)}
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
          onClick={() => setMobileNavOpen(v => !v)}
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
                {section.label}
              </button>
            ))}
            <div className="flex mt-8 gap-4">
              {/*<label>
                <select
                  aria-label="Accent color"
                  value={theme}
                  onChange={e => setTheme(e.target.value as ThemeKey)}
                  className="rounded px-2 py-1 text-sm text-black"
                  style={{ background: '#fff', color: accentText }}
                >
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                </select>
              </label> */}
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
                onClick={() => setDark(v => !v)}
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

      {/* Hero Section */}
      <section className="min-h-[45vh] flex flex-col items-center justify-center text-white pb-10 px-4 md:px-0" id="hero" style={{ backgroundColor: accent }}>
        <div className="text-sm uppercase tracking-widest mt-8">{t('hero.hi')}</div>
        <h1 className="font-mono text-lg mt-2 mb-4 text-center">Freelance Web Developer in Los Angeles</h1>
        <a
          href="#contact"
          className="border-2 border-white px-6 py-2 rounded font-semibold inline-block transition mt-2"
          style={{ color: '#fff', borderColor: '#fff', backgroundColor: 'transparent' }}
          onMouseEnter={e => {
            if (isOrange && dark) {
              (e.target as HTMLElement).style.backgroundColor = accentHover;
              (e.target as HTMLElement).style.color = '#fff';
            }
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.backgroundColor = 'transparent';
            (e.target as HTMLElement).style.color = '#fff';
          }}
        >
          Get in Touch
        </a>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-16 px-4 md:px-6 max-w-7xl mx-auto" id="about"
        style={{ background: dark ? baseCard : '#fff', color: baseText }}>
        <h2 className="font-bold text-xl md:text-2xl mb-4" style={{ color: accentText }}>{t('about.header')}</h2>
        <p className="mb-4">My name is Chase Ohlson. I'm a frontend software engineer & freelance web developer in Los Angeles—with roots in digital marketing & SEO. I'm passionate about music, technology, and basically everything that makes the internet tick.</p>
        <p className="mb-4">My work currently consists of a full-time engineering role at The Noun Project (working on <a href="https://www.lingoapp.com" className="underline" style={{ color: accentText }} target="_blank" rel="noopener noreferrer">Lingo</a>), plus managing ongoing freelance clients. This balance is resourceful for my learning as a web developer and for keeping up with new tools, libraries, and frameworks.</p>
        <p className="mb-4">Whether you're a business owner looking to get started on an app or web development project, a developer looking to collaborate on something cool, or just wanting to say hi, shoot me a message and let's work together.</p>
      </section>

      {/* Experience Section with interaction */}
      <section className="py-12 md:py-16 px-4 md:px-6 max-w-7xl mx-auto" id="experience"
        style={{ background: dark ? baseCard : '#fff', color: baseText }}>
        <h2 className="font-bold text-xl md:text-2xl mb-8" style={{ color: accentText }}>EXPERIENCE</h2>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Vertical Tabs (Companies) */}
          <div className="flex md:flex-col md:w-56 shrink-0 border-b md:border-b-0  md:border-l w-full overflow-x-auto border-[#E5E7EB] dark:border-[#292950]">
            {experienceItems.map((item, idx) => (
              <button
                key={item.company}
                className={
                  `px-3 py-2 md:py-3 w-full text-left font-mono text-sm md:text-base cursor-pointer transition
                   border-l-2 md:border-l-4 border-transparent hover:border-opacity-70
                   ${expTab === idx ? 'font-bold border-l-accent bg-[#F5F3FF] dark:bg-[#1b1b2a] text-accent' : ''}`
                }
                style={{
                  borderLeftColor: expTab === idx ? accent : 'transparent',
                  color: expTab === idx ? accent : baseText
                }}
                onClick={() => setExpTab(idx)}
                aria-selected={expTab === idx}
                aria-controls={`exp-panel-${idx}`}
              >
                {item.company}
              </button>
            ))}
          </div>
          {/* Content Display */}
          <div className="flex-1 p-2 md:pl-6">
            <div
              className="text-lg font-bold mb-1 flex flex-col md:flex-row md:items-baseline gap-2"
              id={`exp-panel-${expTab}`}
              tabIndex={0}
            >
              <span>{experienceItems[expTab].role}</span>
              <span className="block font-normal text-sm opacity-80">@ {experienceItems[expTab].company}</span>
            </div>
            <div className="font-mono text-xs mb-2 text-[#888] dark:text-[#BBB]">{experienceItems[expTab].period}</div>
            <div className="mb-2 leading-relaxed">{experienceItems[expTab].description}</div>
            <ul className="list-disc pl-6 space-y-1 mt-1">
              {experienceItems[expTab].tech.map((t, i) => (
                <li key={i} className="text-sm">{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Blog preview section */}
      <section id="blog" className="py-12 md:py-16 px-4 md:px-6" style={{ background: dark ? baseCard : '#fff', color: baseText }}>
        <h2 className="font-bold text-xl md:text-2xl mb-8 md:mb-10" style={{ color: accentText }}>RECENT POSTS</h2>
        {/* Blog post previews go here */}
      </section>

      {/* Contact/Form Section */}
      <section id="contact" className="py-20 md:py-24 px-4 md:px-6 flex flex-col items-center" style={{ background: dark ? baseCard : '#fff', color: baseText }}>
        <h2 className="font-bold text-xl md:text-2xl mb-6 text-center" style={{ color: accentText }}>NEED A LOS ANGELES WEB DEVELOPER? LET'S BUILD SOMETHING.</h2>
        <a
          href="mailto:test@example.com"
          className="border-2 px-6 py-2 rounded font-mono font-bold hover:text-white hover:bg-opacity-85 transition"
          style={{
            borderColor: accent,
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
          GET IN TOUCH
        </a>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-8 px-4 md:px-6 text-xs flex flex-col md:flex-row justify-between items-center border-t border-[#c7c1b2] gap-2" style={{ color: dark ? '#c8cac4' : '#8b97a6', background: dark ? baseCard : 'transparent' }}>
        <span>© Copyright 2025 Chase Ohlson</span>
        <span>
          <a href="https://github.com/brohlson" target="_blank" rel="noopener noreferrer" className="mx-2">Github</a>
          <a href="https://twitter.com/chase_ohlson" target="_blank" rel="noopener noreferrer" className="mx-2">Twitter</a>
          <a href="https://www.linkedin.com/in/chase-ohlson-21013349/" target="_blank" rel="noopener noreferrer" className="mx-2">LinkedIn</a>
        </span>
      </footer>
    </div>
  );
}
