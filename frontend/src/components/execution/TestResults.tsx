import { ChevronDown, ChevronRight, CircleCheck, CircleX, Clock3 } from 'lucide-react'
import { useState } from 'react'
import type { TestCase } from '../../hooks/useExecution'

export function TestResults({ tests }: { tests: TestCase[] }) {
  const [expanded, setExpanded] = useState<string[]>([])
  const toggle = (name: string) => setExpanded((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  const passed = tests.filter((test) => test.status === 'passed').length
  const failed = tests.filter((test) => test.status === 'failed').length
  const skipped = tests.filter((test) => test.status === 'skipped').length
  if (!tests.length) return <div className="p-8 text-center text-sm text-zinc-400">Tests will appear here after a simulated run.</div>
  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="text-zinc-300">Total <b>{tests.length}</b></span>
        <span className="text-emerald-300">Passed <b>{passed}</b></span>
        <span className="text-red-300">Failed <b>{failed}</b></span>
        <span className="text-zinc-400">Skipped <b>{skipped}</b></span>
      </div>
      <ul className="divide-y divide-zinc-800 rounded border border-zinc-800">
        {tests.map((test) => {
          const isExpanded = expanded.includes(test.name)
          const Icon = test.status === 'passed' ? CircleCheck : test.status === 'failed' ? CircleX : Clock3
          return (
            <li key={test.name}>
              <button type="button" disabled={!test.error} onClick={() => test.error && toggle(test.name)} aria-expanded={test.error ? isExpanded : undefined} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-zinc-900 disabled:cursor-default">
                {test.error ? (isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />) : <span className="w-3.5" />}
                <Icon className={`h-4 w-4 ${test.status === 'passed' ? 'text-emerald-300' : test.status === 'failed' ? 'text-red-300' : 'text-zinc-400'}`} />
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-200">{test.name}</span>
                <span className="text-xs text-zinc-500">{test.duration}</span>
              </button>
              {test.error && isExpanded && <pre className="whitespace-pre-wrap border-t border-zinc-800 bg-red-950/20 px-10 py-3 font-mono text-xs leading-5 text-red-200">{test.error}</pre>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
