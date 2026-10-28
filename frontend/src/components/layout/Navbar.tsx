import {
  Bell,
  ChevronDown,
  Command,
  LogOut,
  Moon,
  Search,
  Settings2,
  Sparkles,
  Sun,
  UserRound,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useProject } from '../../hooks/useProject'
import { useTheme } from '../../hooks/useTheme'

type NavbarProps = {
  workspace?: string
  activeProject?: string
  onOpenCommandPalette?: () => void
}

export function Navbar({
  workspace = 'Kairo Workspace',
  activeProject = 'No project selected',
  onOpenCommandPalette,
}: NavbarProps) {
  const { email, name, logout } = useAuth()
  const { preference, resolvedTheme, setPreference } = useTheme()
  const navigate = useNavigate()
  const [signOutError, setSignOutError] = useState('')
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true)
  const { projectId } = useParams()
  const { project, projects } = useProject(projectId)

  async function signOut() {
    setSignOutError('')
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to sign out.')
    }
  }

  function toggleTheme() {
    const next = preference === 'dark' ? 'light' : 'dark'
    setPreference(next)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 transition-colors hover:bg-indigo-500/20"
          >
            <Sparkles className="h-4 w-4 text-violet-300" />
            <span className="text-sm font-semibold text-indigo-100">Kairo</span>
          </Link>

          {/* Project Switcher */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300">
            <span className="font-medium text-zinc-100">{workspace}</span>
            <span className="text-zinc-600">/</span>
            <details className="relative">
              <summary className="cursor-pointer list-none flex items-center gap-1.5 font-medium text-indigo-300 hover:text-indigo-200">
                <span className="max-w-[140px] truncate">
                  {project?.name ?? (projectId ? 'Project unavailable' : activeProject)}
                </span>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </summary>
              <div className="absolute left-0 top-full z-50 mt-2 w-52 rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-xl">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-zinc-500">
                  Switch project
                </div>
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className={`block rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      p.id === projectId
                        ? 'bg-indigo-600/20 text-indigo-200 font-medium'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <div className="truncate">{p.name}</div>
                    <div className="text-[10px] text-zinc-500">{p.language}</div>
                  </Link>
                ))}
                <div className="border-t border-zinc-800/80 mt-1 pt-1">
                  <Link
                    to="/projects"
                    className="block rounded-lg px-2.5 py-1 text-[11px] text-indigo-300 hover:bg-zinc-900"
                  >
                    View all projects →
                  </Link>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Search trigger button */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              <span>Search projects, tasks, executions...</span>
            </span>
            <kbd className="flex items-center gap-0.5 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Theme Quick Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100 transition-colors"
            title={`Current theme: ${resolvedTheme}. Click to toggle.`}
            aria-label="Toggle color theme"
          >
            {resolvedTheme === 'light' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-400" />
            )}
          </button>

          {/* Notifications button */}
          <details className="relative">
            <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100 transition-colors">
              <Bell className="h-4 w-4" />
              {hasUnreadAlerts && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-zinc-950" />
              )}
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold text-zinc-100">Notifications</span>
                {hasUnreadAlerts && (
                  <button
                    type="button"
                    onClick={() => setHasUnreadAlerts(false)}
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2 pt-2 text-xs">
                <div className="rounded-lg bg-zinc-900/60 p-2 text-zinc-300">
                  <div className="font-medium text-emerald-400">Execution completed</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Automated test suite & AST verification passed</div>
                  <div className="text-[9px] text-zinc-500 mt-1">45 mins ago</div>
                </div>
                <div className="rounded-lg bg-zinc-900/60 p-2 text-zinc-300">
                  <div className="font-medium text-indigo-300">New task assigned</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Docker container timeout handling</div>
                  <div className="text-[9px] text-zinc-500 mt-1">2 hours ago</div>
                </div>
              </div>
            </div>
          </details>

          {/* Account Menu */}
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-semibold text-white">
                {(name ?? email ?? 'U').slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-28 truncate sm:inline font-medium">
                {name ?? email ?? 'Account'}
              </span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-xl">
              <div className="border-b border-zinc-800/80 px-2.5 py-2">
                <p className="font-medium text-xs text-zinc-100 truncate">{name ?? 'Operator'}</p>
                <p className="truncate text-[11px] text-zinc-500">{email ?? 'Local session'}</p>
              </div>
              {signOutError && (
                <p role="alert" className="px-2 py-1 text-xs text-red-300">
                  {signOutError}
                </p>
              )}
              <div className="py-1">
                <Link
                  to="/settings/profile"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  <UserRound className="h-3.5 w-3.5" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Settings
                </Link>
                <Link
                  to="/settings/appearance"
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Appearance
                  </span>
                  <span className="text-[10px] capitalize text-zinc-500">{resolvedTheme}</span>
                </Link>
              </div>
              <div className="border-t border-zinc-800/80 pt-1">
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
