export type AuthenticationStatus = 'unauthenticated' | 'loading' | 'authenticated' | 'error'
export type AuthStatus = AuthenticationStatus

export interface User {
  id: string
  email: string
  name: string
  role?: string
  avatarUrl?: string
  createdAt?: string
}

export interface AuthSession {
  provider: 'mock' | 'supabase'
  accessToken?: string
  refreshToken?: string
  expiresAt?: string
  user: User
}

export interface SignInRequest {
  email: string
  password: string
}

export interface SignInResponse {
  user: User
  session: AuthSession
}

export interface AuthState {
  status: AuthenticationStatus
  user: User | null
  session: AuthSession | null
  isLoading: boolean
  error: string | null
}
