import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProject'

export function ProjectSettings() {
  const { projectId } = useParams()
  const { state, updateProject, deleteProject } = useProject(projectId)
  const navigate = useNavigate()
  const [name, setName] = useState(state.status === 'success' ? state.project.name : '')
  const [description, setDescription] = useState(state.status === 'success' ? state.project.description : '')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  if (state.status !== 'success') {
    return <p role="alert" className="rounded border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
      {state.status === 'error' ? state.message : 'Project is unavailable.'}
    </p>
  }
  const project = state.project

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (name.trim().length < 3) {
      setError('Project names must be at least 3 characters.')
      return
    }
    const updated = updateProject(project.id, { name, description })
    if (!updated) {
      setError('This project is no longer available.')
      return
    }
    setMessage('Project details updated for this browser session.')
  }

  function removeProject() {
    if (!window.confirm(`Delete "${project.name}" from this browser session?`)) return
    if (!deleteProject(project.id)) {
      setError('This project is no longer available.')
      return
    }
    navigate('/projects', { replace: true })
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header className="border-b border-zinc-800 pb-4">
        <p className="text-xs text-zinc-500"><Link to={`/projects/${project.id}`} className="hover:text-zinc-300">{project.name}</Link> / Settings</p>
        <h1 className="mt-1 text-xl font-semibold">Project settings</h1>
        <p className="mt-1 text-sm text-zinc-400">Edit the project details available in this local demo.</p>
      </header>

      <form onSubmit={save} className="space-y-4 rounded border border-zinc-800 bg-zinc-950 p-4">
        <div>
          <label htmlFor="project-settings-name" className="mb-1.5 block text-sm text-zinc-300">Project name</label>
          <input id="project-settings-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={3} maxLength={80} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label htmlFor="project-settings-description" className="mb-1.5 block text-sm text-zinc-300">Description</label>
          <textarea id="project-settings-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} maxLength={500} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-400" />
        </div>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
        <button type="submit" className="rounded bg-indigo-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-400">Save project</button>
      </form>

      <section className="rounded border border-red-500/30 bg-red-500/5 p-4">
        <h2 className="text-sm font-semibold text-red-200">Delete project</h2>
        <p className="mt-1 text-sm text-zinc-400">Remove this project from the current browser session. This does not affect a connected repository.</p>
        <button type="button" onClick={removeProject} className="mt-4 rounded border border-red-500/50 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10">Delete project</button>
      </section>
    </div>
  )
}
