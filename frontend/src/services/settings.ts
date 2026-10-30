import { api } from './api'

export interface UserSettings {
  theme: string
  notifications: boolean
  telemetry: boolean
  model_preferences: Record<string, any>
  active_integrations: Record<string, boolean>
}

export interface UserSettingsUpdate {
  theme?: string
  notifications?: boolean
  telemetry?: boolean
  model_preferences?: Record<string, any>
}

export async function getUserSettings(): Promise<UserSettings | null> {
  try {
    return await api.get<UserSettings>('/settings')
  } catch {
    return null
  }
}

export async function updateUserSettings(updates: UserSettingsUpdate): Promise<UserSettings | null> {
  try {
    return await api.patch<UserSettings>('/settings', updates)
  } catch {
    return null
  }
}

export const settingsService = {
  getUserSettings,
  updateUserSettings,
}

