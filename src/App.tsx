import React from "react";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import PrismBackground from "./components/ui/PrismBackground";
import About from "./components/About";
import Experience from "./components/Experience";
import Blog from "./components/Blog";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

const sections = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
];

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        {/* 顶部区域：Header + Hero 使用统一的 Prism 背景 */}
        <section className="relative">
          <PrismBackground
            animationType="3drotate"
            timeScale={0.4}
            colorFrequency={0.8}
            glow={1.2}
            bloom={1.2}
            noise={0.25}
            baseHue={0}        // 红色为主
            hueRange={28}      // 轻微色相波动
            satBase={65}
            satRange={25}
            lumBase={72}       // 更浅的亮度基线
            lumRange={12}
            suspendWhenOffscreen
            className="z-0 opacity-80"
          />
          <div className="relative z-10">
            <Header sections={sections} />
            <Hero />
          </div>
        </section>
        <About />
        <Experience />
        <Blog />
        <Contact />
        <Footer />
      </div>
    </ThemeProvider>
  );
}
