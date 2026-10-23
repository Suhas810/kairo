import { CheckCircle2, CircleDashed, CircleX, Clock3 } from 'lucide-react'

export type StepStatus = 'Completed' | 'Running' | 'Pending' | 'Failed'

type AgentStepProps = {
  title: string
  description: string
  status: StepStatus
  timestamp?: string
  details?: string
}

const statusStyles: Record<StepStatus, string> = {
  Completed: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  Running: 'border-violet-500/40 bg-violet-500/10 text-violet-200',
  Pending: 'border-zinc-700 bg-zinc-900 text-zinc-300',
  Failed: 'border-red-500/40 bg-red-500/10 text-red-200',
}

const statusIcons: Record<StepStatus, typeof CheckCircle2> = {
  Completed: CheckCircle2,
  Running: CircleDashed,
  Pending: Clock3,
  Failed: CircleX,
}

export function AgentStep({ title, description, status, timestamp, details }: AgentStepProps) {
  const Icon = statusIcons[status]

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${statusStyles[status]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <h4 className="text-base font-medium text-zinc-100">{title}</h4>
          </div>
          <p className="mt-2 text-sm text-zinc-400">{description}</p>
        </div>

        {timestamp && <span className="text-xs text-zinc-500">{timestamp}</span>}
      </div>

      {details && <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 text-xs leading-6 text-zinc-300">{details}</div>}
    </div>
  )
}
