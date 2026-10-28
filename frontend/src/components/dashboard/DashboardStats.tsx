import { useEffect, useState } from 'react'
import { ArrowUpRight, BriefcaseBusiness, CheckSquare, Code2, Gauge } from 'lucide-react'
import { useProject } from '../../hooks/useProject'
import { useTask } from '../../hooks/useTask'
import { executionService } from '../../services/executions'
import { repositoryService } from '../../services/repositories'
import type { Execution } from '../../types/execution'

export function DashboardStats() {
  const { projects } = useProject()
  const { tasks } = useTask()
  const [executions, setExecutions] = useState<Execution[]>([])
  const [repoCount, setRepoCount] = useState(0)

  useEffect(() => {
    let isMounted = true
    void executionService.listExecutions().then((data) => {
      if (isMounted) setExecutions(data)
    })
    void repositoryService.listRepositories().then((repos) => {
      if (isMounted) setRepoCount(repos.length)
    })
    return () => {
      isMounted = false
    }
  }, [])

  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length
  const passedExecutions = executions.filter((e) => e.status === 'passed').length
  const passRate =
    executions.length > 0 ? `${Math.round((passedExecutions / executions.length) * 100)}%` : '100%'

  const stats = [
    {
      label: 'Active Projects',
      value: String(projects.length),
      detail: `${projects.filter((p) => p.status === 'Healthy' || p.status === 'On track').length} in good standing`,
      icon: BriefcaseBusiness,
      tone: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    },
    {
      label: 'Tasks Backlog',
      value: String(tasks.length),
      detail: `${inProgressTasks} running · ${completedTasks} completed`,
      icon: CheckSquare,
      tone: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    },
    {
      label: 'Connected Repositories',
      value: String(repoCount),
      detail: 'Indexed & AST analyzed',
      icon: Code2,
      tone: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    },
    {
      label: 'Execution Pass Rate',
      value: executions.length > 0 ? passRate : '100%',
      detail: `${passedExecutions}/${executions.length || 1} verified sandbox runs`,
      icon: Gauge,
      tone: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, detail, icon: Icon, tone }) => (
        <article
          key={label}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-all hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <div className={`rounded-xl border p-2.5 ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
              <ArrowUpRight className="h-3 w-3" /> Live
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{value}</h3>
            </div>
            <p className="mt-1.5 text-xs text-zinc-400 truncate">{detail}</p>
          </div>
        </article>
      ))}
    </section>
  )
}
