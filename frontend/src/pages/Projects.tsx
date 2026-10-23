import { ArrowUpRight, FolderGit2, Plus, Search } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/useProject'

export function Projects() {
  const { projects, createProject } = useProject()
  const [query, setQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return projects.filter((project) =>
      `${project.name} ${project.description} ${project.repository ?? ''}`.toLowerCase().includes(normalizedQuery),
    )
  }, [projects, query])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (name.trim().length < 3) {
      setError('Project names must be at least 3 characters.')
      return
    }
    const project = createProject(name, description)
    navigate(`/projects/${project.id}`)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500">Workspace</p>
          <h1 className="mt-1 text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-zinc-400">Browse and manage your local demo projects.</p>
        </div>
        <button type="button" onClick={() => { setShowCreate((visible) => !visible); setError('') }} className="inline-flex items-center gap-2 rounded bg-indigo-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-400">
          <Plus className="h-4 w-4" /> New project
        </button>
      </header>

      {showCreate && (
        <form onSubmit={submit} className="grid gap-3 rounded border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-[1fr_1.5fr_auto] md:items-end">
          <div>
            <label htmlFor="projects-name" className="mb-1 block text-xs text-zinc-400">Project name</label>
            <input id="projects-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={3} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label htmlFor="projects-description" className="mb-1 block text-xs text-zinc-400">Description</label>
            <input id="projects-description" value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </div>
          <button type="submit" className="rounded bg-indigo-500 px-3 py-2 text-sm text-white hover:bg-indigo-400">Create project</button>
          <p className="text-xs text-zinc-500 md:col-span-3">This creates a local project for this browser session. Repository connection requires a configured provider.</p>
          {error && <p role="alert" className="text-sm text-red-300 md:col-span-3">{error}</p>}
        </form>
      )}

      <label className="relative block max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <span className="sr-only">Search projects</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects…" className="w-full rounded border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400" />
      </label>

      {filteredProjects.length > 0 ? (
        <ul className="grid gap-3 lg:grid-cols-2">
          {filteredProjects.map((project) => (
            <li key={project.id}>
              <Link to={`/projects/${project.id}`} className="group block rounded border border-zinc-800 bg-zinc-950 p-4 transition hover:border-indigo-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <FolderGit2 className="mt-0.5 h-5 w-5 text-indigo-300" />
                    <div>
                      <h2 className="font-medium group-hover:text-indigo-200">{project.name}</h2>
                      <p className="mt-1 text-xs text-zinc-500">{project.repository ?? 'No repository connected'}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-indigo-300" />
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{project.description}</p>
                <div className="mt-4 flex justify-between border-t border-zinc-800 pt-3 text-xs text-zinc-500">
                  <span>{project.language}</span>
                  <span>Updated {project.updatedAt}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded border border-dashed border-zinc-700 p-8 text-center">
          <p className="text-sm text-zinc-300">{projects.length === 0 ? 'No projects yet' : 'No matching projects'}</p>
          <p className="mt-1 text-xs text-zinc-500">{projects.length === 0 ? 'Create a project to start exploring the workspace.' : 'Try a different search term.'}</p>
          {projects.length === 0 && <button type="button" onClick={() => setShowCreate(true)} className="mt-4 rounded bg-indigo-500 px-3 py-2 text-sm text-white hover:bg-indigo-400">Create project</button>}
        </div>
      )}
    </div>
  )
}
