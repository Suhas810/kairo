import { Bell, Command, Search, Sparkles } from 'lucide-react'

type NavbarProps = {
  workspace?: string
  activeProject?: string
}

export function Navbar({ workspace = 'Kairo Workspace', activeProject = 'Kairo API' }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5">
            <Sparkles className="h-4 w-4 text-violet-300" />
            <span className="text-sm font-semibold text-violet-100">Kairo</span>
          </div>

          <div className="hidden min-w-0 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-300 md:flex">
            <span className="truncate font-medium text-zinc-100">{workspace}</span>
            <span className="text-zinc-500">/</span>
            <span className="truncate text-zinc-400">{activeProject}</span>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <label className="flex w-full max-w-lg items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-400 transition focus-within:border-violet-500/60 focus-within:text-zinc-200">
            <Search className="h-4 w-4" />
            <input
              aria-label="Search project or task"
              className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              placeholder="Search projects, tasks, or agents"
            />
            <div className="hidden items-center gap-1 rounded-md border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 lg:flex">
              <Command className="h-3 w-3" />
              K
            </div>
          </label>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:border-zinc-700 hover:text-white" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </button>

          <button className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-left transition hover:border-violet-500/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-semibold text-white">
              RK
            </div>
            <div className="hidden text-left md:block">
              <div className="text-sm font-medium text-zinc-100">Rakshitha</div>
              <div className="text-[11px] text-zinc-400">Product lead</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
