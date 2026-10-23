import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { getSession, signIn as signInService, signOut as signOutService, updateCurrentProfile } from '../services/auth'
import { AuthContext, type AuthContextValue, type AuthStatus } from '../contexts/AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function restoreSession() {
      try {
        const session = await getSession()
        const user = session?.user ?? null
        if (!isActive) return
        setEmail(user?.email ?? null)
        setName(user?.name ?? null)
        setStatus(user ? 'authenticated' : 'unauthenticated')
      } catch (caughtError) {
        if (!isActive) return
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to restore the session.')
        setStatus('error')
      }
    }

    void restoreSession()

    return () => {
      isActive = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    status,
    email,
    name,
    error,
    async login(nextEmail, password) {
      setStatus('loading')
      setError(null)

      try {
        const response = await signInService({ email: nextEmail, password })
        localStorage.setItem('kairo-auth-session', JSON.stringify(response.session))
        setEmail(response.user.email)
        setName(response.user.name)
        setStatus('authenticated')
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : 'Unable to sign in.'
        setError(message)
        setStatus('error')
        throw caughtError instanceof Error ? caughtError : new Error(message)
      }
    },
    async updateProfile(nextName) {
      const user = await updateCurrentProfile(nextName)
      setName(user.name)
      setEmail(user.email)
    },
    async logout() {
      await signOutService()
      setEmail(null)
      setName(null)
      setError(null)
      setStatus('unauthenticated')
    },
  }), [email, error, name, status])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
