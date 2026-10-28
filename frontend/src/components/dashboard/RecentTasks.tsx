import { ArrowRight, Bot, CheckCircle2, Clock, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTask } from '../../hooks/useTask'
import { Badge, type BadgeTone } from '../ui/Badge'

const statusTone: Record<string, BadgeTone> = {
  pending: 'warning',
  in_progress: 'primary',
  completed: 'success',
  failed: 'error',
  cancelled: 'default',
}

export function RecentTasks({ onOpenCreateTask }: { onOpenCreateTask?: () => void }) {
  const { tasks } = useTask()
  const recent = tasks.slice(0, 5)

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-3">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Tasks</h2>
            <p className="text-xs text-zinc-400">Engineering tasks & agent workflows</p>
          </div>
          <Link
            to="/tasks"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recent.length > 0 ? (
          <div className="space-y-2.5">
            {recent.map((task) => (
              <div
                key={task.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">{task.taskType}</span>
                    <Badge tone={statusTone[task.status] || 'default'} size="xs" dot>
                      {task.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-[10px] text-zinc-500 font-mono">[{task.priority}]</span>
                  </div>
                  <h3 className="mt-1 text-xs sm:text-sm font-medium text-zinc-200 group-hover:text-white truncate">
                    {task.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/projects/${task.projectId}/agent`}
                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                    title="Launch agent for this task"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>Run Agent</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-zinc-800 p-6 text-center">
            <div>
              <Clock className="mx-auto h-6 w-6 text-zinc-600" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-zinc-300">No active tasks</p>
              <p className="mt-1 text-xs text-zinc-500">Create a task to assign work to AI agents.</p>
              {onOpenCreateTask ? (
                <button
                  type="button"
                  onClick={onOpenCreateTask}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                >
                  <Plus className="h-3.5 w-3.5" /> New Task
                </button>
              ) : (
                <Link
                  to="/tasks"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Create task →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span>{tasks.length} tasks registered in workspace</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <CheckCircle2 className="h-3 w-3" /> Ready for dispatch
        </span>
      </div>
    </section>
  )
}
