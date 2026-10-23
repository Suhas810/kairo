import { createContext } from 'react'

export type AuthStatus = 'unauthenticated' | 'loading' | 'authenticated' | 'error'
export type AuthContextValue = {
  status: AuthStatus
  email: string | null
  name: string | null
  error: string | null
  login: (email: string, password: string) => Promise<void>
  updateProfile: (name: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
