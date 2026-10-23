import { FilePlus2, FileX2, GitBranch, Pencil, CircleHelp } from 'lucide-react'
import { gitChanges } from '../../data/mockData'

const icons = { M: Pencil, A: FilePlus2, D: FileX2, '?': CircleHelp }
const colors = { M: 'text-amber-300', A: 'text-emerald-300', D: 'text-red-300', '?': 'text-sky-300' }

export function GitChanges({ onSelect }: { onSelect: (path: string) => void }) {
  return (
    <section className="border-t border-zinc-800">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400"><GitBranch className="h-3.5 w-3.5" /> Changes</div>
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">{gitChanges.length}</span>
      </div>
      <p className="px-3 pb-2 text-[11px] text-zinc-500">Demo Git fixture · not connected to a repository</p>
      {gitChanges.map((change) => {
        const Icon = icons[change.status]
        return (
          <button key={change.path} type="button" onClick={() => onSelect(change.path)} className="flex w-full min-w-0 items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800">
            <Icon className={`h-3.5 w-3.5 shrink-0 ${colors[change.status]}`} />
            <span className="truncate font-mono">{change.path}</span>
            <span className="ml-auto shrink-0 text-[10px] text-zinc-500">{change.detail}</span>
          </button>
        )
      })}
    </section>
  )
}
