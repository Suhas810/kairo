import { ChevronDown, LogOut, Settings2, Sparkles, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useProject } from '../../hooks/useProject'
import { useTheme } from '../../hooks/useTheme'

type NavbarProps = {
  workspace?: string
  activeProject?: string
}

export function Navbar({ workspace = 'Kairo Workspace', activeProject = 'No project selected' }: NavbarProps) {
  const { email, name, logout } = useAuth()
  const { resolvedTheme } = useTheme()
  const navigate = useNavigate()
  const [signOutError, setSignOutError] = useState('')
  const { projectId } = useParams()
  const { project } = useProject(projectId)

  async function signOut() {
    setSignOutError('')
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to sign out.')
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 rounded border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5">
            <Sparkles className="h-4 w-4 text-violet-300" />
            <span className="text-sm font-semibold text-indigo-100">Kairo</span>
          </Link>

          <div className="hidden min-w-0 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-300 md:flex">
            <span className="truncate font-medium text-zinc-100">{workspace}</span>
            <span className="text-zinc-500">/</span>
            <span className="truncate text-zinc-400">{project?.name ?? (projectId ? 'Project unavailable' : activeProject)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-xs text-zinc-300 hover:border-zinc-600 hover:text-white">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-500/20 font-medium text-indigo-200">{(name ?? email ?? 'U').slice(0, 1).toUpperCase()}</span>
              <span className="hidden max-w-36 truncate sm:inline">{name ?? email ?? 'Account'}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded border border-zinc-700 bg-zinc-950 p-2 shadow-xl">
              <p className="truncate px-2 py-2 text-xs text-zinc-500">{email ?? 'Account information unavailable'}</p>
              {signOutError && <p role="alert" className="px-2 py-1 text-xs text-red-300">{signOutError}</p>}
              <Link to="/settings/profile" className="flex items-center gap-2 rounded px-2 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"><UserRound className="h-4 w-4" />Profile</Link>
              <Link to="/settings" className="flex items-center gap-2 rounded px-2 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"><Settings2 className="h-4 w-4" />Settings</Link>
              <Link to="/settings/appearance" className="flex items-center justify-between rounded px-2 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"><span className="flex items-center gap-2"><Sparkles className="h-4 w-4" />Appearance</span><span className="text-xs capitalize text-zinc-500">{resolvedTheme}</span></Link>
              <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"><LogOut className="h-4 w-4" />Sign out</button>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
