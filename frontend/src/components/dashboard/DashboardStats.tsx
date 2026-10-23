import { ArrowUpRight, BriefcaseBusiness, Bot, CheckCheck, Gauge } from 'lucide-react'
import { useProject } from '../../hooks/useProject'

const toneClasses: Record<string, string> = {
  violet: 'border-violet-500/30 bg-violet-500/10 text-violet-200',
  cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
}

export function DashboardStats() {
  const { projects } = useProject()
  const stats = [
    { label: 'Projects', value: String(projects.length), detail: 'Available in this session', icon: BriefcaseBusiness, tone: 'violet' },
    { label: 'Connected agent', value: 'Unavailable', detail: 'No model service configured', icon: Bot, tone: 'cyan' },
    { label: 'Completed tasks', value: '—', detail: 'No task service configured', icon: CheckCheck, tone: 'emerald' },
    { label: 'Execution success', value: '—', detail: 'No backend execution results', icon: Gauge, tone: 'amber' },
  ]
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, detail, icon: Icon, tone }) => (
        <article key={label} className="panel p-4">
          <div className="flex items-center justify-between">
            <div className={`rounded-xl border p-2 ${toneClasses[tone]}`}>
              <Icon className="h-5 w-5" />
            </div>
            {label === 'Projects' && <span className="flex items-center gap-1 text-xs font-medium text-zinc-400"><ArrowUpRight className="h-3.5 w-3.5" />Local</span>}
          </div>

          <div className="mt-4">
            <p className="text-sm text-zinc-400">{label}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <h3 className="text-3xl font-semibold text-white">{value}</h3>
            </div>
            <p className="mt-2 text-xs text-zinc-400">{detail}</p>
          </div>
        </article>
      ))}
    </section>
  )
}
