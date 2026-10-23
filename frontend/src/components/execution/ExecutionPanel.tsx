import { Play, RotateCcw, Square } from 'lucide-react'
import { useState } from 'react'
import { useExecution } from '../../hooks/useExecution'
import { BuildOutput } from './BuildOutput'
import { ExecutionLogs } from './ExecutionLogs'
import { ExecutionStatus } from './ExecutionStatus'
import { TestResults } from './TestResults'
import { Terminal } from '../terminal/Terminal'

type Tab = 'output' | 'tests' | 'logs' | 'terminal'
const tabs: Tab[] = ['output', 'tests', 'logs', 'terminal']

export function ExecutionPanel() {
  const execution = useExecution()
  const [tab, setTab] = useState<Tab>('output')
  const active = execution.status === 'queued' || execution.status === 'running'
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-100">Execution · simulated npm run check</h2>
          <p className="mt-1 text-xs text-zinc-500">Demo only — no commands run on your machine{execution.duration ? ` · ${execution.duration}` : ''}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExecutionStatus status={execution.status} />
          <button type="button" disabled={active} onClick={() => execution.run('pass')} className="inline-flex items-center gap-1.5 rounded border border-indigo-400 bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"><Play className="h-3.5 w-3.5" />Run checks</button>
          <button type="button" disabled={active} onClick={() => execution.run('fail')} className="rounded border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 disabled:opacity-50">Run failure fixture</button>
          {active
            ? <button type="button" onClick={execution.stop} className="inline-flex items-center gap-1.5 rounded border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300"><Square className="h-3 w-3" />Stop</button>
            : <button type="button" onClick={execution.reset} className="rounded border border-zinc-700 p-1.5 text-zinc-400 hover:text-white" aria-label="Reset execution"><RotateCcw className="h-3.5 w-3.5" /></button>}
        </div>
      </header>
      <nav aria-label="Execution panels" className="flex gap-1 border-b border-zinc-800 px-3 pt-2">
        {tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} aria-current={tab === item ? 'page' : undefined} className={`border-b-2 px-3 py-2 text-xs capitalize ${tab === item ? 'border-indigo-400 text-indigo-200' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>{item}</button>)}
      </nav>
      {tab === 'output' && <BuildOutput lines={execution.output} />}
      {tab === 'tests' && <TestResults tests={execution.tests} />}
      {tab === 'logs' && <ExecutionLogs logs={execution.logs} onClear={execution.clearLogs} />}
      {tab === 'terminal' && <Terminal />}
    </section>
  )
}
