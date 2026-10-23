import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AgentContext, type AgentContextValue, type AgentStage, type AgentEvent } from '../contexts/AgentContext'

const sequence: Array<{ stage: AgentStage; message: string }> = [
  { stage: 'planning', message: 'Breaking the request into focused steps.' },
  { stage: 'research', message: 'Reviewing the sample repository context.' },
  { stage: 'coding', message: 'Preparing a proposed change (simulation only).' },
  { stage: 'testing', message: 'Checking the expected behavior with demo results.' },
  { stage: 'complete', message: 'Demo task complete. No files were changed.' },
]

export function AgentProvider({ children }: { children: ReactNode }) {
  const [task, setTask] = useState('')
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle')
  const [stage, setStage] = useState<AgentStage | null>(null)
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  const value = useMemo<AgentContextValue>(() => ({
    task,
    status,
    stage,
    events,
    error,
    submitTask(nextTask) {
      const cleaned = nextTask.trim()
      if (!cleaned) {
        setError('Enter a task before starting the demo.')
        return false
      }
      if (status === 'running') {
        setError('A demo task is already running.')
        return false
      }
      setTask(cleaned)
      setError(null)
      setStatus('running')
      setStage('planning')
      setEvents([])
      timers.current.forEach((timer) => window.clearTimeout(timer))
      timers.current = []
      sequence.forEach((item, index) => {
        const timer = window.setTimeout(() => {
          setStage(item.stage)
          setEvents((current) => [...current, {
            ...item,
            id: Date.now() + index,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }])
          if (item.stage === 'complete') setStatus('completed')
        }, (index + 1) * 700)
        timers.current.push(timer)
      })
      return true
    },
  }), [error, events, stage, status, task])

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}
