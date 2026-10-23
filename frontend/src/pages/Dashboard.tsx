import { ArrowRight, Plus, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ActivityFeed } from '../components/dashboard/ActivityFeed'
import { DashboardStats } from '../components/dashboard/DashboardStats'
import { RecentTasks } from '../components/dashboard/RecentTasks'
import { useProject } from '../hooks/useProject'

export function Dashboard() {
  const { projects, createProject } = useProject()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function submitProject(event: FormEvent) {
    event.preventDefault()
    if (name.trim().length < 3) {
      setError('Use a project name with at least 3 characters.')
      return
    }
    const project = createProject(name, description)
    navigate(`/projects/${project.id}`)
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div><p className="text-xs uppercase tracking-wider text-zinc-500">Workspace</p><h1 className="mt-1 text-2xl font-semibold">Dashboard</h1><p className="mt-1 text-sm text-zinc-400">A practical view of your projects and recent work.</p></div>
        <button type="button" onClick={() => { setShowCreate((open) => !open); setError('') }} className="inline-flex items-center gap-2 rounded bg-indigo-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-400"><Plus className="h-4 w-4" /> New project</button>
      </header>
      {showCreate && <form onSubmit={submitProject} className="grid gap-3 rounded border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-[1fr_1.5fr_auto_auto] md:items-end">
        <div><label htmlFor="project-name" className="mb-1 block text-xs text-zinc-400">Project name</label><input id="project-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={3} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-400" /></div>
        <div><label htmlFor="project-description" className="mb-1 block text-xs text-zinc-400">Description (optional)</label><input id="project-description" value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-indigo-400" /></div>
        <button type="submit" className="rounded bg-indigo-500 px-3 py-2 text-sm text-white hover:bg-indigo-400">Create demo project</button>
        <button type="button" onClick={() => setShowCreate(false)} aria-label="Close create project form" className="rounded border border-zinc-700 p-2 text-zinc-400 hover:text-white"><X className="h-4 w-4" /></button>
        {error && <p role="alert" className="text-sm text-red-300 md:col-span-4">{error}</p>}
        <p className="text-xs text-zinc-500 md:col-span-4">Projects are kept in memory for this browser session; no repository is connected automatically.</p>
      </form>}
      <DashboardStats />
      <section>
        <div className="mb-3 flex items-center justify-between"><div><h2 className="text-base font-semibold">Projects</h2><span className="text-xs text-zinc-500">{projects.length} available in this session</span></div><Link to="/projects" className="text-xs text-indigo-300 hover:text-indigo-200">Browse all</Link></div>
        {projects.length > 0 ? <div className="grid gap-3 lg:grid-cols-3">
          {projects.map((project) => <Link key={project.id} to={`/projects/${project.id}`} className="group rounded border border-zinc-800 bg-zinc-950 p-4 transition hover:border-indigo-500/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400">
            <div className="flex items-start justify-between gap-3"><div><h3 className="font-medium group-hover:text-indigo-200">{project.name}</h3><p className="mt-1 text-xs text-zinc-500">{project.repository ?? 'Repository not connected'}</p></div><ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-indigo-300" /></div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{project.description}</p>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs"><span className="text-zinc-300">{project.status}</span><span className="text-zinc-500">Updated {project.updatedAt}</span></div>
          </Link>)}
        </div> : <div className="rounded border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-400">No projects yet. Create one to start exploring Kairo.</div>}
      </section>
      <div className="grid gap-4 xl:grid-cols-2"><RecentTasks /><ActivityFeed /></div>
    </div>
  )
}
