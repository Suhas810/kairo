import {
  AlertCircle,
  CheckCircle2,
  Code2,
  Cpu,
  FileSearch,
  MoonStar,
  Play,
  Sparkles,
  TestTubeDiagonal,
  TriangleAlert,
} from 'lucide-react'

export type AgentState = 'Idle' | 'Planning' | 'Researching' | 'Coding' | 'Testing' | 'Debugging' | 'Completed' | 'Failed'

type AgentStatusProps = {
  state: AgentState
}

const stateConfig: Record<AgentState, { icon: typeof Play; tone: string; label: string }> = {
  Idle: { icon: MoonStar, tone: 'border-zinc-600 bg-zinc-900 text-zinc-200', label: 'Idle' },
  Planning: { icon: FileSearch, tone: 'border-violet-500/40 bg-violet-500/10 text-violet-200', label: 'Planning' },
  Researching: { icon: Sparkles, tone: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200', label: 'Researching' },
  Coding: { icon: Code2, tone: 'border-blue-500/40 bg-blue-500/10 text-blue-200', label: 'Coding' },
  Testing: { icon: TestTubeDiagonal, tone: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200', label: 'Testing' },
  Debugging: { icon: TriangleAlert, tone: 'border-amber-500/40 bg-amber-500/10 text-amber-200', label: 'Debugging' },
  Completed: { icon: CheckCircle2, tone: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200', label: 'Completed' },
  Failed: { icon: AlertCircle, tone: 'border-red-500/40 bg-red-500/10 text-red-200', label: 'Failed' },
}

export function AgentStatus({ state }: AgentStatusProps) {
  const config = stateConfig[state]
  const Icon = config.icon

  return (
    <div className="panel flex items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${config.tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Agent state</div>
          <div className="text-lg font-semibold text-white">{config.label}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300">
        <Cpu className="h-3.5 w-3.5 text-violet-300" />
        Active run
      </div>
    </div>
  )
}
