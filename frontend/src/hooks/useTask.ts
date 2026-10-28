import { useContext } from 'react'
import { TaskContext, type TaskContextValue } from '../contexts/TaskContext'

export function useTask(): TaskContextValue {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider')
  }
  return context
}
