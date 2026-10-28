import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckSquare,
  FolderGit2,
  Plus,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ActivityFeed } from '../components/dashboard/ActivityFeed'
import { DashboardStats } from '../components/dashboard/DashboardStats'
import { RecentTasks } from '../components/dashboard/RecentTasks'
import { useProject } from '../hooks/useProject'
import { useTask } from '../hooks/useTask'
import { useToast } from '../hooks/useToast'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import type { TaskPriority, TaskType } from '../types/task'

export function Dashboard() {
  const { projects, createProject } = useProject()
  const { createTask } = useTask()
  const toast = useToast()
  const navigate = useNavigate()

  // Project modal state
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [projName, setProjName] = useState('')
  const [projDesc, setProjDesc] = useState('')
  const [projRepo, setProjRepo] = useState('')
  const [projLang, setProjLang] = useState('TypeScript')
  const [projError, setProjError] = useState('')

  // Task modal state
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskProject, setTaskProject] = useState(projects[0]?.id || '')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('normal')
  const [taskType, setTaskType] = useState<TaskType>('feature')
  const [taskError, setTaskError] = useState('')

  function handleCreateProject(e: FormEvent) {
    e.preventDefault()
    if (projName.trim().length < 3) {
      setProjError('Project name must be at least 3 characters.')
      return
    }

    const created = createProject(projName, projDesc, projRepo || null, projLang)
    toast.success(`Project "${created.name}" created successfully.`)
    setShowCreateProject(false)
    setProjName('')
    setProjDesc('')
    setProjRepo('')
    setProjError('')
    navigate(`/projects/${created.id}`)
  }

  async function handleCreateTask(e: FormEvent) {
    e.preventDefault()
    if (!taskTitle.trim()) {
      setTaskError('Task title is required.')
      return
    }
    const targetProjId = taskProject || projects[0]?.id
    if (!targetProjId) {
      setTaskError('Please select a project for this task.')
      return
    }

    try {
      const created = await createTask({
        projectId: targetProjId,
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        taskType: taskType,
      })
      toast.success(`Task "${created.title}" added to backlog.`)
      setShowCreateTask(false)
      setTaskTitle('')
      setTaskDesc('')
      setTaskError('')
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Unable to create task.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-mono">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-indigo-400">Main Console</span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Real-time overview of projects, active tasks, code repositories, and sandbox executions.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateTask(true)}
            leftIcon={<CheckSquare className="h-3.5 w-3.5 text-indigo-400" />}
          >
            New Task
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateProject(true)}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            New Project
          </Button>
        </div>
      </header>

      {/* Primary KPI Stats */}
      <DashboardStats />

      {/* Projects Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Projects</h2>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-400">
              {projects.length}
            </span>
          </div>
          <Link
            to="/projects"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            <span>View all projects</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
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
                          {project.repository ?? 'No repository attached'}
                        </p>
                      </div>
                    </div>
                    <Badge
                      tone={
                        project.status === 'Healthy'
                          ? 'success'
                          : project.status === 'Reviewing'
                            ? 'warning'
                            : 'primary'
                      }
                      size="xs"
                      dot
                    >
                      {project.status}
                    </Badge>
                  </div>

                  <p className="mt-3.5 text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-zinc-400">{project.language}</span>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/projects/${project.id}/agent`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                      title="Launch AI Agent"
                    >
                      <Bot className="h-3.5 w-3.5" /> Agent
                    </Link>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/40">
            <BriefcaseBusiness className="mx-auto h-8 w-8 text-zinc-600" />
            <h3 className="mt-3 text-sm font-semibold text-zinc-200">No projects in workspace</h3>
            <p className="mt-1 text-xs text-zinc-500">Create your first project to start running coding agents.</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => setShowCreateProject(true)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Create Project
            </Button>
          </div>
        )}
      </section>

      {/* Recent Tasks and Activity Stream */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTasks onOpenCreateTask={() => setShowCreateTask(true)} />
        <ActivityFeed />
      </div>

      {/* Modal: Create Project */}
      <Modal
        isOpen={showCreateProject}
        onClose={() => {
          setShowCreateProject(false)
          setProjError('')
        }}
        title="Create New Project"
        description="Initialize a new project workspace for tasks and automated coding agents."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCreateProject(false)
                setProjError('')
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateProject}>
              Create Project
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            required
            value={projName}
            onChange={(e) => setProjName(e.target.value)}
            placeholder="e.g. Auth Service"
            error={projError}
          />
          <div>
            <label htmlFor="proj-desc" className="mb-1.5 block text-xs font-medium text-zinc-300">
              Description
            </label>
            <textarea
              id="proj-desc"
              rows={2}
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              placeholder="What does this service or repository do?"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
          </div>
          <Input
            label="Repository URL or Reference (Optional)"
            value={projRepo}
            onChange={(e) => setProjRepo(e.target.value)}
            placeholder="e.g. org/auth-service"
            helperText="Connect a Git repository for code indexing and automated reviews."
          />
          <div>
            <label htmlFor="proj-lang" className="mb-1.5 block text-xs font-medium text-zinc-300">
              Primary Language
            </label>
            <select
              id="proj-lang"
              value={projLang}
              onChange={(e) => setProjLang(e.target.value)}
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
        </form>
      </Modal>

      {/* Modal: Create Task */}
      <Modal
        isOpen={showCreateTask}
        onClose={() => {
          setShowCreateTask(false)
          setTaskError('')
        }}
        title="Create New Task"
        description="Add a task specification to your project backlog for AI agent execution."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCreateTask(false)
                setTaskError('')
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateTask}>
              Create Task
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label htmlFor="task-proj-sel" className="mb-1.5 block text-xs font-medium text-zinc-300">
              Project <span className="text-red-400">*</span>
            </label>
            <select
              id="task-proj-sel"
              value={taskProject}
              onChange={(e) => setTaskProject(e.target.value)}
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
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="e.g. Implement refresh token rotation"
            error={taskError}
          />
          <div>
            <label htmlFor="task-desc" className="mb-1.5 block text-xs font-medium text-zinc-300">
              Task Requirements & Details
            </label>
            <textarea
              id="task-desc"
              rows={3}
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Describe expected behavior, constraints, and testing steps..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-prio-sel" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Priority
              </label>
              <select
                id="task-prio-sel"
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
              <label htmlFor="task-type-sel" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Type
              </label>
              <select
                id="task-type-sel"
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
    </div>
  )
}
