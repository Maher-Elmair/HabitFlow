export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  typography: {
    fontFamily: {
      sans: string
      mono: string
      arabic: string
    }
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
    }
  }
  breakpoints: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
}

export type ColorMode = 'light' | 'dark' | 'system'