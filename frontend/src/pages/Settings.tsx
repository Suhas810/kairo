import { Bell, Check, Monitor, Moon, Palette, Shield, Sun, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import type { ThemePreference } from '../contexts/ThemeContext'
import { useWebSocket } from '../hooks/useWebSocket'

const sections = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'preferences', label: 'Preferences', icon: Monitor },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const

type Section = typeof sections[number]['id']
type LocalPreferences = { compact: boolean; highContrast: boolean; emailNotifications: boolean; taskNotifications: boolean }
const PREFERENCES_KEY = 'kairo-workspace-preferences'
const defaultPreferences: LocalPreferences = { compact: false, highContrast: false, emailNotifications: false, taskNotifications: true }

function getSection(pathname: string): Section {
  const segment = pathname.split('/').filter(Boolean)[1]
  return sections.find((section) => section.id === segment)?.id ?? 'profile'
}

function readPreferences(): LocalPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY)
    if (!stored) return defaultPreferences
    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed !== 'object' || parsed === null) return defaultPreferences
    const values = parsed as Record<string, unknown>
    return {
      compact: typeof values.compact === 'boolean' ? values.compact : defaultPreferences.compact,
      highContrast: typeof values.highContrast === 'boolean' ? values.highContrast : defaultPreferences.highContrast,
      emailNotifications: typeof values.emailNotifications === 'boolean' ? values.emailNotifications : defaultPreferences.emailNotifications,
      taskNotifications: typeof values.taskNotifications === 'boolean' ? values.taskNotifications : defaultPreferences.taskNotifications,
    }
  } catch (error) {
    console.error('Could not load local workspace preferences.', error)
    return defaultPreferences
  }
}

export function Settings() {
  const { email, name, updateProfile, logout } = useAuth()
  const { preference, resolvedTheme, setPreference } = useTheme()
  const websocket = useWebSocket()
  const location = useLocation()
  const navigate = useNavigate()
  const section = getSection(location.pathname)
  const [displayName, setDisplayName] = useState(name ?? '')
  const [savedName, setSavedName] = useState(name ?? '')
  const [preferences, setPreferences] = useState(readPreferences)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    document.documentElement.dataset.density = preferences.compact ? 'compact' : 'comfortable'
    document.documentElement.dataset.contrast = preferences.highContrast ? 'high' : 'normal'
  }, [preferences.compact, preferences.highContrast])

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (displayName.trim().length < 2 || displayName.trim().length > 80) {
      setError('Display name must be between 2 and 80 characters.')
      return
    }
    void updateProfile(displayName).then(() => {
      setSavedName(displayName.trim())
      setMessage('Profile saved to this browser session.')
    }).catch((caughtError: unknown) => {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save your profile.')
    })
  }

  function changeTheme(nextTheme: ThemePreference) {
    setError('')
    setMessage('')
    try {
      setPreference(nextTheme)
      setMessage(nextTheme === 'system' ? 'Theme preference saved. Appearance now follows your system setting.' : `Theme updated to ${nextTheme}.`)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save the theme preference.')
    }
  }

  function togglePreference(key: keyof LocalPreferences, checked: boolean) {
    const next = { ...preferences, [key]: checked }
    setError('')
    setMessage('')
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next))
      setPreferences(next)
      if (key === 'compact') document.documentElement.dataset.density = checked ? 'compact' : 'comfortable'
      if (key === 'highContrast') document.documentElement.dataset.contrast = checked ? 'high' : 'normal'
      setMessage('Workspace preference saved on this device.')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save this preference.')
    }
  }

  async function signOut() {
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to sign out.')
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <header className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage your local profile and workspace preferences.</p>
      </header>

      <div className="grid gap-5 md:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Settings navigation" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {sections.map(({ id, label, icon: Icon }) => (
            <Link key={id} to={`/settings/${id}`} aria-current={section === id ? 'page' : undefined} className={`flex shrink-0 items-center gap-2 rounded px-3 py-2.5 text-sm ${section === id ? 'bg-indigo-500/15 text-indigo-200' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </nav>

        <div className="min-w-0 space-y-4">
          {section === 'profile' && (
            <section className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold">Profile</h2>
              <p className="mt-1 text-xs text-zinc-500">Your local demo profile. Profile synchronization is not configured.</p>
              <form onSubmit={saveProfile} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="profile-name" className="mb-1.5 block text-sm text-zinc-300">Display name</label>
                  <input id="profile-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required minLength={2} maxLength={80} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label htmlFor="profile-email" className="mb-1.5 block text-sm text-zinc-300">Email address</label>
                  <input id="profile-email" value={email ?? ''} readOnly className="w-full cursor-not-allowed rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-400" />
                  <p className="mt-1 text-xs text-zinc-500">Email changes require a configured authentication provider.</p>
                </div>
                {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
                {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={displayName.trim() === savedName} className="rounded bg-indigo-500 px-3 py-2 text-sm text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50">Save profile</button>
                  <button type="button" onClick={() => { setDisplayName(savedName); setError(''); setMessage('') }} disabled={displayName === savedName} className="rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500 disabled:opacity-50">Reset</button>
                </div>
              </form>
            </section>
          )}

          {section === 'preferences' && (
            <section className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold">Account preferences</h2>
              <PreferenceToggle label="Compact workspace spacing" description="Reduce vertical padding in workspace content." checked={preferences.compact} onChange={(checked) => togglePreference('compact', checked)} />
              <PreferenceToggle label="High contrast" description="Increase contrast for secondary text and panel borders." checked={preferences.highContrast} onChange={(checked) => togglePreference('highContrast', checked)} />
              {message && <p role="status" className="mt-4 text-sm text-emerald-300">{message}</p>}
              {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
            </section>
          )}

          {section === 'appearance' && (
            <section className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold">Appearance</h2>
              <p className="mt-1 text-xs text-zinc-500">Choose a theme. Your selection applies immediately and is saved on this device.</p>
              <fieldset className="mt-5 grid gap-2 sm:grid-cols-3">
                <legend className="sr-only">Theme preference</legend>
                {([{ id: 'dark', label: 'Dark', icon: Moon }, { id: 'light', label: 'Light', icon: Sun }, { id: 'system', label: 'System', icon: Monitor }] as const).map(({ id, label, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => changeTheme(id)} aria-pressed={preference === id} className={`flex items-center justify-between rounded border px-3 py-3 text-sm ${preference === id ? 'border-indigo-400 bg-indigo-500/10 text-indigo-200' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'}`}>
                    <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{label}</span>
                    {preference === id && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </fieldset>
              <p className="mt-3 text-xs text-zinc-500">Current display: {resolvedTheme}</p>
              {message && <p role="status" className="mt-3 text-sm text-emerald-300">{message}</p>}
              {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
            </section>
          )}

          {section === 'security' && (
            <section className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold">Security</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-zinc-500">Authentication</dt><dd className="text-zinc-300">Development-only mock</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-zinc-500">Session</dt><dd className="text-zinc-300">Stored locally until sign-out</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-zinc-500">Password recovery</dt><dd className="text-zinc-300">Not configured</dd></div>
              </dl>
              <p className="mt-4 border-t border-zinc-800 pt-3 text-xs leading-5 text-zinc-500">This demo has no password-change, recovery, or account-security service. Do not use a real password.</p>
              <button type="button" onClick={() => void signOut()} className="mt-4 rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500">Sign out</button>
            </section>
          )}

          {section === 'notifications' && (
            <section className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold">Notifications</h2>
              <p className="mt-1 text-xs text-zinc-500">These local preferences do not enable notification delivery.</p>
              <PreferenceToggle label="Email notifications" description="Preference only; email delivery is not configured." checked={preferences.emailNotifications} onChange={(checked) => togglePreference('emailNotifications', checked)} />
              <PreferenceToggle label="Task status notifications" description="Preference only; task events are not connected." checked={preferences.taskNotifications} onChange={(checked) => togglePreference('taskNotifications', checked)} />
              {message && <p role="status" className="mt-4 text-sm text-emerald-300">{message}</p>}
              {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
            </section>
          )}

          <section className="rounded border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm font-semibold">Connected services</h2>
            <p className="mt-3 text-sm text-zinc-300">Realtime updates: {websocket.status}</p>
            <p className="mt-1 text-xs text-zinc-500">{websocket.error}</p>
            <p className="mt-3 text-sm text-zinc-300">Git provider: unavailable</p>
            <p className="mt-1 text-xs text-zinc-500">No repository provider is configured. Do not enter credentials in this demo.</p>
          </section>
        </div>
      </div>
    </div>
  )
}

function PreferenceToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="mt-4 flex items-center justify-between gap-4 border-t border-zinc-800 pt-4 text-sm">
      <span><span className="block text-zinc-200">{label}</span><span className="mt-1 block text-xs text-zinc-500">{description}</span></span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-indigo-500" />
    </label>
  )
}
