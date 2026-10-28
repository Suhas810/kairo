import { useState } from 'react'
import {
  ArrowRight,
  Bot,
  CheckSquare,
  Code2,
  Edit2,
  FolderGit2,
  GitBranch,
  Play,
  Plus,
  Settings2,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProject } from '../hooks/useProject'
import { useTask } from '../hooks/useTask'
import { useToast } from '../hooks/useToast'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Badge, type BadgeTone } from '../components/ui/Badge'
import type { TaskPriority, TaskType } from '../types/task'

const statusToneMap: Record<string, BadgeTone> = {
  Healthy: 'success',
  healthy: 'success',
  Reviewing: 'warning',
  reviewing: 'warning',
  'On track': 'primary',
  'on-track': 'primary',
  archived: 'default',
}

export function Project() {
  const { projectId } = useParams()
  const { state, updateProject, deleteProject } = useProject(projectId)
  const { getProjectTasks, createTask } = useTask()
  const toast = useToast()
  const navigate = useNavigate()

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)

  // Edit project fields
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editRepo, setEditRepo] = useState('')
  const [editLang, setEditLang] = useState('')
  const [editStatus, setEditStatus] = useState<string>('On track')

  // Create task fields
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('normal')
  const [taskType, setTaskType] = useState<TaskType>('feature')
  const [taskError, setTaskError] = useState('')

  if (state.status !== 'success') {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
        <h2 className="font-semibold text-base">Project Unavailable</h2>
        <p className="mt-1 text-xs text-red-300">
          {state.status === 'error' ? state.message : 'The requested project could not be found.'}
        </p>
        <Link
          to="/projects"
          className="mt-4 inline-block rounded-lg bg-zinc-800 px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-700"
        >
          Return to Projects
        </Link>
      </div>
    )
  }

  const { project } = state
  const projectTasks = getProjectTasks(project.id)

  function handleOpenEdit() {
    setEditName(project.name)
    setEditDesc(project.description)
    setEditRepo(project.repository || '')
    setEditLang(project.language)
    setEditStatus(project.status)
    setIsEditOpen(true)
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (editName.trim().length < 3) return

    updateProject(project.id, {
      name: editName,
      description: editDesc,
      repository: editRepo || null,
      language: editLang,
      status: editStatus as any,
    })
    toast.success('Project details saved.')
    setIsEditOpen(false)
  }

  function handleConfirmDelete() {
    deleteProject(project.id)
    toast.success(`Project "${project.name}" deleted.`)
    navigate('/projects', { replace: true })
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()
    if (!taskTitle.trim()) {
      setTaskError('Task title is required.')
      return
    }

    try {
      await createTask({
        projectId: project.id,
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        taskType: taskType,
      })
      toast.success('Task created for this project.')
      setIsCreateTaskOpen(false)
      setTaskTitle('')
      setTaskDesc('')
      setTaskError('')
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Unable to create task.')
    }
  }

  const workspaceLinks = [
    {
      label: 'Repository Browser',
      detail: 'Inspect indexed AST, file tree, and staged git changes',
      href: 'repository',
      icon: Code2,
      badge: project.repository ? 'Connected' : 'Fixture',
    },
    {
      label: 'AI Agent Workspace',
      detail: 'Plan, research, synthesize diffs, and inspect workflow stages',
      href: 'agent',
      icon: Bot,
      badge: 'Qwen 2.5 7B',
    },
    {
      label: 'Execution Sandbox',
      detail: 'Run containerized test suites, inspect logs and sandbox terminal',
      href: 'execution',
      icon: Play,
      badge: 'Docker Runner',
    },
  ]

  return (
    <div className="space-y-7">
      {/* Header */}
      <header className="border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-mono">
          <Link to="/projects" className="hover:text-zinc-300">
            Projects
          </Link>
          <span>/</span>
          <span className="text-zinc-300">{project.name}</span>
        </div>

        <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white truncate">
                {project.name}
              </h1>
              <Badge tone={statusToneMap[project.status] || 'default'} size="sm" dot>
                {project.status}
              </Badge>
            </div>
            <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-zinc-400">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenEdit}
              leftIcon={<Edit2 className="h-3.5 w-3.5" />}
            >
              Edit
            </Button>
            <Link
              to={`/projects/${project.id}/settings`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-600 hover:text-white"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>Settings</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Delete
            </Button>
          </div>
        </div>
      </header>

      {/* Project Metadata Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <GitBranch className="h-4 w-4 text-indigo-400" />
            <span>Repository</span>
          </div>
          <div className="mt-3 font-mono text-xs sm:text-sm text-zinc-200 truncate">
            {project.repository ?? 'No repository attached'}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            {project.repository ? 'Connected Git tree with AST analysis' : 'Use settings to attach a remote repository'}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <FolderGit2 className="h-4 w-4 text-violet-400" />
            <span>Stack & Runtime</span>
          </div>
          <div className="mt-3 font-mono text-xs sm:text-sm text-zinc-200">
            {project.language}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            Isolated Docker runner environment
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <CheckSquare className="h-4 w-4 text-cyan-400" />
            <span>Tasks Count</span>
          </div>
          <div className="mt-3 font-mono text-xs sm:text-sm text-zinc-200">
            {projectTasks.length} active tasks registered
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            Updated {project.updatedAt}
          </p>
        </div>
      </div>

      {/* Workspaces Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Workspaces & Tools
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {workspaceLinks.map(({ label, detail, href, icon: Icon, badge }) => (
            <Link
              key={href}
              to={`/projects/${project.id}/${href}`}
              className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-all hover:border-indigo-500/50 hover:bg-zinc-900/40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2.5 text-indigo-300 group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded font-mono text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                    {badge}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  {label}
                </h3>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{detail}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs font-medium text-indigo-400 group-hover:text-indigo-300">
                <span>Enter workspace</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Project Tasks Sub-section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">Project Tasks</h2>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-400">
              {projectTasks.length}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateTaskOpen(true)}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Add Task
          </Button>
        </div>

        {projectTasks.length > 0 ? (
          <div className="divide-y divide-zinc-800/80 rounded-xl border border-zinc-800 bg-zinc-950">
            {projectTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-zinc-900/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">{task.taskType}</span>
                    <Badge tone={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'primary' : 'warning'} size="xs" dot>
                      {task.status}
                    </Badge>
                    <span className="font-mono text-[10px] text-zinc-500">[{task.priority}]</span>
                  </div>
                  <h3 className="mt-1 text-xs sm:text-sm font-medium text-zinc-200">{task.title}</h3>
                  {task.description && (
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{task.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/projects/${project.id}/agent`}
                    className="inline-flex items-center gap-1 rounded border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>Run Agent</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/40">
            <CheckSquare className="mx-auto h-6 w-6 text-zinc-600" />
            <p className="mt-2 text-sm text-zinc-300">No tasks defined for this project</p>
            <p className="mt-1 text-xs text-zinc-500">Add a task to guide agent planning and code synthesis.</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-3"
              onClick={() => setIsCreateTaskOpen(true)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Add Project Task
            </Button>
          </div>
        )}
      </section>

      {/* Modal: Edit Project */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Project"
        description="Update project name, description, and repository connection."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Project Name"
            required
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <div>
            <label htmlFor="edit-proj-desc" className="mb-1.5 block text-xs font-medium text-zinc-300">
              Description
            </label>
            <textarea
              id="edit-proj-desc"
              rows={2}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
            />
          </div>
          <Input
            label="Repository URL or Reference"
            value={editRepo}
            onChange={(e) => setEditRepo(e.target.value)}
            placeholder="e.g. kairo/api"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-proj-lang-sel" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Language
              </label>
              <select
                id="edit-proj-lang-sel"
                value={editLang}
                onChange={(e) => setEditLang(e.target.value)}
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
              <label htmlFor="edit-proj-status-sel" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Status
              </label>
              <select
                id="edit-proj-status-sel"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
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

      {/* Modal: Create Task for this Project */}
      <Modal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        title={`Add Task to ${project.name}`}
        description="Specify requirements and priority for this task."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateTaskOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateTask}>
              Create Task
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            required
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="e.g. Write integration test for endpoint"
            error={taskError}
          />
          <div>
            <label htmlFor="proj-task-desc" className="mb-1.5 block text-xs font-medium text-zinc-300">
              Requirements
            </label>
            <textarea
              id="proj-task-desc"
              rows={3}
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Context, expected outputs, constraints..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="proj-task-prio-sel" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Priority
              </label>
              <select
                id="proj-task-prio-sel"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label htmlFor="proj-task-type-sel" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Type
              </label>
              <select
                id="proj-task-type-sel"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
              >
                <option value="feature">Feature</option>
                <option value="bug_fix">Bug Fix</option>
                <option value="refactor">Refactor</option>
                <option value="test">Test Suite</option>
                <option value="documentation">Documentation</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog: Delete Project */}
      {isDeleteOpen && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Project"
          message={`Are you sure you want to delete project "${project.name}"? This action cannot be undone.`}
          confirmLabel="Delete Project"
        />
      )}
    </div>
  )
}
