import { ArrowUpRight, GitBranch, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProject } from '../hooks/useProject'

export function Repositories() {
  const { projects } = useProject()
  const connectedProjects = projects.filter((project) => project.repository)

  return (
    <div className="space-y-6">
      <header className="border-b border-zinc-800 pb-5">
        <p className="text-xs uppercase tracking-wider text-zinc-500">Workspace</p>
        <h1 className="mt-1 text-2xl font-semibold">Repositories</h1>
        <p className="mt-1 text-sm text-zinc-400">Review project repository references and browse the included read-only fixtures.</p>
      </header>

      <section className="flex items-start gap-3 rounded border border-amber-500/30 bg-amber-500/5 p-4">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <div>
          <h2 className="text-sm font-medium text-amber-100">Git provider is not configured</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-400">Repository references below are demo metadata only. Connect an approved OAuth or app flow through a backend before browsing real repositories. Do not enter GitHub passwords or tokens here.</p>
        </div>
      </section>

      {connectedProjects.length ? (
        <ul className="grid gap-3 lg:grid-cols-2">
          {connectedProjects.map((project) => (
            <li key={project.id} className="rounded border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-zinc-500">{project.name}</p>
                  <h2 className="mt-1 font-mono text-sm text-zinc-200">{project.repository}</h2>
                </div>
                <span className="rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-400">Demo reference</span>
              </div>
              <p className="mt-3 text-sm text-zinc-400">{project.description}</p>
              <Link to={`/projects/${project.id}/repository`} className="mt-4 inline-flex items-center gap-2 text-xs text-indigo-300 hover:text-indigo-200">
                Browse read-only fixture <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded border border-dashed border-zinc-700 p-8 text-center">
          <GitBranch className="mx-auto h-5 w-5 text-zinc-500" />
          <p className="mt-2 text-sm text-zinc-300">No repository references</p>
          <p className="mt-1 text-xs text-zinc-500">Add a project to see its repository status here.</p>
          <Link to="/projects" className="mt-4 inline-block text-xs text-indigo-300 hover:text-indigo-200">View projects</Link>
        </div>
      )}
    </div>
  )
}
