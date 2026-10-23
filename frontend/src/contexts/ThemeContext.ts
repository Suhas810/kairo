import { createContext } from 'react'

export type ThemePreference = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

export type ThemeContextValue = {
  preference: ThemePreference
  resolvedTheme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
