import { CircleDashed, Clock3, CircleCheckBig, CircleX } from 'lucide-react'

type TaskStatus = 'Completed' | 'Running' | 'Pending' | 'Failed'

type Task = {
  title: string
  project: string
  type: string
  status: TaskStatus
  timestamp: string
}

const tasks: Task[] = [
  { title: 'Fix authentication validation', project: 'Auth Service', type: 'Bugfix', status: 'Completed', timestamp: '2m ago' },
  { title: 'Add project search functionality', project: 'Dashboard UI', type: 'Feature', status: 'Running', timestamp: '12m ago' },
  { title: 'Resolve failing unit tests', project: 'Kairo API', type: 'Testing', status: 'Pending', timestamp: '1h ago' },
  { title: 'Refactor API error handling', project: 'Kairo API', type: 'Cleanup', status: 'Failed', timestamp: '3h ago' },
]

const statusClasses: Record<TaskStatus, string> = {
  Completed: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  Running: 'border-violet-500/40 bg-violet-500/10 text-violet-200',
  Pending: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  Failed: 'border-red-500/40 bg-red-500/10 text-red-200',
}

const statusIcons: Record<TaskStatus, typeof CircleCheckBig> = {
  Completed: CircleCheckBig,
  Running: CircleDashed,
  Pending: Clock3,
  Failed: CircleX,
}

export function RecentTasks() {
  return (
    <section className="panel p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent tasks</h2>
          <p className="text-sm text-zinc-400">Latest execution queue and agent work</p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-5 text-sm text-zinc-400">
            No recent tasks to show.
          </div>
        ) : (
          tasks.map(({ title, project, type, status, timestamp }) => {
            const Icon = statusIcons[status]
            return (
              <div key={`${title}-${timestamp}`} className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-medium text-zinc-100">{title}</h3>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{type}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{project}</p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={`status-badge ${statusClasses[status]}`}>
                    <Icon className="h-3 w-3" />
                    {status}
                  </span>
                  <span className="text-[11px] text-zinc-500">{timestamp}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
