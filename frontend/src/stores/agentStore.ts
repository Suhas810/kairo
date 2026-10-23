import { create } from 'zustand'
import { cancelTask, getTaskActivity, getTaskById, getTaskStatus, submitAgentTask } from '../services/agent'
import type { AgentActivityEvent, AgentTask, AgentTaskSubmissionInput } from '../types/agent'

interface AgentStoreState {
  tasks: AgentTask[]
  selectedTaskId: string | null
  isLoading: boolean
  error: string | null
  submitTask: (input: AgentTaskSubmissionInput) => Promise<AgentTask>
  refreshTask: (taskId: string) => Promise<void>
  loadTaskActivity: (taskId: string) => Promise<AgentActivityEvent[]>
  cancelTaskById: (taskId: string) => Promise<AgentTask>
  selectTask: (taskId: string) => void
}

export const useAgentStore = create<AgentStoreState>()((set) => ({
  tasks: [],
  selectedTaskId: null,
  isLoading: false,
  error: null,

  async submitTask(input) {
    set({ isLoading: true, error: null })

    try {
      const response = await submitAgentTask(input)
      set((state) => ({
        tasks: [response.task, ...state.tasks],
        selectedTaskId: response.task.id,
        isLoading: false,
      }))
      return response.task
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unable to submit the task.',
      })
      throw error
    }
  },

  async refreshTask(taskId) {
    const task = await getTaskById(taskId)
    if (!task) {
      set({ error: 'Task not found.' })
      return
    }

    const status = await getTaskStatus(taskId)
    const activity = await getTaskActivity(taskId)
    set((state) => ({
      tasks: state.tasks.map((item) => (item.id === taskId ? { ...item, status: status.status, progress: status.progress, activity } : item)),
      error: null,
    }))
  },

  async loadTaskActivity(taskId) {
    const activity = await getTaskActivity(taskId)
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, activity } : task)),
    }))
    return activity
  },

  async cancelTaskById(taskId) {
    const task = await cancelTask(taskId)
    set((state) => ({
      tasks: state.tasks.map((item) => (item.id === taskId ? task : item)),
      selectedTaskId: state.selectedTaskId === taskId ? taskId : state.selectedTaskId,
    }))
    return task
  },

  selectTask(taskId) {
    set({ selectedTaskId: taskId })
  },
}))
