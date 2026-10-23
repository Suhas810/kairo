import { Bot, Code2, GitBranch, Play, Settings2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useProject } from '../hooks/useProject'

export function Project() {
  const { projectId } = useParams()
  const { state } = useProject(projectId)
  if (state.status !== 'success') return <p role="alert" className="rounded border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{state.status === 'error' ? state.message : 'Project is unavailable.'}</p>
  const { project } = state
  const links = [
    { label: 'Repository', detail: 'Browse files and inspect changes', href: 'repository', icon: Code2 },
    { label: 'Agent workspace', detail: 'Preview a local task workflow (no model connected)', href: 'agent', icon: Bot },
    { label: 'Execution', detail: 'Inspect simulated checks (no commands are run)', href: 'execution', icon: Play },
  ]
  return (
    <div className="space-y-6">
      <header className="border-b border-zinc-800 pb-5">
        <p className="text-xs text-zinc-500"><Link to="/projects" className="hover:text-zinc-300">Projects</Link> / {project.name}</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold">{project.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{project.description}</p></div><span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200">{project.status}</span></div>
        <Link to={`/projects/${project.id}/settings`} className="mt-4 inline-flex items-center gap-2 rounded border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white"><Settings2 className="h-3.5 w-3.5" />Project settings</Link>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><GitBranch className="h-4 w-4 text-indigo-300" />Repository</div>
          {project.repository ? <><p className="mt-3 font-mono text-sm text-zinc-200">{project.repository}</p><p className="mt-1 text-xs text-zinc-500">Demo fixture · not connected to a Git provider</p></> : <div className="mt-3 rounded border border-dashed border-zinc-700 p-4"><p className="text-sm text-zinc-300">No repository connected</p><p className="mt-1 text-xs text-zinc-500">Git provider integration is not configured in this frontend.</p></div>}
        </section>
        <section className="rounded border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><GitBranch className="h-4 w-4 text-indigo-300" />Project details</div>
          <dl className="mt-3 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt className="text-zinc-500">Language</dt><dd className="text-zinc-300">{project.language}</dd></div><div className="flex justify-between gap-3"><dt className="text-zinc-500">Updated</dt><dd className="text-zinc-300">{project.updatedAt}</dd></div></dl>
        </section>
      </div>
      <section><h2 className="mb-3 text-base font-semibold">Workspaces</h2><div className="grid gap-3 md:grid-cols-3">{links.map(({ label, detail, href, icon: Icon }) => <Link key={href} to={`/projects/${project.id}/${href}`} className="rounded border border-zinc-800 bg-zinc-950 p-4 hover:border-indigo-500/50"><Icon className="h-4 w-4 text-indigo-300" /><h3 className="mt-3 text-sm font-medium">{label}</h3><p className="mt-1 text-xs leading-5 text-zinc-500">{detail}</p></Link>)}</div></section>
    </div>
  )
}
