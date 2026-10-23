import { ApiError } from './api'
import type { Execution, ExecutionRequest, ExecutionResponse, ExecutionStatus, TestCaseResult } from '../types/execution'

const executionStore = new Map<string, Execution>()

const initialTestResults: TestCaseResult[] = [
  { name: 'runs project bootstrap', status: 'passed', duration: '8 ms' },
  { name: 'handles missing repository metadata', status: 'passed', duration: '12 ms' },
  { name: 'rejects invalid task input', status: 'failed', duration: '7 ms', error: 'Expected validation error' },
]

export async function startExecution(request: ExecutionRequest): Promise<ExecutionResponse> {
  if (!request.projectId || !request.title.trim()) {
    throw new ApiError('Project id and execution title are required.', 400)
  }

  const startedAt = new Date().toISOString()
  const execution: Execution = {
    id: `exec-${Math.random().toString(36).slice(2, 10)}`,
    projectId: request.projectId,
    title: request.title.trim(),
    status: 'queued',
    startedAt,
    logs: [{ id: 'log-1', timestamp: startedAt, level: 'info', message: 'Execution queued for simulated processing.' }],
    output: ['$ npm run check', 'Preparing simulated workspace…'],
    testResults: [],
  }

  executionStore.set(execution.id, execution)

  return {
    execution,
    simulated: true,
  }
}

export async function getExecutionById(executionId: string): Promise<Execution | null> {
  return executionStore.get(executionId) ?? null
}

export async function getExecutionStatus(executionId: string): Promise<{ status: ExecutionStatus; progress: number }> {
  const execution = executionStore.get(executionId)
  if (!execution) {
    throw new ApiError('Execution not found.', 404)
  }

  return {
    status: execution.status,
    progress: execution.status === 'queued' ? 15 : execution.status === 'running' ? 65 : 100,
  }
}

export async function getExecutionLogs(executionId: string): Promise<Execution['logs']> {
  const execution = executionStore.get(executionId)
  if (!execution) {
    throw new ApiError('Execution not found.', 404)
  }

  return execution.logs
}

export async function getExecutionTestResults(executionId: string): Promise<Execution['testResults']> {
  const execution = executionStore.get(executionId)
  if (!execution) {
    throw new ApiError('Execution not found.', 404)
  }

  return execution.testResults.length > 0 ? execution.testResults : initialTestResults
}

export async function cancelExecution(executionId: string): Promise<Execution> {
  const execution = executionStore.get(executionId)
  if (!execution) {
    throw new ApiError('Execution not found.', 404)
  }

  const cancelled: Execution = {
    ...execution,
    status: 'cancelled',
    finishedAt: new Date().toISOString(),
    logs: [
      ...execution.logs,
      { id: `log-${Math.random().toString(36).slice(2, 9)}`, timestamp: new Date().toISOString(), level: 'warn', message: 'Execution cancelled by the user.' },
    ],
    output: [...execution.output, 'Execution cancelled by user.'],
  }

  executionStore.set(executionId, cancelled)
  return cancelled
}

export const executionService = {
  startExecution,
  getExecutionById,
  getExecutionStatus,
  getExecutionLogs,
  getExecutionTestResults,
  cancelExecution,
}
