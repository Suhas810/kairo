import { ChevronDown, ChevronUp, Command, FileCode2, FileText, Terminal, TestTube2 } from 'lucide-react'
import { useState } from 'react'

export type ToolStatus = 'success' | 'running' | 'failed'

type ToolCallProps = {
  name: string
  description: string
  status: ToolStatus
  argument: string
  output?: string
}

const statusColors: Record<ToolStatus, string> = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  running: 'border-violet-500/40 bg-violet-500/10 text-violet-200',
  failed: 'border-red-500/40 bg-red-500/10 text-red-200',
}

const toolIcons: Record<string, typeof FileCode2> = {
  'File read': FileText,
  'File write': FileCode2,
  'Terminal command': Terminal,
  'Test execution': TestTube2,
  'Directory listing': FileText,
  'Code search': Command,
}

export function ToolCall({ name, description, status, argument, output }: ToolCallProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = toolIcons[name] ?? Terminal

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${statusColors[status]}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">{name}</h4>
            <p className="mt-1 text-xs text-zinc-400">{description}</p>
          </div>
        </div>

        <span className={`status-badge ${statusColors[status]}`}>{status}</span>
      </div>

      <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
        <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">Argument</div>
        <code className="block overflow-x-auto text-xs text-zinc-200">{argument}</code>
      </div>

      {output && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? 'Hide output' : 'Show output'}
          </button>

          {expanded && (
            <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-xs leading-6 text-zinc-300">
              {output}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
