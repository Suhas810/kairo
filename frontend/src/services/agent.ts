import { api, ApiError } from './api'
import type { AgentActivityEvent, AgentTask, AgentTaskResponse, AgentTaskStatus, AgentTaskSubmissionInput } from '../types/agent'

const mockActivity: AgentActivityEvent[] = [
  {
    id: 'event-1',
    type: 'status',
    stage: 'planning',
    message: 'Reviewing repository context and task constraints.',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'event-2',
    type: 'message',
    stage: 'coding',
    message: 'Drafting implementation plan and candidate changes.',
    timestamp: new Date().toISOString(),
  },
]

const mockTasks: AgentTask[] = [
  {
    id: 'task-demo',
    projectId: 'kairo-demo',
    title: 'Sprint health review',
    description: 'Review the demo project and summarize the next engineering steps.',
    status: 'completed',
    progress: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    result: 'Completed: simulated task summary generated.',
    activity: mockActivity,
  },
]

let taskStore: AgentTask[] = [...mockTasks]

export async function submitAgentTask(input: AgentTaskSubmissionInput): Promise<AgentTaskResponse> {
  if (!input.projectId || !input.title.trim()) {
    throw new ApiError('A project id and task title are required.', 400)
  }

  try {
    const taskText = input.description.trim() ? `${input.title.trim()}: ${input.description.trim()}` : input.title.trim()
    const remote = await api.post<any>('/agents/tasks', {
      project_id: input.projectId,
      task: taskText,
    })
    if (remote && remote.task_id) {
      const liveTask: AgentTask = {
        id: String(remote.task_id),
        projectId: input.projectId,
        title: input.title.trim(),
        description: input.description.trim() || 'Dispatched task',
        status: 'queued',
        progress: 10,
        createdAt: remote.created_at || new Date().toISOString(),
        updatedAt: remote.created_at || new Date().toISOString(),
        activity: remote.activity || [],
      }
      taskStore = [liveTask, ...taskStore]
      return {
        task: liveTask,
        simulated: false,
      }
    }
  } catch {
    // Fallback in demo or unconfigured mode
  }

  const createdAt = new Date().toISOString()
  const task: AgentTask = {
    id: `task-${Math.random().toString(36).slice(2, 10)}`,
    projectId: input.projectId,
    title: input.title.trim(),
    description: input.description.trim() || 'No additional task details provided.',
    status: 'queued',
    progress: 5,
    createdAt,
    updatedAt: createdAt,
    activity: [
      {
        id: `event-${Math.random().toString(36).slice(2, 8)}`,
        type: 'status',
        stage: 'planning',
        message: 'Task queued for simulated processing.',
        timestamp: createdAt,
      },
    ],
  }

  taskStore = [task, ...taskStore]

  return {
    task,
    simulated: true,
  }
}

export async function getTaskById(taskId: string): Promise<AgentTask | null> {
  try {
    const remote = await api.get<any>(`/agents/tasks/${taskId}`)
    if (remote) {
      return {
        id: String(remote.task_id || remote.id),
        projectId: remote.project_id,
        title: remote.result_summary || 'Agent Task',
        description: remote.result_summary || '',
        status: remote.status || 'queued',
        progress: remote.progress || 0,
        createdAt: remote.created_at || new Date().toISOString(),
        updatedAt: remote.completed_at || new Date().toISOString(),
        activity: remote.activity || [],
        result: remote.result_summary,
      }
    }
  } catch {
    // Fallback
  }

  const task = taskStore.find((item) => item.id === taskId)
  return task ?? null
}

export async function getTaskStatus(taskId: string): Promise<{ status: AgentTaskStatus; progress: number }> {
  try {
    const remote = await api.get<{ status: AgentTaskStatus; progress: number }>(`/agents/tasks/${taskId}/status`)
    if (remote) return remote
  } catch {
    // Fallback
  }

  const task = await getTaskById(taskId)
  if (!task) {
    throw new ApiError('Task not found.', 404)
  }

  return {
    status: task.status,
    progress: task.progress,
  }
}

export async function getTaskActivity(taskId: string): Promise<AgentActivityEvent[]> {
  try {
    const remote = await api.get<AgentActivityEvent[]>(`/agents/tasks/${taskId}/activity`)
    if (Array.isArray(remote) && remote.length > 0) return remote
  } catch {
    // Fallback
  }

  const task = await getTaskById(taskId)
  if (!task) {
    throw new ApiError('Task not found.', 404)
  }

  return task.activity
}

export async function cancelTask(taskId: string): Promise<AgentTask> {
  try {
    await api.post(`/agents/tasks/${taskId}/cancel`)
  } catch {
    // Fallback
  }

  const task = await getTaskById(taskId)
  if (!task) {
    throw new ApiError('Task not found.', 404)
  }

  const cancelledTask: AgentTask = {
    ...task,
    status: 'cancelled',
    progress: 100,
    updatedAt: new Date().toISOString(),
    activity: [
      ...task.activity,
      {
        id: `event-${Math.random().toString(36).slice(2, 8)}`,
        type: 'error',
        stage: 'failed',
        message: 'The task was cancelled by the user.',
        timestamp: new Date().toISOString(),
      },
    ],
  }

  taskStore = taskStore.map((item) => (item.id === taskId ? cancelledTask : item))
  return cancelledTask
}

export const agentService = {
  submitAgentTask,
  getTaskById,
  getTaskStatus,
  getTaskActivity,
  cancelTask,
}
