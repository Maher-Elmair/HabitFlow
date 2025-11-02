/**
 * Simplified Theme Provider for HabitFlow
 * Default theme: Dark Mode
 */

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    const saved = localStorage.getItem("habitflow-theme") as ThemeMode | null;
    if (saved === "light" || saved === "dark") {
      setMode(saved);
    } else {
      // Default to dark mode if no preference saved
      setMode("dark");
    }
    setIsInitialized(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!isInitialized) return;
    
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(mode);
    localStorage.setItem("habitflow-theme", mode);
  }, [mode, isInitialized]);

  const toggleTheme = () => {
    setMode(prev => prev === "light" ? "dark" : "light");
  };

  const value: ThemeContextValue = {
    mode,
    toggleTheme,
    isDark: mode === "dark"
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// THEME TOGGLE COMPONENT
// ============================================================================

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ 
  showLabel = false, 
  className = "" 
}: ThemeToggleProps) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg 
        border border-border bg-background hover:bg-accent 
        transition-colors cursor-pointer
        ${className}
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      {isDark ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}

      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// HOOK - Move to bottom to avoid Fast Refresh error
// ============================================================================

function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { useTheme };