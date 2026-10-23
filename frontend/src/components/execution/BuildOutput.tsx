import { TerminalSquare } from 'lucide-react'

export function BuildOutput({ lines }: { lines: string[] }) {
  if (!lines.length) return <div className="p-8 text-center text-sm text-zinc-400">No build output yet. Start a simulated run to see output.</div>
  return (
    <div className="max-h-[420px] overflow-auto bg-[#0b0d10] p-4">
      <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500"><TerminalSquare className="h-3.5 w-3.5" /> Simulated build output</div>
      <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-zinc-300">{lines.map((line, index) => <div key={index} className={line.toLowerCase().includes('fail') ? 'text-red-300' : line.toLowerCase().includes('complete') || line.toLowerCase().includes('passed') ? 'text-emerald-300' : ''}>{line}</div>)}</pre>
    </div>
  )
}
