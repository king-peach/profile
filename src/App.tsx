import React from "react";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import ContentMap from "./components/ContentMap";
import Blog from "./components/Blog";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingActions from "./components/FloatingActions";

const sections = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
];

// Hero 背景组件，使用主题色渐变
const HeroBackground: React.FC = () => {
  const { dark, accent, isOrange } = useTheme();

  // 根据主题色和模式生成渐变背景
  const backgroundStyle = React.useMemo(() => {
    if (dark) {
      // 暗色模式：深色渐变，使用主题色作为点缀
      if (isOrange) {
        return {
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(217, 63, 49, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 100%, rgba(217, 63, 49, 0.08) 0%, transparent 50%),
            linear-gradient(180deg, rgba(24, 24, 48, 1) 0%, rgba(30, 20, 25, 1) 50%, rgba(24, 24, 48, 1) 100%)
          `,
        };
      } else {
        return {
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(147, 51, 234, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 100%, rgba(147, 51, 234, 0.08) 0%, transparent 50%),
            linear-gradient(180deg, rgba(24, 24, 48, 1) 0%, rgba(30, 20, 40, 1) 50%, rgba(24, 24, 48, 1) 100%)
          `,
        };
      }
    } else {
      // 亮色模式：浅色渐变，使用主题色作为点缀
      if (isOrange) {
        return {
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(217, 63, 49, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 100%, rgba(217, 63, 49, 0.04) 0%, transparent 50%),
            linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 250, 248, 1) 50%, rgba(255, 255, 255, 1) 100%)
          `,
        };
      } else {
        return {
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(147, 51, 234, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 100%, rgba(147, 51, 234, 0.04) 0%, transparent 50%),
            linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(250, 248, 255, 1) 50%, rgba(255, 255, 255, 1) 100%)
          `,
        };
      }
    }
  }, [dark, accent, isOrange]);

  return (
    <div
      className="absolute inset-0 z-0"
      style={backgroundStyle}
    />
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen overflow-x-hidden">
        {/* Header 需要在最外层才能实现 sticky 效果 */}
        <Header sections={sections} />
        {/* 顶部区域：Hero 使用统一的渐变背景 */}
        <section className="relative">
          <HeroBackground />
          <div className="relative z-10">
            <Hero />
          </div>
        </section>
        <About />
        <Experience />
        <Projects />
        <ContentMap />
        <Blog />
        <Contact />
        <Footer />
        <FloatingActions />
      </div>
    </ThemeProvider>
  );
}
