import { Link, useParams } from 'react-router-dom'
import { RepositoryBrowser } from '../components/repository/RepositoryBrowser'
import { useProject } from '../hooks/useProject'

export function Repository() {
  const { projectId } = useParams()
  const { state } = useProject(projectId)
  if (state.status !== 'success') return <p role="alert" className="text-sm text-red-200">{state.status === 'error' ? state.message : 'Project unavailable.'}</p>
  const { project } = state
  return <div className="space-y-4">
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-800 pb-4"><div><p className="text-xs text-zinc-500"><Link to={`/projects/${project.id}`} className="hover:text-zinc-300">{project.name}</Link> / Repository</p><h1 className="mt-1 text-xl font-semibold">Repository</h1></div><span className="text-xs text-zinc-500">{project.repository ? `Fixture: ${project.repository}` : 'No repository connected'}</span></header>
    {project.repository ? <RepositoryBrowser /> : <div className="grid min-h-80 place-items-center rounded border border-dashed border-zinc-700 text-center"><div><p className="text-sm text-zinc-200">This project has no repository</p><p className="mt-2 text-xs text-zinc-500">Connectors are not available in this frontend demo.</p></div></div>}
  </div>
}
