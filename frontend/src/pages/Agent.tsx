import { Bot, CircleCheck, CircleDashed, LoaderCircle, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAgent } from '../hooks/useAgent'
import type { AgentStage } from '../contexts/AgentContext'
import { useProject } from '../hooks/useProject'

const stages: AgentStage[] = ['planning', 'research', 'coding', 'testing', 'complete']

export function Agent() {
  const { projectId } = useParams()
  const { state } = useProject(projectId)
  const agent = useAgent()
  const [draft, setDraft] = useState('')
  if (state.status !== 'success') return <p role="alert" className="text-sm text-red-200">{state.status === 'error' ? state.message : 'Project unavailable.'}</p>
  function submit(event: FormEvent) {
    event.preventDefault()
    if (agent.submitTask(draft)) setDraft('')
  }
  return <div className="space-y-4">
    <header className="border-b border-zinc-800 pb-4"><p className="text-xs text-zinc-500"><Link to={`/projects/${state.project.id}`} className="hover:text-zinc-300">{state.project.name}</Link> / Agent</p><h1 className="mt-1 text-xl font-semibold">Agent workspace</h1><p className="mt-1 text-sm text-zinc-400">A deterministic workflow preview. No AI model is connected and no files are changed.</p></header>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="flex min-h-[520px] flex-col overflow-hidden rounded border border-zinc-800 bg-zinc-950">
        <header className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3"><Bot className="h-4 w-4 text-indigo-300" /><div><h2 className="text-sm font-medium">Demo agent session</h2><p className="text-[11px] text-zinc-500">Simulated responses only</p></div></header>
        <div className="flex-1 space-y-4 overflow-auto p-4">
          {agent.events.length === 0 ? <div className="rounded border border-dashed border-zinc-700 p-5 text-sm text-zinc-400">Describe a task to see a staged demo workflow. It will not edit your repository.</div> : <div className="space-y-3">
            <article className="ml-auto max-w-[90%] rounded bg-indigo-500/10 p-3 text-sm leading-6 text-zinc-200"><p className="mb-1 text-[10px] uppercase text-indigo-300">Task input</p>{agent.task}</article>
            {agent.events.map((event) => <article key={event.id} className="max-w-[90%] rounded border border-zinc-800 bg-zinc-900/60 p-3 text-sm"><div className="mb-1 flex items-center justify-between gap-3"><span className="text-xs font-medium capitalize text-indigo-200">{event.stage}</span><time className="text-[10px] text-zinc-500">{event.time}</time></div><p className="text-zinc-300">{event.message}</p></article>)}
          </div>}
          {agent.error && <p role="alert" className="text-sm text-red-300">{agent.error}</p>}
        </div>
        <form onSubmit={submit} className="flex gap-2 border-t border-zinc-800 p-3"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} placeholder="Describe a task for the demo…" aria-label="Agent task" className="min-h-12 flex-1 resize-y rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-400" /><button type="submit" disabled={agent.status === 'running'} aria-label="Submit demo task" className="self-end rounded bg-indigo-500 p-3 text-white hover:bg-indigo-400 disabled:opacity-50"><Send className="h-4 w-4" /></button></form>
      </section>
      <aside className="rounded border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Workflow stages</h2><span className="text-xs capitalize text-zinc-500">{agent.status}</span></div>
        <ol className="mt-4 space-y-3">{stages.map((stage) => {
          const done = agent.events.some((event) => event.stage === stage)
          const active = agent.stage === stage && agent.status === 'running'
          const Icon = active ? LoaderCircle : done ? CircleCheck : CircleDashed
          return <li key={stage} className="flex items-center gap-2 text-sm"><Icon className={`h-4 w-4 ${active ? 'animate-spin text-indigo-300' : done ? 'text-emerald-300' : 'text-zinc-600'}`} /><span className={`capitalize ${done ? 'text-zinc-200' : 'text-zinc-500'}`}>{stage}</span></li>
        })}</ol>
        <p className="mt-5 border-t border-zinc-800 pt-4 text-xs leading-5 text-zinc-500">Progress and responses are local fixtures. The session timeline remains available while navigating the app.</p>
      </aside>
    </div>
  </div>
}
