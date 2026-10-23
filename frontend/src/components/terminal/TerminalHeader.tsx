import { ChevronDown, Eraser, TerminalSquare } from 'lucide-react'

export function TerminalHeader({ onClear, onCollapse, collapsed }: { onClear: () => void; onCollapse: () => void; collapsed: boolean }) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-300"><TerminalSquare className="h-3.5 w-3.5" />Terminal <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-200">SIMULATED</span></div>
      <div className="flex gap-1">
        <button type="button" onClick={onClear} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white" aria-label="Clear simulated terminal"><Eraser className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={onCollapse} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white" aria-label={collapsed ? 'Expand terminal' : 'Collapse terminal'}><ChevronDown className={`h-3.5 w-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} /></button>
      </div>
    </header>
  )
}
