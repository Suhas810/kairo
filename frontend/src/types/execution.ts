export type ExecutionStatus = 'queued' | 'running' | 'passed' | 'failed' | 'cancelled'
export type ExecutionLogLevel = 'info' | 'warn' | 'error'

export interface ExecutionLog {
  id: string
  timestamp: string
  level: ExecutionLogLevel
  message: string
}

export interface BuildOutputEntry {
  id: string
  kind: 'info' | 'warning' | 'error'
  message: string
}

export interface TestCaseResult {
  name: string
  status: 'passed' | 'failed' | 'skipped'
  duration: string
  error?: string
}

export interface Execution {
  id: string
  projectId: string
  title: string
  status: ExecutionStatus
  startedAt: string
  finishedAt?: string
  durationMs?: number
  logs: ExecutionLog[]
  output: string[]
  testResults: TestCaseResult[]
  error?: string
}

export interface ExecutionRequest {
  projectId: string
  title: string
  command?: string
  environment?: Record<string, string>
}

export interface ExecutionResponse {
  execution: Execution
  simulated: boolean
}
