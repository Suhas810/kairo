import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import { executionService } from '../services/executions'
import { useProject } from '../hooks/useProject'
import { useToast } from '../hooks/useToast'
import { Badge, type BadgeTone } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import type { Execution, ExecutionStatus } from '../types/execution'

const statusToneMap: Record<ExecutionStatus, BadgeTone> = {
  passed: 'success',
  running: 'primary',
  queued: 'warning',
  failed: 'error',
  cancelled: 'default',
}

export function Executions() {
  const { projects } = useProject()
  const toast = useToast()
  const [executions, setExecutions] = useState<Execution[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [inspectingExecution, setInspectingExecution] = useState<Execution | null>(null)

  useEffect(() => {
    let isMounted = true
    void executionService
      .listExecutions()
      .then((data) => {
        if (isMounted) setExecutions(data)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredExecutions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return executions.filter((exec) => {
      const matchesSearch =
        exec.title.toLowerCase().includes(q) || exec.id.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || exec.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [executions, searchQuery, statusFilter])

  async function handleRerun(exec: Execution) {
    try {
      const response = await executionService.startExecution({
        projectId: exec.projectId,
        title: `Re-run: ${exec.title}`,
      })
      setExecutions((prev) => [response.execution, ...prev])
      toast.success(`Execution "${response.execution.title}" queued in sandbox.`)
    } catch {
      toast.error('Unable to queue execution.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-mono">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-indigo-400">Sandbox Runs</span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-white">Executions</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Historical log of isolated container checks, test suites, and build validations.
          </p>
        </div>

        <Link
          to={projects[0] ? `/projects/${projects[0].id}/execution` : '/projects'}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm transition-all"
        >
          <Play className="h-3.5 w-3.5" />
          <span>Launch Sandbox Runner</span>
        </Link>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search executions by title or ID..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-8 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-2 text-xs text-zinc-300 outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="passed">Passed</option>
            <option value="running">Running</option>
            <option value="queued">Queued</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span className="text-zinc-500 font-mono">{filteredExecutions.length} runs</span>
        </div>
      </div>

      {/* Executions Table */}
      {filteredExecutions.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm">
          <div className="divide-y divide-zinc-800/80">
            {filteredExecutions.map((exec) => {
              const project = projects.find((p) => p.id === exec.projectId)
              return (
                <div
                  key={exec.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={statusToneMap[exec.status] || 'default'} size="xs" dot>
                        {exec.status.toUpperCase()}
                      </Badge>
                      <span className="font-mono text-[11px] text-zinc-500">ID: {exec.id}</span>
                      {project && (
                        <Link
                          to={`/projects/${project.id}`}
                          className="font-mono text-[11px] text-indigo-400 hover:underline"
                        >
                          {project.name}
                        </Link>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectingExecution(exec)}
                      className="text-left font-medium text-sm text-zinc-100 hover:text-indigo-300 transition-colors block"
                    >
                      {exec.title}
                    </button>

                    <div className="flex items-center gap-4 text-[11px] text-zinc-400 font-mono">
                      <span>Started: {new Date(exec.startedAt).toLocaleTimeString()}</span>
                      {exec.durationMs && <span>Duration: {exec.durationMs / 1000}s</span>}
                      <span>{exec.testResults.length} test cases</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setInspectingExecution(exec)}
                    >
                      View Logs
                    </Button>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => handleRerun(exec)}
                      leftIcon={<RotateCcw className="h-3 w-3" />}
                    >
                      Re-run
                    </Button>
                    <Link
                      to={`/projects/${exec.projectId}/execution`}
                      className="p-1.5 rounded text-zinc-400 hover:text-white"
                      title="Open Terminal"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40">
          <Clock className="mx-auto h-8 w-8 text-zinc-600" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-200">No executions recorded</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {searchQuery || statusFilter !== 'all'
              ? 'No executions match your query.'
              : 'Launch checks in a project workspace to record sandbox execution runs.'}
          </p>
        </div>
      )}

      {/* Modal: Inspect Execution Logs & Tests */}
      {inspectingExecution && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingExecution(null)}
          maxWidth="xl"
          title={
            <div className="flex items-center gap-2">
              <span className="font-semibold">{inspectingExecution.title}</span>
              <Badge tone={statusToneMap[inspectingExecution.status] || 'default'} size="xs" dot>
                {inspectingExecution.status}
              </Badge>
            </div>
          }
          description={`ID: ${inspectingExecution.id} · Started ${new Date(inspectingExecution.startedAt).toLocaleString()}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setInspectingExecution(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleRerun(inspectingExecution)
                  setInspectingExecution(null)
                }}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Re-run Execution
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {/* Test results summary */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Test Results ({inspectingExecution.testResults.length})
              </h4>
              <div className="space-y-1.5">
                {inspectingExecution.testResults.map((t) => (
                  <div
                    key={t.name}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      {t.status === 'passed' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                      )}
                      <span className="text-zinc-200">{t.name}</span>
                    </div>
                    <span className="text-zinc-500">{t.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Build Output */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Console Output
              </h4>
              <pre className="max-h-56 overflow-auto rounded-lg border border-zinc-800 bg-black/80 p-3 font-mono text-xs text-zinc-300 leading-relaxed">
                {inspectingExecution.output.join('\n')}
              </pre>
            </div>

            {/* Log events */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Execution Logs
              </h4>
              <div className="space-y-1 max-h-40 overflow-auto font-mono text-[11px]">
                {inspectingExecution.logs.map((log) => (
                  <div key={log.id} className="flex gap-2 text-zinc-400">
                    <span className="text-zinc-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-indigo-400">[{log.level}]</span>
                    <span className="text-zinc-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
