export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000/api'

export const MOCK_USER = {
  id: 'demo-user',
  email: 'demo@kairo.local',
  name: 'Demo Operator',
  role: 'Engineer',
  createdAt: new Date().toISOString(),
}

export const DEFAULT_PROJECT_ID = 'kairo-demo'
export const DEFAULT_PROJECT_NAME = 'Kairo Demo'

export const AGENT_STAGES = ['planning', 'research', 'coding', 'testing', 'completed'] as const
