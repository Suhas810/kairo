import { create } from 'zustand'
import { cancelExecution, getExecutionById, getExecutionLogs, getExecutionStatus, getExecutionTestResults, startExecution } from '../services/executions'
import type { Execution, ExecutionRequest } from '../types/execution'

interface ExecutionStoreState {
  executions: Execution[]
  selectedExecutionId: string | null
  isLoading: boolean
  error: string | null
  startExecution: (request: ExecutionRequest) => Promise<Execution>
  refreshExecution: (executionId: string) => Promise<void>
  cancelExecutionById: (executionId: string) => Promise<Execution>
  selectExecution: (executionId: string) => void
}

export const useExecutionStore = create<ExecutionStoreState>()((set, get) => ({
  executions: [],
  selectedExecutionId: null,
  isLoading: false,
  error: null,

  async startExecution(request) {
    set({ isLoading: true, error: null })

    try {
      const response = await startExecution(request)
      set((state) => ({
        executions: [response.execution, ...state.executions],
        selectedExecutionId: response.execution.id,
        isLoading: false,
      }))
      return response.execution
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unable to start the execution.',
      })
      throw error
    }
  },

  async refreshExecution(executionId) {
    const execution = await getExecutionById(executionId)
    if (!execution) {
      set({ error: 'Execution not found.' })
      return
    }

    const status = await getExecutionStatus(executionId)
    const logs = await getExecutionLogs(executionId)
    const testResults = await getExecutionTestResults(executionId)

    set((state) => ({
      executions: state.executions.map((item) =>
        item.id === executionId
          ? { ...item, status: status.status, logs, testResults }
          : item,
      ),
      error: null,
    }))
  },

  async cancelExecutionById(executionId) {
    const execution = await cancelExecution(executionId)
    set((state) => ({
      executions: state.executions.map((item) => (item.id === executionId ? execution : item)),
      selectedExecutionId: get().selectedExecutionId === executionId ? executionId : get().selectedExecutionId,
    }))
    return execution
  },

  selectExecution(executionId) {
    set({ selectedExecutionId: executionId })
  },
}))
