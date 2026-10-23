import { Link, useParams } from 'react-router-dom'
import { ExecutionPanel } from '../components/execution/ExecutionPanel'
import { useProject } from '../hooks/useProject'

export function Execution() {
  const { projectId } = useParams()
  const { state } = useProject(projectId)
  if (state.status !== 'success') return <p role="alert" className="text-sm text-red-200">{state.status === 'error' ? state.message : 'Project unavailable.'}</p>
  return <div className="space-y-4">
    <header className="border-b border-zinc-800 pb-4"><p className="text-xs text-zinc-500"><Link to={`/projects/${state.project.id}`} className="hover:text-zinc-300">{state.project.name}</Link> / Execution</p><h1 className="mt-1 text-xl font-semibold">Execution workspace</h1><p className="mt-1 text-sm text-zinc-400">Inspect deterministic checks, test fixtures, logs, and a restricted simulated terminal.</p></header>
    <ExecutionPanel />
  </div>
}
