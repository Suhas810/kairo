export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TaskType = 'bug_fix' | 'feature' | 'refactor' | 'documentation' | 'test' | 'other'

export interface Task {
  id: string
  projectId: string
  userId?: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  taskType: TaskType
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown>
}

export interface TaskCreateInput {
  projectId: string
  title: string
  description?: string
  priority?: TaskPriority
  taskType?: TaskType
}

export interface TaskUpdateInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  taskType?: TaskType
}
