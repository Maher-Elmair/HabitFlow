/**
 * Global Theme Configuration for HabitFlow
 *
 * This file contains all design tokens, colors, typography, spacing,
 * breakpoints, and other theme-related configurations for the application.
 *
 * Built with Tailwind CSS v4 and shadcn/ui compatibility.
 */

export const theme = {
  // ============================================================================
  // COLOR SYSTEM
  // ============================================================================
  colors: {
    // Base colors using OKLCH for better color consistency
    light: {
      // Background colors
      background: "oklch(0.98 0.01 180)", // Soft aqua background
      foreground: "oklch(0.15 0.02 250)", // Deep charcoal text

      // Card colors
      card: "oklch(1 0 0)", // Pure white cards
      cardForeground: "oklch(0.15 0.02 250)", // Deep text

      // Popover colors
      popover: "oklch(1 0 0)", // White popovers
      popoverForeground: "oklch(0.15 0.02 250)", // Dark text

      // Primary colors
      primary: "oklch(0.55 0.08 180)", // Vibrant teal
      primaryForeground: "oklch(1 0 0)", // White text

      // Secondary colors
      secondary: "oklch(0.95 0.02 180)", // Light mint
      secondaryForeground: "oklch(0.15 0.02 250)", // Dark text

      // Muted colors
      muted: "oklch(0.96 0.01 220)", // Subtle gray
      mutedForeground: "oklch(0.55 0.03 220)", // Medium gray text

      // Accent colors
      accent: "oklch(0.92 0.04 180)", // Accent mint
      accentForeground: "oklch(0.15 0.02 250)", // Dark text

      // Destructive colors
      destructive: "oklch(0.65 0.22 25)", // Warm red
      destructiveForeground: "oklch(1 0 0)", // White text

      // Border and input colors
      border: "oklch(0.90 0.02 220)", // Light border
      input: "oklch(0.90 0.02 220)", // Light input
      ring: "oklch(0.55 0.08 180)", // Teal focus ring

      // Chart colors - Teal HabitFlow Theme
      chart1: "oklch(0.55 0.08 180)", // Primary teal
      chart2: "oklch(0.60 0.09 180)", // Bright teal
      chart3: "oklch(0.65 0.10 180)", // Light teal
      chart4: "oklch(0.75 0.11 180)", // Pale teal
      chart5: "oklch(0.85 0.12 180)", // Very pale teal

      // Sidebar colors
      sidebar: "oklch(1 0 0)", // White sidebar
      sidebarForeground: "oklch(0.15 0.02 250)", // Dark sidebar text
      sidebarPrimary: "oklch(0.55 0.08 180)", // Teal sidebar primary
      sidebarPrimaryForeground: "oklch(1 0 0)", // White sidebar text
      sidebarAccent: "oklch(0.96 0.01 220)", // Subtle sidebar accent
      sidebarAccentForeground: "oklch(0.15 0.02 250)", // Dark accent text
      sidebarBorder: "oklch(0.90 0.02 220)", // Light sidebar border
      sidebarRing: "oklch(0.55 0.08 180)", // Teal sidebar ring
    },

    dark: {
      // Background colors
      background: "oklch(0.15 0.02 250)", // Dark background
      foreground: "oklch(0.95 0.01 220)", // Light text

      // Card colors
      card: "oklch(0.20 0.03 250)", // Dark cards
      cardForeground: "oklch(0.95 0.01 220)", // Light card text

      // Popover colors
      popover: "oklch(0.20 0.03 250)", // Dark popovers
      popoverForeground: "oklch(0.95 0.01 220)", // Light popover text

      // Primary colors
      primary: "oklch(0.55 0.08 180)", // Vibrant teal
      primaryForeground: "oklch(1 0 0)", // White text

      // Secondary colors
      secondary: "oklch(0.25 0.05 180)", // Dark teal
      secondaryForeground: "oklch(0.95 0.01 220)", // Light text

      // Muted colors
      muted: "oklch(0.25 0.03 250)", // Dark muted
      mutedForeground: "oklch(0.65 0.03 220)", // Medium muted text

      // Accent colors
      accent: "oklch(0.30 0.06 180)", // Dark teal accent
      accentForeground: "oklch(0.95 0.01 220)", // Light accent text

      // Destructive colors
      destructive: "oklch(0.65 0.22 25)", // Warm red
      destructiveForeground: "oklch(0.95 0.01 220)", // Light destructive text

      // Border and input colors
      border: "oklch(0.30 0.04 250)", // Dark border
      input: "oklch(0.30 0.04 250)", // Dark input
      ring: "oklch(0.55 0.08 180)", // Teal focus ring

      // Chart colors - Teal HabitFlow Theme
      chart1: "oklch(0.55 0.08 180)", // Primary teal
      chart2: "oklch(0.60 0.09 180)", // Bright teal
      chart3: "oklch(0.65 0.10 180)", // Light teal
      chart4: "oklch(0.75 0.11 180)", // Pale teal
      chart5: "oklch(0.85 0.12 180)", // Very pale teal

      // Sidebar colors
      sidebar: "oklch(0.20 0.03 250)", // Dark sidebar
      sidebarForeground: "oklch(0.95 0.01 220)", // Light sidebar text
      sidebarPrimary: "oklch(0.55 0.08 180)", // Teal sidebar primary
      sidebarPrimaryForeground: "oklch(1 0 0)", // White sidebar text
      sidebarAccent: "oklch(0.25 0.03 250)", // Dark sidebar accent
      sidebarAccentForeground: "oklch(0.95 0.01 220)", // Light accent text
      sidebarBorder: "oklch(0.30 0.04 250)", // Dark sidebar border
      sidebarRing: "oklch(0.55 0.08 180)", // Teal sidebar ring
    },

    // Habit-specific colors
    habit: {
      // Success/Completion colors - Teal theme
      success: {
        50: "oklch(0.95 0.02 180)", // Very light teal
        100: "oklch(0.90 0.04 180)", // Light teal
        500: "oklch(0.55 0.08 180)", // Medium teal
        600: "oklch(0.45 0.10 180)", // Dark teal
        700: "oklch(0.35 0.12 180)", // Darker teal
      },

      // Warning/Partial completion - Golden yellow
      warning: {
        50: "oklch(0.95 0.05 85)", // Very light yellow
        100: "oklch(0.90 0.08 85)", // Light yellow
        500: "oklch(0.70 0.15 85)", // Medium yellow
        600: "oklch(0.60 0.18 85)", // Dark yellow
        700: "oklch(0.50 0.20 85)", // Darker yellow
      },

      // Error/Missed habits - Warm red
      error: {
        50: "oklch(0.95 0.05 25)", // Very light red
        100: "oklch(0.90 0.10 25)", // Light red
        500: "oklch(0.65 0.22 25)", // Medium red
        600: "oklch(0.55 0.25 25)", // Dark red
        700: "oklch(0.45 0.28 25)", // Darker red
      },

      // Streak colors - Achievement theme
      streak: {
        gold: "oklch(0.70 0.15 70)", // Gold for long streaks
        silver: "oklch(0.80 0.05 0)", // Silver for medium streaks
        bronze: "oklch(0.60 0.10 30)", // Bronze for short streaks
      },
    },
  },
  // ============================================================================
  // TYPOGRAPHY
  // ============================================================================
  typography: {
    fontFamily: {
      sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      mono: ["var(--font-mono)", "monospace"],
      arabic: ["var(--font-arabic)", "system-ui", "sans-serif"],
      display: ["var(--font-display)", "system-ui", "sans-serif"],
    },

    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.25rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "5xl": ["3rem", { lineHeight: "1" }],
      "6xl": ["3.75rem", { lineHeight: "1" }],
      "7xl": ["4.5rem", { lineHeight: "1" }],
      "8xl": ["6rem", { lineHeight: "1" }],
      "9xl": ["8rem", { lineHeight: "1" }],
    },

    fontWeight: {
      thin: "100",
      extralight: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },

    letterSpacing: {
      tighter: "-0.05em",
      tight: "-0.025em",
      normal: "0em",
      wide: "0.025em",
      wider: "0.05em",
      widest: "0.1em",
    },
  },

  // ============================================================================
  // SPACING & SIZING
  // ============================================================================
  spacing: {
    // Custom spacing scale
    0: "0px",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    7: "1.75rem", // 28px
    8: "2rem", // 32px
    9: "2.25rem", // 36px
    10: "2.5rem", // 40px
    11: "2.75rem", // 44px
    12: "3rem", // 48px
    14: "3.5rem", // 56px
    16: "4rem", // 64px
    20: "5rem", // 80px
    24: "6rem", // 96px
    28: "7rem", // 112px
    32: "8rem", // 128px
    36: "9rem", // 144px
    40: "10rem", // 160px
    44: "11rem", // 176px
    48: "12rem", // 192px
    52: "13rem", // 208px
    56: "14rem", // 224px
    60: "15rem", // 240px
    64: "16rem", // 256px
    72: "18rem", // 288px
    80: "20rem", // 320px
    96: "24rem", // 384px
  },

  // ============================================================================
  // BREAKPOINTS & RESPONSIVE DESIGN
  // ============================================================================
  breakpoints: {
    xs: "475px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1400px",
    "3xl": "1600px",
    "4xl": "1920px",
  },

  // ============================================================================
  // BORDER RADIUS
  // ============================================================================
  borderRadius: {
    none: "0px",
    sm: "calc(var(--radius) - 4px)",
    md: "calc(var(--radius) - 2px)",
    lg: "var(--radius)",
    xl: "calc(var(--radius) + 4px)",
    "2xl": "calc(var(--radius) + 8px)",
    "3xl": "calc(var(--radius) + 12px)",
    full: "9999px",
  },

  // ============================================================================
  // SHADOWS
  // ============================================================================
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    soft: "0 2px 15px -3px rgba(13, 148, 136, 0.07), 0 10px 20px -2px rgba(13, 148, 136, 0.04)",
    glow: "0 0 20px rgba(13, 148, 136, 0.4)",
  },

  // ============================================================================
  // ANIMATIONS & TRANSITIONS
  // ============================================================================
  animations: {
    // Fade animations
    "fade-in": "fadeIn 0.3s ease-in-out",
    "fade-out": "fadeOut 0.3s ease-in-out",
    "fade-in-up": "fadeInUp 0.4s ease-out",
    "fade-in-down": "fadeInDown 0.4s ease-out",

    // Scale animations
    "scale-in": "scaleIn 0.2s ease-out",
    "scale-out": "scaleOut 0.2s ease-in",

    // Slide animations
    "slide-in-right": "slideInRight 0.3s ease-out",
    "slide-in-left": "slideInLeft 0.3s ease-out",
    "slide-in-up": "slideInUp 0.3s ease-out",
    "slide-in-down": "slideInDown 0.3s ease-out",

    // Accordion animations
    "accordion-down": "accordionDown 0.2s ease-out",
    "accordion-up": "accordionUp 0.2s ease-out",

    // Habit-specific animations
    "habit-complete": "habitComplete 0.6s ease-out",
    "streak-glow": "streakGlow 2s ease-in-out infinite",
    "progress-fill": "progressFill 1s ease-out",

    // Bounce animations
    "bounce-in": "bounceIn 0.6s ease-out",
    "bounce-out": "bounceOut 0.6s ease-in",
  },

  keyframes: {
    fadeIn: {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" },
    },
    fadeOut: {
      "0%": { opacity: "1" },
      "100%": { opacity: "0" },
    },
    fadeInUp: {
      "0%": { opacity: "0", transform: "translateY(20px)" },
      "100%": { opacity: "1", transform: "translateY(0)" },
    },
    fadeInDown: {
      "0%": { opacity: "0", transform: "translateY(-20px)" },
      "100%": { opacity: "1", transform: "translateY(0)" },
    },
    scaleIn: {
      "0%": { opacity: "0", transform: "scale(0.9)" },
      "100%": { opacity: "1", transform: "scale(1)" },
    },
    scaleOut: {
      "0%": { opacity: "1", transform: "scale(1)" },
      "100%": { opacity: "0", transform: "scale(0.9)" },
    },
    slideInRight: {
      "0%": { transform: "translateX(100%)" },
      "100%": { transform: "translateX(0)" },
    },
    slideInLeft: {
      "0%": { transform: "translateX(-100%)" },
      "100%": { transform: "translateX(0)" },
    },
    slideInUp: {
      "0%": { transform: "translateY(100%)" },
      "100%": { transform: "translateY(0)" },
    },
    slideInDown: {
      "0%": { transform: "translateY(-100%)" },
      "100%": { transform: "translateY(0)" },
    },
    accordionDown: {
      from: { height: "0" },
      to: { height: "var(--radix-accordion-content-height)" },
    },
    accordionUp: {
      from: { height: "var(--radix-accordion-content-height)" },
      to: { height: "0" },
    },
    habitComplete: {
      "0%": { transform: "scale(1)", opacity: "1" },
      "50%": { transform: "scale(1.1)", opacity: "0.8" },
      "100%": { transform: "scale(1)", opacity: "1" },
    },
    streakGlow: {
      "0%, 100%": { boxShadow: "0 0 5px rgba(13, 148, 136, 0.5)" },
      "50%": { boxShadow: "0 0 20px rgba(13, 148, 136, 0.8)" },
    },
    progressFill: {
      "0%": { width: "0%" },
      "100%": { width: "var(--progress-width)" },
    },
    bounceIn: {
      "0%": { transform: "scale(0.3)", opacity: "0" },
      "50%": { transform: "scale(1.05)" },
      "70%": { transform: "scale(0.9)" },
      "100%": { transform: "scale(1)", opacity: "1" },
    },
    bounceOut: {
      "0%": { transform: "scale(1)", opacity: "1" },
      "25%": { transform: "scale(0.95)" },
      "50%": { transform: "scale(1.1)", opacity: "1" },
      "100%": { transform: "scale(0.3)", opacity: "0" },
    },
  },

  // ============================================================================
  // Z-INDEX SCALE
  // ============================================================================
  zIndex: {
    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // ============================================================================
  // CONTAINER CONFIGURATION
  // ============================================================================
  container: {
    center: true,
    padding: "2rem",
    screens: {
      "2xl": "1400px",
    },
  },

  // ============================================================================
  // HABIT-SPECIFIC DESIGN TOKENS
  // ============================================================================
  habit: {
    // Habit completion states
    states: {
      completed: {
        color: "oklch(0.55 0.08 180)", // Teal
        bgColor: "oklch(0.95 0.02 180)",
        borderColor: "oklch(0.80 0.06 180)",
      },
      partial: {
        color: "oklch(0.70 0.15 85)", // Golden yellow
        bgColor: "oklch(0.95 0.05 85)",
        borderColor: "oklch(0.80 0.10 85)",
      },
      missed: {
        color: "oklch(0.65 0.22 25)", // Warm red
        bgColor: "oklch(0.95 0.05 25)",
        borderColor: "oklch(0.80 0.10 25)",
      },
      pending: {
        color: "oklch(0.55 0.03 220)", // Gray
        bgColor: "oklch(0.95 0.01 220)",
        borderColor: "oklch(0.80 0.02 220)",
      },
    },

    // Streak levels
    streaks: {
      beginner: { min: 1, max: 6, color: "oklch(0.60 0.10 30)" }, // Bronze
      intermediate: { min: 7, max: 29, color: "oklch(0.80 0.05 0)" }, // Silver
      advanced: { min: 30, max: 99, color: "oklch(0.70 0.15 70)" }, // Gold
      master: { min: 100, max: 999, color: "oklch(0.55 0.08 180)" }, // Teal
      legend: { min: 1000, max: Infinity, color: "oklch(0.45 0.10 180)" }, // Dark teal
    },

    // Progress indicators
    progress: {
      height: "0.5rem",
      borderRadius: "0.25rem",
      animationDuration: "1s",
      colors: {
        low: "oklch(0.65 0.22 25)", // Warm red
        medium: "oklch(0.70 0.15 85)", // Golden yellow
        high: "oklch(0.55 0.08 180)", // Teal
      },
    },
  },

  // ============================================================================
  // ACCESSIBILITY
  // ============================================================================
  accessibility: {
    // Focus ring styles
    focusRing: {
      width: "2px",
      style: "solid",
      color: "oklch(0.55 0.08 180)", // Teal
      offset: "2px",
    },

    // High contrast mode support
    highContrast: {
      enabled: true,
      borderWidth: "2px",
      colorContrast: "4.5:1", // WCAG AA standard
    },

    // Reduced motion support
    reducedMotion: {
      enabled: true,
      duration: "0.01ms",
      animationFillMode: "both",
    },
  },
} as const;
// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeTypography = typeof theme.typography;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeBreakpoints = typeof theme.breakpoints;
export type ThemeAnimations = typeof theme.animations;
export type ThemeHabit = typeof theme.habit;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color value for current theme mode
 */
export function getThemeColor(
  colorPath: string,
  mode: "light" | "dark" = "light"
): string {
  const path = colorPath.split(".");
  let value: any = theme.colors[mode];

  for (const key of path) {
    value = value?.[key];
  }

  return value || "";
}

/**
 * Get responsive breakpoint value
 */
export function getBreakpoint(
  breakpoint: keyof typeof theme.breakpoints
): string {
  return theme.breakpoints[breakpoint];
}

/**
 * Get animation duration and easing
 */
export function getAnimation(animation: keyof typeof theme.animations): string {
  return theme.animations[animation];
}

/**
 * Get habit state colors
 */
export function getHabitStateColors(
  state: keyof typeof theme.habit.states
): (typeof theme.habit.states)[keyof typeof theme.habit.states] {
  return theme.habit.states[state];
}

/**
 * Get streak level info based on streak count
 */
export function getStreakLevel(streakCount: number): {
  level: string;
  color: string;
  min: number;
  max: number;
} {
  for (const [level, config] of Object.entries(theme.habit.streaks)) {
    if (streakCount >= config.min && streakCount <= config.max) {
      return {
        level,
        color: config.color,
        min: config.min,
        max: config.max,
      };
    }
  }

  // Fallback for very high streaks
  return {
    level: "legend",
    color: theme.habit.streaks.legend.color,
    min: theme.habit.streaks.legend.min,
    max: theme.habit.streaks.legend.max,
  };
}

export default theme;
