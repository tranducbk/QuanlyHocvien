"use client";

import Cookies from "js-cookie";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { THEMES } from "@/constants/constants";

export interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;
}

interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const normalizeTheme = (theme?: string) =>
  theme === THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}

export default function ThemeProvider({
  children,
  initialTheme,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState(() => normalizeTheme(initialTheme));

  const setTheme = useCallback((nextTheme: string) => {
    setThemeState(normalizeTheme(nextTheme));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(THEMES.LIGHT, THEMES.DARK);
    root.classList.add(theme);
    Cookies.set("theme", theme, { expires: 365 });
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
