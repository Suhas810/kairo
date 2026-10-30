import { api, ApiError } from './api'
import type { Task, TaskCreateInput, TaskUpdateInput } from '../types/task'

const TASKS_STORAGE_KEY = 'kairo-workspace-tasks'

const initialTasks: Task[] = [
  {
    id: 'task-1',
    projectId: 'kairo-api',
    title: 'Implement repository AST analyzer for Python & TS',
    description: 'Extract function signatures, exported types, and import trees to build context graphs for agents.',
    status: 'completed',
    priority: 'high',
    taskType: 'feature',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'task-2',
    projectId: 'kairo-api',
    title: 'Fix edge case in Docker container timeout handling',
    description: 'Ensure child runner processes are forcefully reaped when memory limits or CPU execution boundaries trigger.',
    status: 'in_progress',
    priority: 'urgent',
    taskType: 'bug_fix',
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'task-3',
    projectId: 'dashboard-ui',
    title: 'Add interactive Diff Viewer with syntax highlighting',
    description: 'Render unified git diffs with additions and deletions side-by-side inside the agent review stage.',
    status: 'pending',
    priority: 'normal',
    taskType: 'feature',
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: 'task-4',
    projectId: 'auth-service',
    title: 'Audit session token expiration with refresh rotation',
    description: 'Verify that invalid refresh tokens cause active sessions to terminate immediately.',
    status: 'pending',
    priority: 'normal',
    taskType: 'test',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
]

export function readStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY)
    if (!raw) return initialTasks
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialTasks
  } catch {
    return initialTasks
  }
}

function writeStoredTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error('Failed to store tasks in localStorage', error)
  }
}

let tasksCache: Task[] = readStoredTasks()

export async function listTasks(projectId?: string): Promise<Task[]> {
  try {
    const remote = await api.get<Task[]>('/tasks', {
      params: projectId ? { project_id: projectId } : undefined,
    })
    if (Array.isArray(remote) && remote.length > 0) {
      tasksCache = remote
      writeStoredTasks(remote)
      return remote
    }
  } catch {
    // Fallback to storage cache
  }

  tasksCache = readStoredTasks()
  if (projectId) {
    return tasksCache.filter((task) => task.projectId === projectId)
  }
  return tasksCache
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  try {
    const remote = await api.get<Task>(`/tasks/${taskId}`)
    if (remote) return remote
  } catch {
    // Fallback
  }

  tasksCache = readStoredTasks()
  return tasksCache.find((task) => task.id === taskId) ?? null
}

export async function createTask(input: TaskCreateInput): Promise<Task> {
  if (!input.title || input.title.trim().length === 0) {
    throw new ApiError('Task title is required.', 400)
  }
  if (!input.projectId) {
    throw new ApiError('Project ID is required for task creation.', 400)
  }

  const now = new Date().toISOString()
  const newTask: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    projectId: input.projectId,
    title: input.title.trim(),
    description: input.description?.trim() || '',
    status: 'pending',
    priority: input.priority || 'normal',
    taskType: input.taskType || 'feature',
    createdAt: now,
    updatedAt: now,
  }

  try {
    const remote = await api.post<Task>('/tasks', {
      project_id: input.projectId,
      title: input.title.trim(),
      description: input.description?.trim(),
      priority: input.priority || 'normal',
      task_type: input.taskType || 'feature',
    })
    if (remote && remote.id) {
      tasksCache = [remote, ...readStoredTasks()]
      writeStoredTasks(tasksCache)
      return remote
    }
  } catch {
    // Fallback to local storage
  }

  tasksCache = [newTask, ...readStoredTasks()]
  writeStoredTasks(tasksCache)
  return newTask
}

export async function updateTask(taskId: string, updates: TaskUpdateInput): Promise<Task> {
  try {
    const remote = await api.patch<Task>(`/tasks/${taskId}`, {
      title: updates.title,
      description: updates.description,
      status: updates.status,
      priority: updates.priority,
      task_type: updates.taskType,
    })
    if (remote) {
      tasksCache = readStoredTasks().map((t) => (t.id === taskId ? remote : t))
      writeStoredTasks(tasksCache)
      return remote
    }
  } catch {
    // Fallback
  }

  tasksCache = readStoredTasks()
  const index = tasksCache.findIndex((t) => t.id === taskId)
  if (index === -1) {
    throw new ApiError('Task not found.', 404)
  }

  const existing = tasksCache[index]
  const updatedTask: Task = {
    ...existing,
    ...updates,
    title: updates.title !== undefined ? updates.title.trim() : existing.title,
    description: updates.description !== undefined ? updates.description.trim() : existing.description,
    status: updates.status || existing.status,
    priority: updates.priority || existing.priority,
    taskType: updates.taskType || existing.taskType,
    updatedAt: new Date().toISOString(),
  }

  tasksCache[index] = updatedTask
  writeStoredTasks(tasksCache)
  return updatedTask
}

export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    await api.del(`/tasks/${taskId}`)
  } catch {
    // Fallback
  }

  tasksCache = readStoredTasks()
  const filtered = tasksCache.filter((t) => t.id !== taskId)
  if (filtered.length === tasksCache.length) {
    throw new ApiError('Task not found.', 404)
  }
  tasksCache = filtered
  writeStoredTasks(tasksCache)
  return true
}

export const taskService = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
}
