import { Activity, Bot, Code2, FileText, Sparkles, TestTubeDiagonal } from 'lucide-react'

type ActivityItem = {
  type: 'agent' | 'code' | 'test' | 'debug' | 'project' | 'fail'
  description: string
  project: string
  timestamp: string
}

const activities: ActivityItem[] = [
  { type: 'agent', description: 'Agent started planning the backend validation fix.', project: 'Auth Service', timestamp: '2 minutes ago' },
  { type: 'code', description: 'Code changes generated for the error-handling patch.', project: 'Kairo API', timestamp: '14 minutes ago' },
  { type: 'test', description: 'Tests passed after repository inspection and refactor.', project: 'Dashboard UI', timestamp: '28 minutes ago' },
  { type: 'debug', description: 'Debugging completed for the failing auth flow test.', project: 'Auth Service', timestamp: '1 hour ago' },
  { type: 'project', description: 'Project created and initial environment was bootstrapped.', project: 'Launch sprint', timestamp: '3 hours ago' },
  { type: 'fail', description: 'Task failed due to a flaky dependency test in CI.', project: 'Kairo API', timestamp: '5 hours ago' },
]

const icons: Record<ActivityItem['type'], typeof Activity> = {
  agent: Bot,
  code: Code2,
  test: TestTubeDiagonal,
  debug: Sparkles,
  project: FileText,
  fail: Activity,
}

const toneClasses: Record<ActivityItem['type'], string> = {
  agent: 'border-violet-500/40 bg-violet-500/10 text-violet-200',
  code: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
  test: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  debug: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  project: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
  fail: 'border-red-500/40 bg-red-500/10 text-red-200',
}

export function ActivityFeed() {
  return (
    <section className="panel p-4 md:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Activity</h2>
        <p className="text-sm text-zinc-400">Recent agent actions and project updates</p>
      </div>

      <div className="space-y-3">
        {activities.map(({ description, project, timestamp, type }) => {
          const Icon = icons[type]

          return (
            <div key={`${description}-${timestamp}`} className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${toneClasses[type]}`}>
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm leading-6 text-zinc-200">{description}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                  <span>{project}</span>
                  <span>•</span>
                  <span>{timestamp}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
