import { create } from 'zustand'
import { getSession, refreshSession, signIn as signInService, signOut as signOutService, updateCurrentProfile } from '../services/auth'
import type { AuthSession, AuthenticationStatus, SignInRequest, User } from '../types/user'

interface AuthStoreState {
  status: AuthenticationStatus
  user: User | null
  session: AuthSession | null
  error: string | null
  isLoading: boolean
  initialize: () => Promise<void>
  signIn: (credentials: SignInRequest) => Promise<void>
  updateProfile: (name: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStoreState>()((set) => ({
  status: 'unauthenticated',
  user: null,
  session: null,
  error: null,
  isLoading: false,

  async initialize() {
    set({ isLoading: true, error: null, status: 'loading' })

    try {
      const session = await getSession()
      const user = session?.user ?? null

      set({
        status: user ? 'authenticated' : 'unauthenticated',
        user,
        session,
        isLoading: false,
      })
    } catch (error) {
      set({
        status: 'error',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unable to restore the session.',
      })
    }
  },

  async signIn(credentials) {
    set({ isLoading: true, error: null, status: 'loading' })

    try {
      const response = await signInService(credentials)
      localStorage.setItem('kairo-auth-session', JSON.stringify(response.session))

      set({
        status: 'authenticated',
        user: response.user,
        session: response.session,
        isLoading: false,
      })
    } catch (error) {
      set({
        status: 'error',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign-in failed.',
      })
      throw error
    }
  },

  async updateProfile(name) {
    const user = await updateCurrentProfile(name)
    useAuthStore.setState((state) => ({
      user,
      session: state.session ? { ...state.session, user } : state.session,
    }))
  },

  async signOut() {
    try {
      await signOutService()
    } finally {
      set({ status: 'unauthenticated', user: null, session: null, error: null, isLoading: false })
    }
  },

  clearError() {
    set({ error: null })
  },
}))

export async function restoreAuthSession(): Promise<void> {
  const store = useAuthStore.getState()
  await store.initialize()
}

export async function refreshAuthSession(): Promise<AuthSession | null> {
  const session = await refreshSession()
  if (session) {
    useAuthStore.setState({ session })
  }
  return session
}
