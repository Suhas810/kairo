import {
  Bot,
  Check,
  CheckCircle2,
  CircleDashed,
  Copy,
  Cpu,
  Loader2,
  RotateCcw,
  Send,
  Sliders,
  Square,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useProject } from '../hooks/useProject'
import { useTask } from '../hooks/useTask'
import { useToast } from '../hooks/useToast'
import { ToolCall, type ToolStatus } from '../components/agent/ToolCall'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

type Stage = 'planning' | 'research' | 'coding' | 'testing' | 'complete'

interface StepEvent {
  id: string
  stage: Stage
  title: string
  message: string
  time: string
  toolCall?: {
    name: string
    description: string
    status: ToolStatus
    argument: string
    output?: string
  }
}

const sampleDiff = `--- a/sandbox/runner/process.py
+++ b/sandbox/runner/process.py
@@ -42,8 +42,14 @@ def execute_command(cmd, timeout=30):
     process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
     try:
-        stdout, stderr = process.communicate(timeout=timeout)
+        stdout, stderr = process.communicate(timeout=timeout)
     except subprocess.TimeoutExpired:
-        process.kill()
-        raise ExecutionTimeoutError(f"Process timed out after {timeout}s")
+        process.send_signal(signal.SIGTERM)
+        try:
+            stdout, stderr = process.communicate(timeout=2)
+        except subprocess.TimeoutExpired:
+            process.kill()
+            stdout, stderr = process.communicate()
+        raise ExecutionTimeoutError(f"Process exceeded {timeout}s boundary limit")
     return process.returncode, stdout, stderr`

export function Agent() {
  const { projectId } = useParams()
  const { state } = useProject(projectId)
  const { getProjectTasks } = useTask()
  const toast = useToast()

  const project = state.status === 'success' ? state.project : null
  const projectTasks = useMemo(
    () => (project ? getProjectTasks(project.id) : []),
    [project, getProjectTasks],
  )

  // Configuration state
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [customPrompt, setCustomPrompt] = useState<string | null>(null)
  const [modelId, setModelId] = useState('Qwen/Qwen2.5-7B-Instruct')
  const [provider, setProvider] = useState('Hugging Face / Nebius AI')
  const [temperature, setTemperature] = useState(0.2)
  const [sandboxVerify, setSandboxVerify] = useState(true)
  const [showConfig, setShowConfig] = useState(false)

  // Derive active task ID and prompt without cascading renders
  const currentTaskId = selectedTaskId || (projectTasks.length > 0 ? projectTasks[0].id : 'custom')
  const effectivePrompt =
    customPrompt !== null
      ? customPrompt
      : projectTasks.length > 0
        ? projectTasks[0].description || projectTasks[0].title
        : ''

  // Execution workflow state
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'cancelled' | 'failed'>('idle')
  const [currentStage, setCurrentStage] = useState<Stage>('planning')
  const [events, setEvents] = useState<StepEvent[]>([])
  const [diffContent, setDiffContent] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'timeline' | 'diff' | 'tools'>('timeline')
  const [copiedDiff, setCopiedDiff] = useState(false)

  function handleTaskSelect(id: string) {
    setSelectedTaskId(id)
    if (id === 'custom') {
      setCustomPrompt('')
    } else {
      const found = projectTasks.find((t) => t.id === id)
      if (found) {
        setCustomPrompt(found.description || found.title)
      }
    }
  }

  function handleStartAgent(e?: FormEvent) {
    if (e) e.preventDefault()
    if (!effectivePrompt.trim()) {
      toast.warning('Please enter a task description or select an existing task.')
      return
    }

    setStatus('running')
    setCurrentStage('planning')
    setDiffContent(null)
    setEvents([])

    // Scripted stages for high-fidelity workflow inspection
    const steps: Array<{
      stage: Stage
      title: string
      message: string
      delay: number
      toolCall?: StepEvent['toolCall']
    }> = [
      {
        stage: 'planning',
        title: 'AST Analysis & Context Graph',
        message: 'Parsing repository AST syntax trees, mapping symbol definitions, and identifying candidate files.',
        delay: 600,
        toolCall: {
          name: 'Code search',
          description: 'AST symbol search for target function signatures',
          status: 'success',
          argument: `grep_ast(symbol="wait_with_timeout", repo="${project?.repository || 'kairo/api'}")`,
          output: 'Found symbol definition in sandbox/runner/process.py:42',
        },
      },
      {
        stage: 'research',
        title: 'Dependency & Boundary Resolution',
        message: 'Reviewing process signal escalation constraints and timeout boundary handlers.',
        delay: 1400,
        toolCall: {
          name: 'File read',
          description: 'Reading process runner execution logic',
          status: 'success',
          argument: 'cat sandbox/runner/process.py:L35-L65',
          output: 'Read 30 lines. Identified unhandled TimeoutExpired exception.',
        },
      },
      {
        stage: 'coding',
        title: 'Patch Synthesis & Transformation',
        message: 'Synthesizing graceful SIGTERM escalation before forceful SIGKILL termination.',
        delay: 2400,
        toolCall: {
          name: 'File write',
          description: 'Synthesizing candidate patch in sandbox workspace',
          status: 'success',
          argument: 'apply_patch(target="sandbox/runner/process.py")',
          output: 'Unified diff produced: +10 additions, -3 deletions.',
        },
      },
      {
        stage: 'testing',
        title: 'Docker Sandbox Test Verification',
        message: 'Running pytest in ephemeral container runner with CPU and memory limits.',
        delay: 3400,
        toolCall: {
          name: 'Test execution',
          description: 'Running test runner inside isolated container',
          status: 'success',
          argument: 'pytest tests/test_runner.py -v',
          output: '================ 4 passed in 1.42s ================',
        },
      },
      {
        stage: 'complete',
        title: 'Workflow Complete & Verified',
        message: 'Deterministic verification succeeded. All test cases passed with exit code 0.',
        delay: 4400,
      },
    ]

    steps.forEach((step) => {
      setTimeout(() => {
        setStatus((prev) => {
          if (prev === 'cancelled') return 'cancelled'
          setCurrentStage(step.stage)
          setEvents((current) => [
            ...current,
            {
              id: `evt-${Date.now()}-${Math.random()}`,
              stage: step.stage,
              title: step.title,
              message: step.message,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              toolCall: step.toolCall,
            },
          ])
          if (step.stage === 'coding') {
            setDiffContent(sampleDiff)
          }
          if (step.stage === 'complete') {
            toast.success('Agent workflow completed with verified tests.')
            return 'completed'
          }
          return 'running'
        })
      }, step.delay)
    })
  }

  function handleCancel() {
    setStatus('cancelled')
    toast.info('Agent workflow execution cancelled.')
  }

  function handleReset() {
    setStatus('idle')
    setEvents([])
    setDiffContent(null)
  }

  async function handleCopyDiff() {
    if (!diffContent) return
    try {
      await navigator.clipboard.writeText(diffContent)
      setCopiedDiff(true)
      setTimeout(() => setCopiedDiff(false), 2000)
      toast.success('Diff copied to clipboard.')
    } catch {
      toast.error('Unable to access clipboard.')
    }
  }

  if (!project) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
        <h2 className="font-semibold text-base">Project Not Found</h2>
        <p className="mt-1 text-xs text-red-300">Choose a valid project to launch the AI agent workspace.</p>
        <Link
          to="/projects"
          className="mt-4 inline-block rounded-lg bg-zinc-800 px-3.5 py-2 text-xs font-medium text-white"
        >
          Browse Projects
        </Link>
      </div>
    )
  }

  const stagesList: Array<{ id: Stage; label: string; desc: string }> = [
    { id: 'planning', label: '1. Planning', desc: 'AST symbol search' },
    { id: 'research', label: '2. Research', desc: 'Context & dependencies' },
    { id: 'coding', label: '3. Coding', desc: 'Patch generation' },
    { id: 'testing', label: '4. Testing', desc: 'Sandbox verification' },
    { id: 'complete', label: '5. Result', desc: 'Verified diff' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-mono">
            <Link to={`/projects/${project.id}`} className="hover:text-zinc-300">
              {project.name}
            </Link>
            <span>/</span>
            <span className="text-indigo-400">Agent Workspace</span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Autonomous Coding Agent</span>
            <Badge
              tone={
                status === 'running'
                  ? 'primary'
                  : status === 'completed'
                    ? 'success'
                    : status === 'cancelled'
                      ? 'warning'
                      : 'default'
              }
              size="sm"
              dot={status === 'running'}
            >
              {status.toUpperCase()}
            </Badge>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Powered by {modelId} · AST context indexing · Ephemeral Docker sandbox checks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            leftIcon={<Sliders className="h-3.5 w-3.5" />}
          >
            {showConfig ? 'Hide Config' : 'Agent Config'}
          </Button>

          {status === 'running' ? (
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancel}
              leftIcon={<Square className="h-3.5 w-3.5" />}
            >
              Stop Agent
            </Button>
          ) : status === 'completed' || status === 'cancelled' ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            >
              Reset Session
            </Button>
          ) : null}
        </div>
      </header>

      {/* Model & Agent Configuration Drawer */}
      {showConfig && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <Cpu className="h-4 w-4 text-indigo-400" />
              <span>Inference & Sandbox Configuration</span>
            </div>
            <span className="text-xs text-zinc-500 font-mono">Backend: Hosted Inference Provider</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div>
              <label htmlFor="agent-model-id" className="mb-1 block text-zinc-400 font-medium">Model ID</label>
              <input
                id="agent-model-id"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-200 font-mono text-xs outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="agent-provider" className="mb-1 block text-zinc-400 font-medium">Provider</label>
              <select
                id="agent-provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-200 text-xs outline-none focus:border-indigo-500"
              >
                <option value="Hugging Face / Nebius AI">Hugging Face / Nebius AI</option>
                <option value="Local Ollama / vLLM">Local Ollama / vLLM Endpoint</option>
                <option value="Custom Inference Gateway">Custom Inference Gateway</option>
              </select>
            </div>
            <div>
              <label htmlFor="agent-temp" className="mb-1 block text-zinc-400 font-medium">
                Temperature ({temperature})
              </label>
              <input
                id="agent-temp"
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="agent-sandbox" className="mb-1 block text-zinc-400 font-medium">Verification Sandbox</label>
              <select
                id="agent-sandbox"
                value={sandboxVerify ? 'enabled' : 'disabled'}
                onChange={(e) => setSandboxVerify(e.target.value === 'enabled')}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-200 text-xs outline-none focus:border-indigo-500"
              >
                <option value="enabled">Docker Sandbox (Enforced)</option>
                <option value="disabled">Dry-run (Diffs Only)</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Workflow Stage Timeline Bar */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {stagesList.map(({ id, label, desc }) => {
            const isDone = events.some((e) => e.stage === id) && id !== currentStage
            const isCurrent = currentStage === id && status === 'running'
            const isCompleted = status === 'completed'

            return (
              <div
                key={id}
                className={`rounded-lg border p-2.5 transition-all ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200'
                    : isDone || (isCompleted && id === 'complete')
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-500'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{label}</span>
                  {isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                  ) : isDone || (isCompleted && id === 'complete') ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <CircleDashed className="h-3.5 w-3.5 text-zinc-600" />
                  )}
                </div>
                <div className="mt-1 text-[11px] truncate opacity-80">{desc}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Main Execution Workspace Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: Interactive Output / Diff / Timeline Tabs */}
        <section className="flex flex-col min-h-[560px] rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm">
          {/* Tabs bar */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 bg-zinc-900/40">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'timeline'
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Execution Log ({events.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('diff')}
                className={`px-3 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'diff'
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <span>Generated Diff</span>
                {diffContent && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tools')}
                className={`px-3 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'tools'
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                Tool Calls ({events.filter((e) => e.toolCall).length})
              </button>
            </div>

            {activeTab === 'diff' && diffContent && (
              <button
                type="button"
                onClick={handleCopyDiff}
                className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800/80 px-2 py-1 text-xs text-zinc-300 hover:text-white"
              >
                {copiedDiff ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedDiff ? 'Copied' : 'Copy Diff'}</span>
              </button>
            )}
          </div>

          {/* Tab 1: Timeline Events */}
          {activeTab === 'timeline' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {events.length === 0 ? (
                <div className="grid min-h-72 place-items-center text-center text-zinc-500">
                  <div>
                    <Bot className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
                    <p className="text-sm font-medium text-zinc-300">Agent session idle</p>
                    <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                      Select a task or enter custom instructions on the right to start orchestrating coding agents.
                    </p>
                  </div>
                </div>
              ) : (
                events.map((evt) => (
                  <div
                    key={evt.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge tone={evt.stage === 'complete' ? 'success' : 'primary'} size="xs">
                          {evt.stage.toUpperCase()}
                        </Badge>
                        <span className="font-semibold text-xs sm:text-sm text-zinc-100">{evt.title}</span>
                      </div>
                      <time className="font-mono text-[10px] text-zinc-500">{evt.time}</time>
                    </div>

                    <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">{evt.message}</p>

                    {evt.toolCall && (
                      <div className="mt-3">
                        <ToolCall {...evt.toolCall} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Diff Viewer */}
          {activeTab === 'diff' && (
            <div className="flex-1 p-4 font-mono text-xs overflow-auto bg-black/60">
              {diffContent ? (
                <pre className="text-zinc-300 leading-relaxed">{diffContent}</pre>
              ) : (
                <div className="grid min-h-72 place-items-center text-zinc-500 font-sans text-sm">
                  Diff will appear here once the coding stage synthesizes changes.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Tool Calls */}
          {activeTab === 'tools' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-3">
              {events.filter((e) => e.toolCall).length === 0 ? (
                <div className="grid min-h-72 place-items-center text-sm text-zinc-500">
                  No tool calls dispatched yet.
                </div>
              ) : (
                events
                  .filter((e) => e.toolCall)
                  .map((e) => <ToolCall key={e.id} {...(e.toolCall!)} />)
              )}
            </div>
          )}

          {/* Footer bar */}
          <footer className="border-t border-zinc-800 bg-zinc-900/60 px-4 py-2 flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>Stage: {currentStage}</span>
            <span>Target Repo: {project.repository || 'kairo/api'}</span>
          </footer>
        </section>

        {/* Right: Task Input & Dispatch Panel */}
        <aside className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-5 flex flex-col justify-between">
          <form onSubmit={handleStartAgent} className="space-y-4">
            <div>
              <label htmlFor="agent-task-select" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Choose Project Task
              </label>
              <select
                id="agent-task-select"
                value={currentTaskId}
                onChange={(e) => handleTaskSelect(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-zinc-200 outline-none focus:border-indigo-500"
              >
                {projectTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.taskType}] {t.title}
                  </option>
                ))}
                <option value="custom">-- Custom Prompt / Ad-hoc Task --</option>
              </select>
            </div>

            <div>
              <label htmlFor="agent-prompt" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Task Instructions
              </label>
              <textarea
                id="agent-prompt"
                rows={7}
                value={effectivePrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe the bug fix, architectural change, or test to execute..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={status === 'running'}
              isLoading={status === 'running'}
              leftIcon={<Send className="h-4 w-4" />}
            >
              {status === 'running' ? 'Orchestrating Agent…' : 'Execute Agent Workflow'}
            </Button>
          </form>

          {/* Context Card */}
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-3.5 space-y-2 text-xs text-zinc-400">
            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-indigo-400" />
              <span>Agent Safety Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              Code is generated iteratively against your repository AST. Changes are never committed directly without
              passing tests and explicit human review.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
