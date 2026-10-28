import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { TaskContext, type TaskContextValue } from '../contexts/TaskContext'
import { readStoredTasks, taskService } from '../services/tasks'
import type { Task, TaskCreateInput, TaskUpdateInput } from '../types/task'

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => readStoredTasks())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await taskService.listTasks()
      setTasks(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getProjectTasks = useCallback(
    (projectId: string) => tasks.filter((t) => t.projectId === projectId),
    [tasks],
  )

  const handleCreateTask = useCallback(
    async (input: TaskCreateInput) => {
      const created = await taskService.createTask(input)
      setTasks((prev) => [created, ...prev])
      return created
    },
    [],
  )

  const handleUpdateTask = useCallback(
    async (taskId: string, updates: TaskUpdateInput) => {
      const updated = await taskService.updateTask(taskId, updates)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
      return updated
    },
    [],
  )

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      const success = await taskService.deleteTask(taskId)
      if (success) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId))
      }
      return success
    },
    [],
  )

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      isLoading,
      error,
      refreshTasks,
      getProjectTasks,
      createTask: handleCreateTask,
      updateTask: handleUpdateTask,
      deleteTask: handleDeleteTask,
    }),
    [tasks, isLoading, error, refreshTasks, getProjectTasks, handleCreateTask, handleUpdateTask, handleDeleteTask],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
