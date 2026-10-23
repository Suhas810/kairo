import { useEffect, useRef, useState } from 'react'

export type ExecutionStatus = 'idle' | 'queued' | 'running' | 'passed' | 'failed' | 'cancelled'
export type ExecutionLog = { id: number; time: string; level: 'info' | 'warn' | 'error'; message: string }
export type TestCase = { name: string; status: 'passed' | 'failed' | 'skipped'; duration: string; error?: string }

const passedTests: TestCase[] = [
  { name: 'creates a server with configured port', status: 'passed', duration: '8 ms' },
  { name: 'loads default configuration', status: 'passed', duration: '3 ms' },
  { name: 'rejects empty task input', status: 'passed', duration: '5 ms' },
  { name: 'handles missing repository', status: 'passed', duration: '6 ms' },
]

const failedTests: TestCase[] = [
  ...passedTests.slice(0, 2),
  {
    name: 'rejects expired session token',
    status: 'failed',
    duration: '11 ms',
    error: 'Expected status 401, received 200. This is a deterministic demo fixture.',
  },
  { name: 'handles missing repository', status: 'skipped', duration: '—' },
]

export function useExecution() {
  const [status, setStatus] = useState<ExecutionStatus>('idle')
  const [tests, setTests] = useState<TestCase[]>([])
  const [logs, setLogs] = useState<ExecutionLog[]>([])
  const [output, setOutput] = useState<string[]>([])
  const [duration, setDuration] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  function addLog(level: ExecutionLog['level'], message: string) {
    setLogs((current) => [
      ...current,
      {
        id: Date.now() + current.length,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        level,
        message,
      },
    ])
  }

  function run(outcome: 'pass' | 'fail' = 'pass') {
    if (status === 'queued' || status === 'running') return
    setStatus('queued')
    setTests([])
    setDuration(null)
    setOutput(['$ npm run check', 'Preparing simulated workspace…'])
    setLogs([])
    addLog('info', 'Demo run queued. No local commands will be executed.')
    timer.current = window.setTimeout(() => {
      setStatus('running')
      setOutput((current) => [...current, 'Running simulated checks…'])
      timer.current = window.setTimeout(() => {
        const result = outcome === 'pass' ? passedTests : failedTests
        setTests(result)
        setStatus(outcome === 'pass' ? 'passed' : 'failed')
        setDuration('1.42 s')
        setOutput((current) => [
          ...current,
          'TypeScript check complete',
          outcome === 'pass' ? '4 tests passed' : '2 passed, 1 failed, 1 skipped',
          outcome === 'pass' ? 'Build completed successfully.' : 'Run finished with a failing fixture.',
        ])
        addLog(outcome === 'pass' ? 'info' : 'error', outcome === 'pass' ? 'Simulated checks passed.' : 'A deterministic test fixture failed.')
        timer.current = null
      }, 1100)
    }, 300)
  }

  function stop() {
    if (status !== 'queued' && status !== 'running') return
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
    setStatus('cancelled')
    setOutput((current) => [...current, 'Execution cancelled by user.'])
    addLog('warn', 'Simulated run cancelled.')
  }

  function reset() {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
    setStatus('idle')
    setTests([])
    setLogs([])
    setOutput([])
    setDuration(null)
  }

  return { status, tests, logs, output, duration, run, stop, reset, clearLogs: () => setLogs([]) }
}
