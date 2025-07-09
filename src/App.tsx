import React from "react";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
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
        <Header sections={sections} />
        <Hero />
        <About />
        <Experience />
        <Blog />
        <Contact />
        <Footer />
      </div>
    </ThemeProvider>
  );
}
