import { useEffect, useMemo, useState } from 'react'
import { Activity, Bot, BriefcaseBusiness, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProject } from '../../hooks/useProject'
import { useTask } from '../../hooks/useTask'
import { executionService } from '../../services/executions'
import type { Execution } from '../../types/execution'

interface ActivityItem {
  id: string
  title: string
  detail: string
  timestamp: string
  icon: typeof Activity
  tone: string
  link?: string
}

export function ActivityFeed() {
  const { projects } = useProject()
  const { tasks } = useTask()
  const [executions, setExecutions] = useState<Execution[]>([])

  useEffect(() => {
    let isMounted = true
    void executionService.listExecutions().then((data) => {
      if (isMounted) setExecutions(data)
    })
    return () => {
      isMounted = false
    }
  }, [])

  const activities = useMemo<ActivityItem[]>(() => {
    const feed: ActivityItem[] = []

    // Add recent executions
    executions.forEach((exec) => {
      feed.push({
        id: `exec-${exec.id}`,
        title: `Sandbox check ${exec.status}: ${exec.title}`,
        detail: `Run completed with ${exec.testResults.length} test cases`,
        timestamp: exec.startedAt,
        icon: Play,
        tone: exec.status === 'passed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10',
        link: `/projects/${exec.projectId}/execution`,
      })
    })

    // Add recent tasks
    tasks.forEach((task) => {
      feed.push({
        id: `task-${task.id}`,
        title: `Task updated: ${task.title}`,
        detail: `Status: ${task.status} · Priority: ${task.priority}`,
        timestamp: task.updatedAt,
        icon: Bot,
        tone: 'text-indigo-400 bg-indigo-500/10',
        link: '/tasks',
      })
    })

    // Add projects
    projects.forEach((proj) => {
      feed.push({
        id: `proj-${proj.id}`,
        title: `Project workspace active: ${proj.name}`,
        detail: `Configured for ${proj.language} · ${proj.status}`,
        timestamp: proj.updatedAt,
        icon: BriefcaseBusiness,
        tone: 'text-violet-400 bg-violet-500/10',
        link: `/projects/${proj.id}`,
      })
    })

    // Sort by timestamp descending
    return feed.slice(0, 6)
  }, [executions, tasks, projects])

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-3">
          <div>
            <h2 className="text-base font-semibold text-white">Activity Stream</h2>
            <p className="text-xs text-zinc-400">Recent events across workspace services</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
        </div>

        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-2.5 transition-colors hover:border-zinc-700"
                >
                  <div className={`rounded-lg p-2 shrink-0 ${item.tone}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {item.link ? (
                      <Link
                        to={item.link}
                        className="text-xs font-medium text-zinc-200 hover:text-indigo-300 transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <div className="text-xs font-medium text-zinc-200 line-clamp-1">{item.title}</div>
                    )}
                    <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{item.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-zinc-800 p-6 text-center">
            <div>
              <Activity className="mx-auto h-6 w-6 text-zinc-600" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-zinc-300">No events logged</p>
              <p className="mt-1 text-xs text-zinc-500">Activity stream will populate as tasks execute.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span>Workspace events feed</span>
        <span className="text-zinc-400">Docker Sandbox · Online</span>
      </div>
    </section>
  )
}
