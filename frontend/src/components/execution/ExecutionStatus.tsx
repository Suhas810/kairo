import { CircleCheck, CircleDashed, CircleX, Clock3, OctagonX } from 'lucide-react'
import type { ExecutionStatus as Status } from '../../hooks/useExecution'

const details: Record<Status, { label: string; className: string; icon: typeof CircleCheck }> = {
  idle: { label: 'Idle', className: 'border-zinc-700 bg-zinc-900 text-zinc-300', icon: CircleDashed },
  queued: { label: 'Queued', className: 'border-zinc-700 bg-zinc-900 text-zinc-300', icon: Clock3 },
  running: { label: 'Running', className: 'border-sky-500/30 bg-sky-500/10 text-sky-200', icon: Clock3 },
  passed: { label: 'Passed', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200', icon: CircleCheck },
  failed: { label: 'Failed', className: 'border-red-500/30 bg-red-500/10 text-red-200', icon: CircleX },
  cancelled: { label: 'Cancelled', className: 'border-amber-500/30 bg-amber-500/10 text-amber-200', icon: OctagonX },
}

export function ExecutionStatus({ status }: { status: Status }) {
  const { label, className, icon: Icon } = details[status]
  return <span role="status" className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-medium ${className}`}><Icon className="h-3.5 w-3.5" />{label}</span>
}
