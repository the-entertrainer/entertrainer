import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextType {
  isDark: boolean
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('et-theme') as Theme | null
    if (saved) {
      setThemeState(saved)
      document.documentElement.dataset.theme = saved
    } else {
      const preferLight = window.matchMedia('(prefers-color-scheme: light)').matches
      const initialTheme: Theme = preferLight ? 'light' : 'dark'
      setThemeState(initialTheme)
      document.documentElement.dataset.theme = initialTheme
    }
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    document.documentElement.dataset.theme = t
    localStorage.setItem('et-theme', t)
  }

  return (
    <ThemeContext.Provider value={{ isDark: theme === 'dark', theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
