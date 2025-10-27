/**
 * Theme Provider Component (Dark Default)
 *
 * Provides only light/dark theme switching for HabitFlow.
 * Default theme = Dark Mode 
 */

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { theme, type Theme } from "@/theme";

// ============================================================================
// TYPES
// ============================================================================

type ThemeMode = "light" | "dark";
 
interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================================================
// HOOKS (exported separately to avoid react-refresh warnings)
// ============================================================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}

export function useHabitTheme() {
  const { theme: currentTheme } = useTheme();

  return {
    getHabitStateColors: (state: keyof typeof currentTheme.habit.states) =>
      currentTheme.habit.states[state],

    getStreakLevel: (streakCount: number) => {
      for (const [level, config] of Object.entries(currentTheme.habit.streaks)) {
        if (streakCount >= config.min && streakCount <= config.max) {
          return { level, color: config.color, min: config.min, max: config.max };
        }
      }
      const legend = currentTheme.habit.streaks.legend;
      return { level: "legend", color: legend.color, min: legend.min, max: legend.max };
    },

    getThemeColor: (colorPath: string, mode: ThemeMode = "light"): string => {
      const path = colorPath.split(".");
      let value: unknown = currentTheme.colors[mode];
      for (const key of path) {
        if (typeof value === "object" && value !== null && key in value) {
          value = (value as Record<string, unknown>)[key];
        }
      }
      return typeof value === "string" ? value : "";
    },
  };
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultMode = "dark",
  storageKey = "habitflow-theme",
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const [isDark, setIsDark] = useState(defaultMode === "dark");

  // Load saved preference
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as ThemeMode | null;
    if (stored === "light" || stored === "dark") {
      setMode(stored);
      setIsDark(stored === "dark");
    }
  }, [storageKey]);

  // Apply mode changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(mode);
    setIsDark(mode === "dark");
    localStorage.setItem(storageKey, mode);
  }, [mode, storageKey]);

  const toggleTheme = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const value: ThemeContextValue = { mode, setMode, theme, isDark, toggleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ============================================================================
// THEME TOGGLE COMPONENT
// ============================================================================

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = true }: ThemeToggleProps) {
  const { toggleTheme, isDark } = useTheme();

  const icon = isDark ? (
    // Moon Icon 🌙
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  ) : (
    // Sun Icon ☀️
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );

  const label = isDark ? "Dark" : "Light";

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      {icon}
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

interface ThemeConditionalProps {
  children: ReactNode;
  mode?: ThemeMode | ThemeMode[];
  className?: string;
}

export function ThemeConditional({ children, mode, className = "" }: ThemeConditionalProps) {
  const { mode: currentMode } = useTheme();
  if (mode && !(Array.isArray(mode) ? mode.includes(currentMode) : mode === currentMode)) {
    return null;
  }
  return <div className={className}>{children}</div>;
}

interface ThemeAwareProps {
  children: ReactNode;
  lightClassName?: string;
  darkClassName?: string;
  className?: string;
}

export function ThemeAware({
  children,
  lightClassName = "",
  darkClassName = "",
  className = "",
}: ThemeAwareProps) {
  const { isDark } = useTheme();
  const themeClassName = isDark ? darkClassName : lightClassName;
  return <div className={`${className} ${themeClassName}`}>{children}</div>;
}

export default ThemeProvider;
