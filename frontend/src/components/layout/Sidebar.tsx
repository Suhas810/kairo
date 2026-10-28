import {
  Bot,
  BriefcaseBusiness,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Code2,
  GitBranch,
  LayoutDashboard,
  Play,
  Settings,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProject'
import { useAuth } from '../../hooks/useAuth'

type SidebarProps = {
  collapsed?: boolean
  onToggle?: () => void
}

type NavItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation()
  const { projectId: routeProjectId } = useParams()
  const { projects } = useProject()
  const { email, name } = useAuth()
  const projectId = routeProjectId ?? projects[0]?.id

  const navigation: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: BriefcaseBusiness },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare },
    { label: 'Repositories', href: '/repositories', icon: Code2 },
    ...(projectId
      ? [
          { label: 'Project overview', href: `/projects/${projectId}`, icon: GitBranch },
          { label: 'Project tasks', href: `/projects/${projectId}/tasks`, icon: CheckSquare },
          { label: 'Repository', href: `/projects/${projectId}/repository`, icon: Code2 },
          { label: 'Agent workspace', href: `/projects/${projectId}/agent`, icon: Bot },
          { label: 'Execution', href: `/projects/${projectId}/execution`, icon: Play },
        ]
      : []),
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <aside
      className={[
        'w-full border-b border-zinc-800 bg-zinc-950/90 transition-all duration-200 lg:h-screen lg:border-b-0 lg:border-r',
        collapsed ? 'lg:w-16' : 'lg:w-64',
      ].join(' ')}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2.5 lg:px-4 lg:py-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white shadow-soft">
              K
            </div>
            {!collapsed && <span className="text-lg font-semibold text-zinc-50 tracking-tight">Kairo</span>}
          </Link>

          <button
            type="button"
            onClick={onToggle}
            className="hidden h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav
          aria-label="Workspace navigation"
          className="flex gap-1 overflow-x-auto px-2 py-2 lg:flex-col lg:space-y-1.5 lg:overflow-y-auto lg:px-3 lg:py-4"
        >
          {navigation.map(({ label, href, icon: Icon }) => {
            const active =
              location.pathname === href ||
              (href === '/settings' && location.pathname.startsWith('/settings/'))

            return (
              <Link
                key={label}
                to={href}
                title={collapsed ? label : undefined}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition',
                  active
                    ? 'bg-indigo-600/15 text-indigo-200 ring-1 ring-indigo-500/30'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
                  'shrink-0 justify-center px-2.5 lg:shrink lg:justify-start lg:px-3',
                  collapsed ? 'lg:justify-center lg:px-2' : '',
                ].join(' ')}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto hidden border-t border-zinc-800 p-3 lg:block">
          <Link
            to="/settings/profile"
            className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-2.5 hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white shrink-0">
              {(name ?? email ?? 'U').slice(0, 1).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="hidden min-w-0 lg:block flex-1">
                <div className="truncate text-xs font-medium text-zinc-100">{name ?? 'Demo account'}</div>
                <div className="truncate text-[11px] text-zinc-400">{email ?? 'Local Operator'}</div>
              </div>
            )}
          </Link>
        </div>
      </div>
    </aside>
  )
}
