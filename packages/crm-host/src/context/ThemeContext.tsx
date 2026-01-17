import { createContext, useContext, useState, ReactNode } from 'react'
import type { ThemeConfig } from 'antd'

interface ThemeColors {
  primary: string
  success: string
  warning: string
  error: string
}

interface ThemeContextType {
  colors: ThemeColors
  setColors: (colors: ThemeColors) => void
  theme: ThemeConfig
}

const defaultColors: ThemeColors = {
  primary: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(defaultColors)

  const theme: ThemeConfig = {
    token: {
      colorPrimary: colors.primary,
      colorSuccess: colors.success,
      colorWarning: colors.warning,
      colorError: colors.error,
      borderRadius: 6,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      Button: {
        controlHeight: 36,
        paddingContentHorizontal: 16,
      },
      Input: {
        controlHeight: 36,
      },
      Select: {
        controlHeight: 36,
      },
      Table: {
        headerBg: '#fafafa',
        headerColor: '#1e1b4b',
        rowHoverBg: '#f8fafc',
      },
    },
  }

  return (
    <ThemeContext.Provider value={{ colors, setColors, theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
