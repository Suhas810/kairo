import { createContext } from 'react'

export type AgentStage = 'planning' | 'research' | 'coding' | 'testing' | 'complete'
export type AgentTaskStatus = 'idle' | 'running' | 'completed' | 'failed'
export type AgentEvent = { id: number; stage: AgentStage; message: string; time: string }

export type AgentContextValue = {
  task: string
  status: AgentTaskStatus
  stage: AgentStage | null
  events: AgentEvent[]
  error: string | null
  submitTask: (task: string) => boolean
}

export const AgentContext = createContext<AgentContextValue | null>(null)
