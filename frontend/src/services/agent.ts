import { ApiError } from './api'
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
  const task = taskStore.find((item) => item.id === taskId)
  return task ?? null
}

export async function getTaskStatus(taskId: string): Promise<{ status: AgentTaskStatus; progress: number }> {
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
  const task = await getTaskById(taskId)
  if (!task) {
    throw new ApiError('Task not found.', 404)
  }

  return task.activity
}

export async function cancelTask(taskId: string): Promise<AgentTask> {
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
        message: 'The task was cancelled by the user during the simulated run.',
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
