import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { ExecutionLog } from '../../hooks/useExecution'

export function ExecutionLogs({ logs, onClear }: { logs: ExecutionLog[]; onClear: () => void }) {
  const [filter, setFilter] = useState<'all' | ExecutionLog['level']>('all')
  const visible = logs.filter((log) => filter === 'all' || log.level === filter)
  return (
    <section className="min-h-40">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 px-4 py-2">
        <label className="flex items-center gap-2 text-xs text-zinc-400">Level
          <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200">
            <option value="all">All levels</option><option value="info">Info</option><option value="warn">Warning</option><option value="error">Error</option>
          </select>
        </label>
        <button type="button" onClick={onClear} className="inline-flex items-center gap-1 rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:border-zinc-500"><Trash2 className="h-3 w-3" />Clear local logs</button>
      </div>
      {visible.length ? <ul className="max-h-[360px] divide-y divide-zinc-900 overflow-auto font-mono text-xs">
        {visible.map((log) => <li key={log.id} className="grid grid-cols-[4.5rem_3.5rem_minmax(0,1fr)] gap-3 px-4 py-2.5">
          <time className="text-zinc-500">{log.time}</time>
          <span className={log.level === 'error' ? 'text-red-300' : log.level === 'warn' ? 'text-amber-300' : 'text-sky-300'}>{log.level.toUpperCase()}</span>
          <span className="break-words text-zinc-300">{log.message}</span>
        </li>)}
      </ul> : <p className="p-8 text-center text-sm text-zinc-500">No logs match this level.</p>}
    </section>
  )
}
