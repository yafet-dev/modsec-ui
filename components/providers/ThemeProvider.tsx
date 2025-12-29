"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Apply theme immediately to prevent flash
    const stored = localStorage.getItem("zergaw_theme") as Theme;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = stored || (prefersDark ? "dark" : "light");

    // Apply theme to HTML element immediately
    const root = document.documentElement;
    if (initialTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    setTheme(initialTheme);
    setMounted(true);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    // Remove any existing theme classes
    root.classList.remove("light", "dark");
    // Add the new theme class (only add "dark", not "light")
    if (newTheme === "dark") {
      root.classList.add("dark");
    }
    // Force a reflow to ensure styles are applied
    void root.offsetHeight;
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    // Apply theme first, then update state to trigger re-render
    applyTheme(newTheme);
    localStorage.setItem("zergaw_theme", newTheme);
    setTheme(newTheme);
  };

  // Always wrap children in Provider - use no-op toggleTheme when not mounted
  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme: mounted ? toggleTheme : () => {} }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
