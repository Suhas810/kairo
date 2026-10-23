import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type ResolvedTheme, type ThemePreference } from '../contexts/ThemeContext'

const STORAGE_KEY = 'kairo-theme-preference'

function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'system' || stored === 'dark' ? stored : 'dark'
  } catch (error) {
    console.error('Could not load the saved theme preference; using dark mode.', error)
    return 'dark'
  }
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setStatePreference] = useState<ThemePreference>(readPreference)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)
  const resolvedTheme = preference === 'system' ? systemTheme : preference

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    const updateSystemTheme = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'light' : 'dark')
    }
    mediaQuery.addEventListener('change', updateSystemTheme)
    return () => mediaQuery.removeEventListener('change', updateSystemTheme)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    window.localStorage.setItem(STORAGE_KEY, nextPreference)
    setStatePreference(nextPreference)
  }, [])

  const value = useMemo(() => ({ preference, resolvedTheme, setPreference }), [preference, resolvedTheme, setPreference])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
