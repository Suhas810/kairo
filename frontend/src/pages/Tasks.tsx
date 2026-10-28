import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot,
  CheckSquare,
  Edit2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useTask } from '../hooks/useTask'
import { useProject } from '../hooks/useProject'
import { useToast } from '../hooks/useToast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Badge, type BadgeTone } from '../components/ui/Badge'
import type { Task, TaskPriority, TaskStatus, TaskType } from '../types/task'

const statusToneMap: Record<TaskStatus, BadgeTone> = {
  pending: 'warning',
  in_progress: 'primary',
  completed: 'success',
  failed: 'error',
  cancelled: 'default',
}

const priorityToneMap: Record<TaskPriority, BadgeTone> = {
  low: 'default',
  normal: 'cyan',
  high: 'warning',
  urgent: 'error',
}

export function Tasks() {
  const { tasks, createTask, updateTask, deleteTask } = useTask()
  const { projects } = useProject()
  const toast = useToast()

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<string>('all')

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [inspectingTask, setInspectingTask] = useState<Task | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState(projects[0]?.id || '')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [taskType, setTaskType] = useState<TaskType>('feature')
  const [status, setStatus] = useState<TaskStatus>('pending')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority
      const matchesProject = selectedProject === 'all' || task.projectId === selectedProject
      return matchesSearch && matchesStatus && matchesPriority && matchesProject
    })
  }, [tasks, searchQuery, selectedStatus, selectedPriority, selectedProject])

  function handleOpenCreate() {
    setTitle('')
    setDescription('')
    setProjectId(projects[0]?.id || '')
    setPriority('normal')
    setTaskType('feature')
    setStatus('pending')
    setFormError('')
    setIsCreateOpen(true)
  }

  function handleOpenEdit(task: Task) {
    setEditingTask(task)
    setTitle(task.title)
    setDescription(task.description || '')
    setProjectId(task.projectId)
    setPriority(task.priority)
    setTaskType(task.taskType)
    setStatus(task.status)
    setFormError('')
  }

  async function handleSaveCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setFormError('Task title is required.')
      return
    }
    if (!projectId) {
      setFormError('Please select a project.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await createTask({
        projectId,
        title,
        description,
        priority,
        taskType,
      })
      toast.success(`Task "${created.title}" created.`)
      setIsCreateOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingTask) return
    if (!title.trim()) {
      setFormError('Task title is required.')
      return
    }

    setIsSubmitting(true)
    try {
      const updated = await updateTask(editingTask.id, {
        title,
        description,
        priority,
        taskType,
        status,
      })
      toast.success(`Task "${updated.title}" updated.`)
      setEditingTask(null)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleQuickStatusChange(task: Task, nextStatus: TaskStatus) {
    try {
      await updateTask(task.id, { status: nextStatus })
      toast.success(`Task moved to ${nextStatus.replace('_', ' ')}.`)
    } catch {
      toast.error('Unable to change status.')
    }
  }

  async function handleConfirmDelete() {
    if (!deletingTask) return
    setIsSubmitting(true)
    try {
      await deleteTask(deletingTask.id)
      toast.success(`Task "${deletingTask.title}" deleted.`)
      setDeletingTask(null)
    } catch {
      toast.error('Failed to delete task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-mono">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-indigo-400">Backlog</span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-white">Tasks</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Create, manage, and dispatch coding agent assignments across your repositories.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Create Task
        </Button>
      </header>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title or requirements..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-8 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-300 outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-300 outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>

          {/* Project filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-300 outline-none focus:border-indigo-500 max-w-[160px] truncate"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List Table / Grid */}
      {filteredTasks.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm">
          <div className="divide-y divide-zinc-800/80">
            {filteredTasks.map((task) => {
              const project = projects.find((p) => p.id === task.projectId)
              return (
                <div
                  key={task.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-zinc-500 uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        {task.taskType}
                      </span>
                      <Badge tone={statusToneMap[task.status] || 'default'} size="xs" dot>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge tone={priorityToneMap[task.priority] || 'default'} size="xs">
                        {task.priority}
                      </Badge>
                      {project && (
                        <Link
                          to={`/projects/${project.id}`}
                          className="font-mono text-[11px] text-indigo-400 hover:underline"
                        >
                          {project.name}
                        </Link>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectingTask(task)}
                      className="text-left font-medium text-sm text-zinc-100 hover:text-indigo-300 transition-colors block"
                    >
                      {task.title}
                    </button>

                    {task.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-850">
                    {/* Status quick select */}
                    <select
                      value={task.status}
                      onChange={(e) => handleQuickStatusChange(task, e.target.value as TaskStatus)}
                      className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 outline-none hover:border-zinc-700"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Launch in Agent */}
                    <Link
                      to={`/projects/${task.projectId}/agent`}
                      className="inline-flex items-center gap-1 rounded border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                      title="Run with Agent"
                    >
                      <Bot className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Run Agent</span>
                    </Link>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(task)}
                      className="rounded p-1.5 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-100 transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setDeletingTask(task)}
                      className="rounded p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40">
          <CheckSquare className="mx-auto h-8 w-8 text-zinc-600" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-200">No tasks found</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all'
              ? 'No tasks match the active filters. Try clearing search criteria.'
              : 'Add your first task to plan work for autonomous coding agents.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Create Task
          </Button>
        </div>
      )}

      {/* Modal: Create Task */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
        description="Define task requirements, priority, and link to a project."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveCreate}
              isLoading={isSubmitting}
            >
              Create Task
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveCreate} className="space-y-4">
          <div>
            <label htmlFor="create-task-project" className="mb-1.5 block text-xs font-medium text-zinc-300">
              Project <span className="text-red-400">*</span>
            </label>
            <select
              id="create-task-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Task Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement repository AST analyzer"
            error={formError}
          />

          <div>
            <label htmlFor="create-task-desc" className="mb-1.5 block text-xs font-medium text-zinc-300">
              Requirements & Details
            </label>
            <textarea
              id="create-task-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, expected API output, or reproduction steps..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="create-task-priority" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Priority
              </label>
              <select
                id="create-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label htmlFor="create-task-type" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Type
              </label>
              <select
                id="create-task-type"
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

      {/* Modal: Edit Task */}
      {editingTask && (
        <Modal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          title="Edit Task"
          description={`Update details for ${editingTask.title}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setEditingTask(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Task Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={formError}
            />

            <div>
              <label htmlFor="edit-task-desc" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Requirements & Details
              </label>
              <textarea
                id="edit-task-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="edit-task-status" className="mb-1.5 block text-xs font-medium text-zinc-300">
                  Status
                </label>
                <select
                  id="edit-task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit-task-priority" className="mb-1.5 block text-xs font-medium text-zinc-300">
                  Priority
                </label>
                <select
                  id="edit-task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit-task-type" className="mb-1.5 block text-xs font-medium text-zinc-300">
                  Type
                </label>
                <select
                  id="edit-task-type"
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
      )}

      {/* Modal: Inspect Task Details */}
      {inspectingTask && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingTask(null)}
          title={
            <div className="flex items-center gap-2">
              <span className="font-semibold">{inspectingTask.title}</span>
            </div>
          }
          description={`Created ${new Date(inspectingTask.createdAt).toLocaleString()}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setInspectingTask(null)}>
                Close
              </Button>
              <Link
                to={`/projects/${inspectingTask.projectId}/agent`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
              >
                <Bot className="h-4 w-4" />
                <span>Launch in Agent Workspace</span>
              </Link>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone={statusToneMap[inspectingTask.status] || 'default'} dot>
                Status: {inspectingTask.status.replace('_', ' ')}
              </Badge>
              <Badge tone={priorityToneMap[inspectingTask.priority] || 'default'}>
                Priority: {inspectingTask.priority}
              </Badge>
              <Badge tone="default">Type: {inspectingTask.taskType}</Badge>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Requirements & Description
              </h4>
              <p className="mt-1.5 text-sm text-zinc-200 leading-relaxed bg-zinc-900/70 p-3 rounded-lg border border-zinc-800/80 whitespace-pre-wrap">
                {inspectingTask.description || 'No detailed description provided.'}
              </p>
            </div>

            <div className="text-xs text-zinc-500 flex justify-between border-t border-zinc-800/80 pt-3">
              <span>Task ID: {inspectingTask.id}</span>
              <span>Updated: {new Date(inspectingTask.updatedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog: Delete Task */}
      {deletingTask && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingTask(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Task"
          message={`Are you sure you want to delete task "${deletingTask.title}"? This action cannot be undone.`}
          confirmLabel="Delete Task"
          isLoading={isSubmitting}
        />
      )}
    </div>
  )
}
