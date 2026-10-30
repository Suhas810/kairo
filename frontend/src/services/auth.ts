import { api, ApiError } from './api'
import type { AuthSession, SignInRequest, SignInResponse, User } from '../types/user'
import { MOCK_USER } from '../utils/constants'
import { isValidEmail } from '../utils/validation'

const USER_STORAGE_KEY = 'kairo-auth-user'
const SESSION_STORAGE_KEY = 'kairo-auth-session'

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  return Boolean(url && anonKey)
}

export async function signIn(request: SignInRequest): Promise<SignInResponse> {
  if (!isValidEmail(request.email) || request.password.length < 8) {
    throw new ApiError('Invalid email or password. Use a valid email and at least 8 characters.', 401, {
      email: request.email,
      passwordLength: request.password.length,
    })
  }

  // Live Supabase Authentication integration
  if (isSupabaseConfigured()) {
    const url = import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    try {
      const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email.trim().toLowerCase(),
          password: request.password,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new ApiError(data.error_description || data.msg || data.message || 'Invalid login credentials.', res.status)
      }

      const user: User = {
        id: data.user?.id || `user-${request.email.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        email: data.user?.email || request.email.trim().toLowerCase(),
        name: data.user?.user_metadata?.display_name || request.email.split('@')[0] || 'Operator',
        role: 'Engineer',
        createdAt: data.user?.created_at || new Date().toISOString(),
      }

      const session: AuthSession = {
        provider: 'supabase',
        user,
        accessToken: data.access_token,
      }

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))

      return { user, session }
    } catch (err) {
      if (err instanceof ApiError) throw err
      // If network request failed in development, fall back below
      if (!import.meta.env.DEV) {
        throw new ApiError('Could not connect to Supabase Auth service.', 503)
      }
    }
  }

  // Local / Demo authentication fallback
  const user: User = {
    ...MOCK_USER,
    id: `user-${request.email.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    email: request.email.trim().toLowerCase(),
    name: request.email.split('@')[0] || 'Demo Operator',
  }

  const session: AuthSession = {
    provider: 'mock',
    user,
    accessToken: `demo-token-${Date.now()}`,
  }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))

  return {
    user,
    session,
  }
}

export async function signUp(request: { email: string; password: string; name?: string }): Promise<SignInResponse> {
  if (!isValidEmail(request.email)) {
    throw new ApiError('Please enter a valid email address.', 400)
  }
  if (!request.password || request.password.length < 8) {
    throw new ApiError('Password must be at least 8 characters long.', 400)
  }

  const displayName = request.name?.trim() || request.email.split('@')[0] || 'Developer'

  // Live Supabase Sign Up integration
  if (isSupabaseConfigured()) {
    const url = import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    try {
      const res = await fetch(`${url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email.trim().toLowerCase(),
          password: request.password,
          data: { display_name: displayName },
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new ApiError(data.error_description || data.msg || data.message || 'Registration failed.', res.status)
      }

      const user: User = {
        id: data.user?.id || `user-${request.email.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        email: data.user?.email || request.email.trim().toLowerCase(),
        name: displayName,
        role: 'Engineer',
        createdAt: data.user?.created_at || new Date().toISOString(),
      }

      const session: AuthSession = {
        provider: 'supabase',
        user,
        accessToken: data.access_token || `session-${Date.now()}`,
      }

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))

      return { user, session }
    } catch (err) {
      if (err instanceof ApiError) throw err
      if (!import.meta.env.DEV) {
        throw new ApiError('Could not register with Supabase Auth service.', 503)
      }
    }
  }

  // Local / Demo registration fallback
  const user: User = {
    ...MOCK_USER,
    id: `user-${request.email.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    email: request.email.trim().toLowerCase(),
    name: displayName,
    createdAt: new Date().toISOString(),
  }

  const session: AuthSession = {
    provider: 'mock',
    user,
    accessToken: `demo-token-${Date.now()}`,
  }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))

  return {
    user,
    session,
  }
}

export async function resetPassword(email: string): Promise<{ success: boolean; message: string }> {
  if (!isValidEmail(email)) {
    throw new ApiError('Please enter a valid email address to receive password reset instructions.', 400)
  }

  if (isSupabaseConfigured()) {
    const url = import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    try {
      const res = await fetch(`${url}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new ApiError(data.error_description || data.msg || 'Password reset request failed.', res.status)
      }
    } catch (err) {
      if (err instanceof ApiError) throw err
    }
  }

  return {
    success: true,
    message: `Password reset instructions have been dispatched to ${email}. Check your inbox.`,
  }
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const session = await getSession()
    if (session?.accessToken && session.provider === 'supabase') {
      const url = import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      try {
        await fetch(`${url}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
      } catch {
        // Continue clearing storage
      }
    }
  }
  localStorage.removeItem(USER_STORAGE_KEY)
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session?.user) return null

  try {
    const profile = await api.get<any>('/auth/profile')
    if (profile && profile.display_name) {
      return {
        ...session.user,
        name: profile.display_name,
      }
    }
  } catch {
    // Return session user
  }

  return session.user
}

export async function getSession(): Promise<AuthSession | null> {
  const stored = localStorage.getItem(SESSION_STORAGE_KEY)
  if (!stored) return null

  try {
    const session: unknown = JSON.parse(stored)
    if (isSession(session)) return session
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }
  return null
}

export async function updateCurrentProfile(name: string): Promise<User> {
  const trimmedName = name.trim()
  if (trimmedName.length < 2 || trimmedName.length > 80) {
    throw new ApiError('Display name must be between 2 and 80 characters.', 400)
  }
  const user = await getCurrentUser()
  if (!user) throw new ApiError('Sign in before editing your profile.', 401)

  try {
    await api.patch('/auth/profile', { display_name: trimmedName })
  } catch {
    // Continue with local update
  }

  const updatedUser = { ...user, name: trimmedName }
  const session = await getSession()
  if (session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ...session, user: updatedUser }))
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))
  return updatedUser
}

export async function refreshSession(): Promise<AuthSession | null> {
  const current = await getSession()
  if (!current) return null
  return current
}

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false
  const user = value as Record<string, unknown>
  return typeof user.id === 'string' && typeof user.email === 'string' && typeof user.name === 'string'
}

function isSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) return false
  const session = value as Record<string, unknown>
  return isUser(session.user)
}

export const authService = {
  signIn,
  signUp,
  resetPassword,
  signOut,
  getCurrentUser,
  getSession,
  updateCurrentProfile,
  refreshSession,
  isSupabaseConfigured,
}
