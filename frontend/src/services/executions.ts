import { ApiError } from './api'
import type { Execution, ExecutionRequest, ExecutionResponse, ExecutionStatus, TestCaseResult } from '../types/execution'

const initialExecutions: Execution[] = [
  {
    id: 'exec-1',
    projectId: 'kairo-api',
    title: 'Automated test suite & AST verification',
    status: 'passed',
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    finishedAt: new Date(Date.now() - 43 * 60 * 1000).toISOString(),
    durationMs: 120000,
    logs: [
      { id: 'l1', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), level: 'info', message: 'Spawning isolated runner container...' },
      { id: 'l2', timestamp: new Date(Date.now() - 44 * 60 * 1000).toISOString(), level: 'info', message: 'Mounted repository snapshot read-only' },
      { id: 'l3', timestamp: new Date(Date.now() - 43 * 60 * 1000).toISOString(), level: 'info', message: 'All 14 tests completed successfully with exit code 0' },
    ],
    output: [
      '$ pytest tests/ -v',
      'test_orchestrator.py::test_workflow_dispatch PASSED [ 25%]',
      'test_planner.py::test_plan_decomposition PASSED [ 50%]',
      'test_researcher.py::test_symbol_indexer PASSED [ 75%]',
      'test_sandbox.py::test_container_isolation PASSED [100%]',
      '======================== 4 passed in 2.14s =========================',
    ],
    testResults: [
      { name: 'test_workflow_dispatch', status: 'passed', duration: '14 ms' },
      { name: 'test_plan_decomposition', status: 'passed', duration: '18 ms' },
      { name: 'test_symbol_indexer', status: 'passed', duration: '22 ms' },
      { name: 'test_container_isolation', status: 'passed', duration: '45 ms' },
    ],
  },
  {
    id: 'exec-2',
    projectId: 'dashboard-ui',
    title: 'TypeScript compilation and linter audit',
    status: 'passed',
    startedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    finishedAt: new Date(Date.now() - 2 * 3600 * 1000 + 40000).toISOString(),
    durationMs: 40000,
    logs: [
      { id: 'l4', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), level: 'info', message: 'Checking types with tsc -b...' },
      { id: 'l5', timestamp: new Date(Date.now() - 2 * 3600 * 1000 + 20000).toISOString(), level: 'info', message: 'Running oxlint on 84 files...' },
      { id: 'l6', timestamp: new Date(Date.now() - 2 * 3600 * 1000 + 40000).toISOString(), level: 'info', message: '0 errors, 0 warnings found.' },
    ],
    output: [
      '$ npm run build',
      '✓ 1969 modules transformed.',
      '✓ built in 4.12s',
      '$ npm run lint',
      'Found 0 warnings and 0 errors.',
    ],
    testResults: [
      { name: 'typecheck core types', status: 'passed', duration: '8 ms' },
      { name: 'validate routing configuration', status: 'passed', duration: '11 ms' },
    ],
  },
]

const executionStore = new Map<string, Execution>()
initialExecutions.forEach((exec) => executionStore.set(exec.id, exec))

const initialTestResults: TestCaseResult[] = [
  { name: 'runs project bootstrap', status: 'passed', duration: '8 ms' },
  { name: 'handles missing repository metadata', status: 'passed', duration: '12 ms' },
  { name: 'rejects invalid task input', status: 'failed', duration: '7 ms', error: 'Expected validation error' },
]

export async function listExecutions(projectId?: string): Promise<Execution[]> {
  const all = Array.from(executionStore.values())
  if (projectId) {
    return all.filter((e) => e.projectId === projectId)
  }
  return all
}

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
    logs: [{ id: `log-${Date.now()}`, timestamp: startedAt, level: 'info', message: 'Execution queued for simulated processing.' }],
    output: ['$ npm run check', 'Preparing isolated runner sandbox…'],
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
  listExecutions,
  startExecution,
  getExecutionById,
  getExecutionStatus,
  getExecutionLogs,
  getExecutionTestResults,
  cancelExecution,
}
