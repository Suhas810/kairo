import { createContext } from 'react'
import type { Task, TaskCreateInput, TaskUpdateInput } from '../types/task'

export interface TaskContextValue {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  refreshTasks: () => Promise<void>
  getProjectTasks: (projectId: string) => Task[]
  createTask: (input: TaskCreateInput) => Promise<Task>
  updateTask: (taskId: string, updates: TaskUpdateInput) => Promise<Task>
  deleteTask: (taskId: string) => Promise<boolean>
}

export const TaskContext = createContext<TaskContextValue | null>(null)
