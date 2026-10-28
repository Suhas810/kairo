import { ApiError } from './api'
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
  if (!import.meta.env.DEV) {
    throw new ApiError('Authentication is not configured for this deployment.', 503)
  }

  if (!isValidEmail(request.email) || request.password.length < 8) {
    throw new ApiError('Invalid email or password. Use a valid email and at least 8 characters.', 401, {
      email: request.email,
      passwordLength: request.password.length,
    })
  }

  const user: User = {
    ...MOCK_USER,
    id: `user-${request.email.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    email: request.email.trim().toLowerCase(),
    name: request.email.split('@')[0] || 'Demo Operator',
  }

  return {
    user,
    session: {
      provider: 'mock',
      user,
    },
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
  const user: User = {
    ...MOCK_USER,
    id: `user-${request.email.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    email: request.email.trim().toLowerCase(),
    name: displayName,
    createdAt: new Date().toISOString(),
  }

  return {
    user,
    session: {
      provider: 'mock',
      user,
    },
  }
}

export async function resetPassword(email: string): Promise<{ success: boolean; message: string }> {
  if (!isValidEmail(email)) {
    throw new ApiError('Please enter a valid email address to receive password reset instructions.', 400)
  }

  return {
    success: true,
    message: `Password reset instructions have been dispatched to ${email}. Check your inbox.`,
  }
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(USER_STORAGE_KEY)
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user ?? null
}

export async function getSession(): Promise<AuthSession | null> {
  if (!import.meta.env.DEV) {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }

  const stored = localStorage.getItem(SESSION_STORAGE_KEY)
  if (!stored) return null

  try {
    const session: unknown = JSON.parse(stored)
    if (isSession(session)) return session
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }
  localStorage.removeItem(SESSION_STORAGE_KEY)
  return null
}

export async function updateCurrentProfile(name: string): Promise<User> {
  if (!import.meta.env.DEV) {
    throw new ApiError('Profile editing is unavailable until an authentication provider is configured.', 503)
  }
  const trimmedName = name.trim()
  if (trimmedName.length < 2 || trimmedName.length > 80) {
    throw new ApiError('Display name must be between 2 and 80 characters.', 400)
  }
  const user = await getCurrentUser()
  if (!user) throw new ApiError('Sign in before editing your profile.', 401)
  const updatedUser = { ...user, name: trimmedName }
  const session = await getSession()
  if (!session) throw new ApiError('The local demo session is unavailable. Sign in again.', 401)
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ...session, user: updatedUser }))
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
  return session.provider === 'mock' && isUser(session.user)
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
