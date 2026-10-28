import { useMemo, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Edit2,
  FolderGit2,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/useProject'
import { useToast } from '../hooks/useToast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Badge, type BadgeTone } from '../components/ui/Badge'
import type { Project } from '../data/mockData'

const statusToneMap: Record<string, BadgeTone> = {
  Healthy: 'success',
  healthy: 'success',
  Reviewing: 'warning',
  reviewing: 'warning',
  'On track': 'primary',
  'on-track': 'primary',
  archived: 'default',
}

export function Projects() {
  const { projects, createProject, updateProject, deleteProject } = useProject()
  const toast = useToast()
  const navigate = useNavigate()

  // Search & Filter
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'updated' | 'name'>('updated')

  // Modals
  const [showCreate, setShowCreate] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [repository, setRepository] = useState('')
  const [language, setLanguage] = useState('TypeScript')
  const [status, setStatus] = useState<Project['status']>('On track')
  const [error, setError] = useState('')

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return projects
      .filter((project) => {
        const matchesQuery =
          `${project.name} ${project.description} ${project.repository ?? ''} ${project.language}`
            .toLowerCase()
            .includes(normalizedQuery)
        const matchesStatus =
          statusFilter === 'all' || project.status.toLowerCase() === statusFilter.toLowerCase()
        return matchesQuery && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name)
        }
        return 0 // default order (most recently updated first)
      })
  }, [projects, query, statusFilter, sortBy])

  function handleOpenCreate() {
    setName('')
    setDescription('')
    setRepository('')
    setLanguage('TypeScript')
    setStatus('On track')
    setError('')
    setShowCreate(true)
  }

  function handleOpenEdit(project: Project) {
    setEditingProject(project)
    setName(project.name)
    setDescription(project.description)
    setRepository(project.repository || '')
    setLanguage(project.language)
    setStatus(project.status)
    setError('')
  }

  function submitCreate(event: FormEvent) {
    event.preventDefault()
    if (name.trim().length < 3) {
      setError('Project names must be at least 3 characters.')
      return
    }

    const created = createProject(name, description, repository || null, language, status)
    toast.success(`Project "${created.name}" created.`)
    setShowCreate(false)
    navigate(`/projects/${created.id}`)
  }

  function submitEdit(event: FormEvent) {
    event.preventDefault()
    if (!editingProject) return
    if (name.trim().length < 3) {
      setError('Project names must be at least 3 characters.')
      return
    }

    const updated = updateProject(editingProject.id, {
      name,
      description,
      repository: repository || null,
      language,
      status,
    })

    if (updated) {
      toast.success(`Project "${updated.name}" updated.`)
    }
    setEditingProject(null)
  }

  function confirmDelete() {
    if (!deletingProject) return
    const success = deleteProject(deletingProject.id)
    if (success) {
      toast.success(`Project "${deletingProject.name}" deleted.`)
    } else {
      toast.error('Unable to delete project.')
    }
    setDeletingProject(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-mono">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-indigo-400">Repositories & Services</span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-white">Projects</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Browse, manage, and inspect all software projects registered in your workspace.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          New Project
        </Button>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects by name, description, or repo..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-8 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-300 outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="reviewing">Reviewing</option>
            <option value="on track">On track</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updated' | 'name')}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-300 outline-none focus:border-indigo-500"
          >
            <option value="updated">Recently Updated</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <li key={project.id}>
              <div className="group flex flex-col justify-between h-full rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/40">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2 text-indigo-300 shrink-0">
                        <FolderGit2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/projects/${project.id}`}
                          className="font-semibold text-sm text-zinc-100 group-hover:text-indigo-300 transition-colors truncate block"
                        >
                          {project.name}
                        </Link>
                        <p className="font-mono text-[11px] text-zinc-500 truncate">
                          {project.repository ?? 'No repository connected'}
                        </p>
                      </div>
                    </div>
                    <Badge tone={statusToneMap[project.status] || 'default'} size="xs" dot>
                      {project.status}
                    </Badge>
                  </div>

                  <p className="mt-3.5 text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono mb-3">
                    <span>{project.language}</span>
                    <span>Updated {project.updatedAt}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-zinc-850 pt-2.5">
                    <div className="flex items-center gap-3 text-xs">
                      <Link
                        to={`/projects/${project.id}/agent`}
                        className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                        title="Open Agent workspace"
                      >
                        <Bot className="h-3.5 w-3.5" /> Agent
                      </Link>
                      <Link
                        to={`/projects/${project.id}/execution`}
                        className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                        title="Run Execution"
                      >
                        <Play className="h-3.5 w-3.5" /> Checks
                      </Link>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(project)}
                        className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                        title="Edit Project"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProject(project)}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <Link
                        to={`/projects/${project.id}`}
                        className="p-1 rounded text-zinc-500 hover:text-white"
                        title="View Details"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40">
          <BriefcaseBusiness className="mx-auto h-8 w-8 text-zinc-600" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-200">
            {projects.length === 0 ? 'No projects yet' : 'No matching projects found'}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            {projects.length === 0
              ? 'Create a project to start organizing tasks, repositories, and executions.'
              : 'Try clearing your search query or status filter.'}
          </p>
          {projects.length === 0 && (
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Create Project
            </Button>
          )}
        </div>
      )}

      {/* Modal: Create Project */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Project"
        description="Initialize a new project workspace for tasks and automated coding agents."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={submitCreate}>
              Create Project
            </Button>
          </>
        }
      >
        <form onSubmit={submitCreate} className="space-y-4">
          <Input
            label="Project Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Identity Service"
            error={error}
          />

          <div>
            <label htmlFor="create-proj-desc" className="mb-1.5 block text-xs font-medium text-zinc-300">
              Description
            </label>
            <textarea
              id="create-proj-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this service or codebase do?"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
          </div>

          <Input
            label="Repository URL or Reference"
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            placeholder="e.g. kairo/identity-service"
            helperText="Connect a Git repository for code indexing and automated reviews."
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="create-proj-lang" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Primary Language
              </label>
              <select
                id="create-proj-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
              >
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="React">React</option>
                <option value="Node.js">Node.js</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
              </select>
            </div>

            <div>
              <label htmlFor="create-proj-status" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Status
              </label>
              <select
                id="create-proj-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Project['status'])}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
              >
                <option value="On track">On track</option>
                <option value="Healthy">Healthy</option>
                <option value="Reviewing">Reviewing</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Project */}
      {editingProject && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProject(null)}
          title="Edit Project"
          description={`Update metadata and configuration for ${editingProject.name}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setEditingProject(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={submitEdit}>
                Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={submitEdit} className="space-y-4">
            <Input
              label="Project Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={error}
            />

            <div>
              <label htmlFor="edit-proj-desc" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Description
              </label>
              <textarea
                id="edit-proj-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
              />
            </div>

            <Input
              label="Repository URL or Reference"
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-proj-lang" className="mb-1.5 block text-xs font-medium text-zinc-300">
                  Primary Language
                </label>
                <select
                  id="edit-proj-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                >
                  <option value="TypeScript">TypeScript</option>
                  <option value="Python">Python</option>
                  <option value="React">React</option>
                  <option value="Node.js">Node.js</option>
                  <option value="Go">Go</option>
                  <option value="Rust">Rust</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit-proj-status" className="mb-1.5 block text-xs font-medium text-zinc-300">
                  Status
                </label>
                <select
                  id="edit-proj-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Project['status'])}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                >
                  <option value="On track">On track</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Reviewing">Reviewing</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmation Dialog: Delete Project */}
      {deletingProject && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingProject(null)}
          onConfirm={confirmDelete}
          title="Delete Project"
          message={`Are you sure you want to delete project "${deletingProject.name}"? All associated local settings will be removed.`}
          confirmLabel="Delete Project"
        />
      )}
    </div>
  )
}
