import {
  Activity,
  Bot,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Settings,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

type SidebarProps = {
  collapsed?: boolean
  onToggle?: () => void
}

type NavItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
}

const navigation: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'AI Agents', href: '/agent', icon: Bot },
  { label: 'Activity', href: '/activity', icon: Activity },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const workspaceItems = [
  { label: 'Design system', icon: Briefcase },
  { label: 'Launch sprint', icon: Plus },
]

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <aside
      className={[
        'border-r border-zinc-800 bg-zinc-950/90 transition-all duration-200',
        collapsed ? 'w-24' : 'w-72',
      ].join(' ')}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white shadow-soft">
              K
            </div>
            {!collapsed && <span className="text-lg font-semibold text-zinc-50">Kairo</span>}
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="hidden h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="space-y-2 px-3 py-4">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = location.pathname === href || (href !== '/' && location.pathname.startsWith(href))

            return (
              <Link
                key={label}
                to={href}
                className={[
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  active
                    ? 'bg-violet-500/15 text-violet-100 ring-1 ring-violet-500/30'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white',
                  collapsed ? 'justify-center px-2' : '',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 px-3">
          {!collapsed && (
            <div className="mb-3 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Workspace
            </div>
          )}

          <div className="space-y-2">
            {workspaceItems.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                className={[
                  'flex w-full items-center gap-3 rounded-xl border border-transparent bg-zinc-900/60 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white',
                  collapsed ? 'justify-center px-2' : '',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span>{label}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto border-t border-zinc-800 p-3">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-sm font-semibold text-white">
              RK
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-zinc-100">Rakshitha</div>
                <div className="text-xs text-zinc-400">Workspace owner</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
