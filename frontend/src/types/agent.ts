export type AgentTaskStatus =
  | 'queued'
  | 'planning'
  | 'researching'
  | 'coding'
  | 'testing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type AgentStage =
  | 'planning'
  | 'research'
  | 'coding'
  | 'testing'
  | 'completed'
  | 'failed'

export interface AgentActivityEvent {
  id: string
  type: 'status' | 'message' | 'tool' | 'error'
  stage: AgentStage
  message: string
  timestamp: string
}

export interface AgentTask {
  id: string
  projectId: string
  title: string
  description: string
  status: AgentTaskStatus
  progress: number
  createdAt: string
  updatedAt: string
  result?: string
  activity: AgentActivityEvent[]
}

export interface AgentTaskSubmissionInput {
  projectId: string
  title: string
  description: string
  prompt?: string
}

export interface AgentTaskResponse {
  task: AgentTask
  simulated: boolean
}
