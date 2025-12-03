import type React from "react";
import { createContext, useState, useContext, useEffect, type ReactNode } from "react"

export const THEMES = {
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

export type ThemeKey = keyof typeof THEMES;

type ThemeContextType = {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  dark: boolean;
  setDark: (dark: boolean) => void;
  accent: string;
  accentHover: string;
  accentText: string;
  baseBg: string;
  baseText: string;
  baseCard: string;
  isOrange: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialColor(): ThemeKey {
  return (localStorage.getItem('accentColor') as ThemeKey) || 'orange';
}

function getInitialDark(): boolean {
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) {
    return stored === 'true';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const ThemeProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeKey>(getInitialColor());
  const [dark, setDark] = useState(getInitialDark());

  const themeColors = THEMES[theme];

  // Get accent color for current mode
  const isOrange = theme === "orange";
  const accent = isOrange && dark ? themeColors.accentDark : themeColors.accent;
  const accentHover = isOrange && dark ? themeColors.accentDarkHover : themeColors.accentHover;
  const accentText = isOrange && dark ? themeColors.accentDark : themeColors.accentText;

  const baseBg = dark ? '#181830' : '#fff';
  const baseText = dark ? '#fafafa' : '#273040';
  const baseCard = dark ? '#181830' : '#fff';

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

  // 如果用户未设置偏好（无 localStorage），则跟随系统主题变化
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return; // 用户已设置偏好，尊重用户选择
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      dark,
      setDark,
      accent,
      accentHover,
      accentText,
      baseBg,
      baseText,
      baseCard,
      isOrange
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};