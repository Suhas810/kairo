import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Cpu,
  FolderGit2,
  GitBranch,
  Layers,
  Lock,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Landing() {
  const { status } = useAuth()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'agent' | 'sandbox' | 'repo'>('agent')

  const faqs = [
    {
      q: 'How does Kairo coordinate AI coding agents with repositories?',
      a: 'Kairo indexes your project files into an Abstract Syntax Tree (AST) context graph, analyzes symbol dependencies, and generates a structured plan. The agent generates candidate diffs that are verified inside an isolated Docker sandbox before any change is reviewed or applied.',
    },
    {
      q: 'Does Kairo execute code directly on my host computer?',
      a: 'No. Code executions and checks are dispatched to isolated container runners configured with resource limits (CPU, memory, timeout), ensuring untrusted code and experimental test suites cannot compromise your local environment.',
    },
    {
      q: 'Which AI models and providers are supported?',
      a: 'Kairo connects to Hugging Face Inference Providers with models like Qwen 2.5 7B Instruct and Nebius AI Cloud, with support for configurable model endpoints and temperature controls in settings.',
    },
    {
      q: 'Can I connect private GitHub or GitLab repositories?',
      a: 'Yes. You can import public repositories or connect private repositories using secure backend OAuth and access tokens without exposing secrets in client-side bundles.',
    },
    {
      q: 'Can I review diffs before code changes are accepted?',
      a: 'Always. Kairo provides an interactive git diff viewer showing unified line-by-line additions, deletions, and sandbox test execution logs so you have full control over what is committed.',
    },
  ]

  const useCases = [
    {
      icon: Zap,
      title: 'Automated Bug Triage & Fixes',
      description:
        'Point an agent at failing test traces or error logs. Kairo locates the faulty module, drafts a minimal fix, and validates that all regression tests pass.',
      tags: ['Root Cause Analysis', 'Regression Testing', 'Zero-Context Sprawl'],
    },
    {
      icon: Workflow,
      title: 'Feature Scaffolding & Expansion',
      description:
        'Convert task specifications into working multi-file implementations adhering to your repository coding conventions, types, and architectural patterns.',
      tags: ['Multi-file Generation', 'TypeScript & Python', 'AST Validation'],
    },
    {
      icon: Terminal,
      title: 'Test Suite Generation & Hardening',
      description:
        'Generate edge-case unit and integration tests for uncovered code paths, running deterministic verification in containerized sandbox environments.',
      tags: ['Coverage Expansion', 'Property Testing', 'Deterministic Checks'],
    },
    {
      icon: Layers,
      title: 'Framework Modernization & Refactoring',
      description:
        'Safely refactor legacy code, update dependency APIs, and clean up technical debt with step-by-step verified execution and human-in-the-loop review.',
      tags: ['Type Migration', 'Lint Enforcement', 'Safe Transformations'],
    },
  ]

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#09090b]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-soft">
              K
            </div>
            <span>Kairo</span>
            <span className="hidden sm:inline-block rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-indigo-300">
              v1.0 Developer Workspace
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-sm">
            <a href="#features" className="hidden md:block text-zinc-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#workflow" className="hidden md:block text-zinc-400 hover:text-white transition-colors">
              Workflow
            </a>
            <a href="#use-cases" className="hidden lg:block text-zinc-400 hover:text-white transition-colors">
              Use Cases
            </a>
            <a href="#faq" className="hidden sm:block text-zinc-400 hover:text-white transition-colors">
              FAQ
            </a>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-all"
              >
                Sign In
              </Link>
              <Link
                to={status === 'authenticated' ? '/dashboard' : '/signup'}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-indigo-500 shadow-sm transition-all"
              >
                <span>{status === 'authenticated' ? 'Open Dashboard' : 'Get Started'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))]" />

        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 mb-6">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>AI-Powered Autonomous Coding & Execution Platform</span>
              </div>

              {/* Exact hero assertion sentence preserved for test compatibility */}
              <h1 className="max-w-xl text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                Understand the code. Plan the change. Verify the result.
              </h1>

              <p className="mt-6 max-w-lg text-base sm:text-lg leading-relaxed text-zinc-400">
                Kairo combines deep repository AST awareness, staged agent workflows, and isolated container
                sandboxes into one cohesive workspace designed for modern software teams.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  to={status === 'authenticated' ? '/dashboard' : '/signup'}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 hover:shadow-indigo-500/25 transition-all"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#workspace"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-5 py-3 text-sm font-medium text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800 transition-all"
                >
                  <Play className="h-4 w-4 text-indigo-400" />
                  <span>See Interactive Preview</span>
                </a>
              </div>

              <div className="mt-6 flex items-center gap-6 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Isolated Sandboxes
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-indigo-400" /> Zero Host Execution
                </span>
                <span className="flex items-center gap-1.5">
                  <GitBranch className="h-4 w-4 text-violet-400" /> Full Git Diff Auditing
                </span>
              </div>
            </div>

            {/* Interactive Preview Panel */}
            <div
              id="workspace"
              className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl transition-all"
            >
              {/* Fake window header */}
              <div className="flex items-center justify-between border-b border-zinc-800/90 px-4 py-3 bg-zinc-900/60">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-zinc-400">kairo-workspace · demo-session</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('agent')}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      activeTab === 'agent'
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Agent
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sandbox')}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      activeTab === 'sandbox'
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('repo')}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      activeTab === 'repo'
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Repository
                  </button>
                </div>
              </div>

              {/* Tab Content 1: Agent */}
              {activeTab === 'agent' && (
                <div className="p-4 sm:p-5 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5 text-indigo-400" /> Task: Fix Docker container timeout handling
                    </span>
                    <span className="rounded bg-indigo-500/10 text-indigo-300 px-2 py-0.5 text-[10px]">
                      RUNNING · STAGE 3/5
                    </span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    <div className="rounded-lg bg-zinc-900/80 p-2.5 text-zinc-300 border border-zinc-800/80">
                      <span className="text-indigo-400 font-semibold">1. [PLANNER]</span> Analyzed 3 matching files in AST graph. Identified process reaper missing timeout SIGKILL signal.
                    </div>
                    <div className="rounded-lg bg-zinc-900/80 p-2.5 text-zinc-300 border border-zinc-800/80">
                      <span className="text-cyan-400 font-semibold">2. [RESEARCHER]</span> Verified dependency bounds on <code className="text-zinc-200">sandbox/runner/process.py</code>.
                    </div>
                    <div className="rounded-lg bg-indigo-950/30 border border-indigo-500/30 p-2.5 text-indigo-200">
                      <span className="text-emerald-400 font-semibold">3. [CODER]</span> Synthesizing patch: adding graceful escalation <code className="text-emerald-300">SIGTERM → SIGKILL</code> on 15s expiration.
                    </div>
                  </div>

                  <div className="rounded border border-zinc-800 bg-zinc-900/90 p-2.5 text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>Target: <span className="text-zinc-200">sandbox/runner/process.py (+18, -4 lines)</span></span>
                    <span className="text-emerald-400">Verifying in Docker runner...</span>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Sandbox */}
              {activeTab === 'sandbox' && (
                <div className="p-4 sm:p-5 font-mono text-xs space-y-2 bg-black/60 min-h-64">
                  <div className="text-zinc-500">$ docker run --rm --cpus=2.0 -m=2g kairo/isolated-runner</div>
                  <div className="text-indigo-300">==&gt; Mounting repository tree at /workspace (read-only)...</div>
                  <div className="text-zinc-300">==&gt; Applying candidate patch: 001-fix-timeout.patch</div>
                  <div className="text-emerald-400">✓ Applied cleanly to runner/process.py</div>
                  <div className="text-zinc-400">$ pytest tests/test_runner.py -v</div>
                  <div className="text-emerald-300">test_runner.py::test_process_normal_execution PASSED</div>
                  <div className="text-emerald-300">test_runner.py::test_process_sigterm_escalation PASSED</div>
                  <div className="text-emerald-300">test_runner.py::test_timeout_boundary_limits PASSED</div>
                  <div className="pt-2 text-zinc-400 border-t border-zinc-800">
                    Exit code: <span className="text-emerald-400 font-bold">0</span> · Total duration: <span className="text-zinc-200">1.84s</span>
                  </div>
                </div>
              )}

              {/* Tab Content 3: Repo */}
              {activeTab === 'repo' && (
                <div className="grid grid-cols-[140px_1fr] min-h-64 border-t border-zinc-800 font-mono text-xs">
                  <div className="border-r border-zinc-800 p-3 text-zinc-400 space-y-1.5">
                    <div className="text-zinc-200 font-medium">▾ sandbox/</div>
                    <div className="pl-3 text-zinc-300">▾ runner/</div>
                    <div className="pl-6 text-indigo-300">process.py*</div>
                    <div className="pl-6">execute.py</div>
                    <div className="pl-6">models.py</div>
                    <div className="pl-3">Dockerfile</div>
                  </div>
                  <div className="p-3 text-zinc-300 space-y-1 overflow-x-auto leading-relaxed">
                    <div className="text-zinc-500">@@ -42,7 +42,9 @@ def wait_with_timeout(proc, timeout_sec):</div>
                    <div className="text-zinc-400">     try:</div>
                    <div className="text-zinc-400">         return proc.wait(timeout=timeout_sec)</div>
                    <div className="text-red-400 bg-red-950/30">-    except subprocess.TimeoutExpired:</div>
                    <div className="text-emerald-400 bg-emerald-950/30">+    except TimeoutExpired:</div>
                    <div className="text-emerald-400 bg-emerald-950/30">+        proc.kill()</div>
                    <div className="text-emerald-400 bg-emerald-950/30">+        return proc.wait()</div>
                  </div>
                </div>
              )}

              {/* Bottom footer bar */}
              <div className="grid grid-cols-3 border-t border-zinc-800 bg-zinc-900/50 text-xs">
                <div className="flex items-center justify-center gap-1.5 border-r border-zinc-800 py-2.5 text-zinc-300">
                  <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
                  <span>kairo/frontend</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 border-r border-zinc-800 py-2.5 text-zinc-300">
                  <Cpu className="h-3.5 w-3.5 text-violet-400" />
                  <span>Qwen 2.5 7B</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-2.5 text-zinc-300">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Sandbox Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="border-t border-zinc-800/80 bg-zinc-950/40 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Engineered for Accuracy</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
              Everything required to run reliable AI agents on real codebases.
            </h2>
            <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
              Moving beyond fragile one-shot chat prompts to multi-agent deterministic pipelines with safe verification.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Search,
                title: 'AST Repository Indexing',
                desc: 'Deep symbol graphs, cross-file references, and imports analysis ensure agents only operate on relevant context without exceeding prompt boundaries.',
              },
              {
                icon: Bot,
                title: 'Multi-Stage Orchestration',
                desc: 'Specialized sub-agents for Planning, Research, Code Synthesis, and Verification collaborate with human-in-the-loop oversight at each stage.',
              },
              {
                icon: Lock,
                title: 'Isolated Docker Sandboxes',
                desc: 'Never run arbitrary agent-generated code on your host. Ephemeral containers isolate file system access and enforce resource bounds.',
              },
              {
                icon: Terminal,
                title: 'Automated Test Verification',
                desc: 'Before proposing any pull request or file modification, agents trigger project test suites to verify that bug fixes resolve issues without regressions.',
              },
              {
                icon: GitBranch,
                title: 'Visual Git Diff & Reviews',
                desc: 'Inspect color-coded unified diffs, review additions and deletions line-by-line, and accept or reject individual file patches with confidence.',
              },
              {
                icon: Cpu,
                title: 'Hosted & Local Inference',
                desc: 'Connect to hosted Hugging Face Inference Providers (Qwen 2.5 7B Instruct) or configured local inference endpoints with zero vendor lock-in.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900/70"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-zinc-100">{title}</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="workflow" className="border-t border-zinc-800/80 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Step-by-Step</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
              How Kairo Works
            </h2>
            <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
              A structured workflow that turns tasks into verified code changes.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-4 relative">
            {[
              {
                step: '01',
                title: 'Ingest & Index',
                desc: 'Connect your Git repository. Kairo parses ASTs, detects schemas, and builds semantic symbol indices.',
                icon: FolderGit2,
              },
              {
                step: '02',
                title: 'Plan & Research',
                desc: 'Submit a bug fix or feature task. The planning agent decomposes it into atomic, verifiable steps.',
                icon: Workflow,
              },
              {
                step: '03',
                title: 'Sandbox Execution',
                desc: 'The coder agent generates changes and runs your test suite inside an isolated Docker runner.',
                icon: Terminal,
              },
              {
                step: '04',
                title: 'Review & Merge',
                desc: 'Audit unified git diffs, examine test output, and accept verified patches into your branch.',
                icon: Check,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex flex-col items-start p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60">
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-2xl font-bold text-indigo-500/80">{step}</span>
                  <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="mt-4 text-base font-semibold text-zinc-100">{title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="border-t border-zinc-800/80 bg-zinc-950/40 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Real-World Workflows</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
              Built for practical software engineering.
            </h2>
            <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
              From everyday maintenance to complex migrations, Kairo handles repetitive work with rigor.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {useCases.map(({ icon: Icon, title, description, tags }) => (
              <div
                key={title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2.5 text-indigo-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400">{description}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-zinc-800/80">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] font-mono text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section id="faq" className="border-t border-zinc-800/80 py-20">
        <div className="mx-auto max-w-4xl px-5">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Frequently Asked Questions</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
              Questions & Answers
            </h2>
            <p className="mt-3 text-zinc-400 text-sm sm:text-base">
              Learn more about Kairo architecture, safety guarantees, and integrations.
            </p>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-medium text-zinc-200 hover:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-indigo-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm leading-relaxed text-zinc-400 border-t border-zinc-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t border-zinc-800/80 bg-gradient-to-b from-indigo-950/20 to-zinc-950 py-16">
        <div className="mx-auto max-w-5xl px-5 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Ready to explore the future of AI-augmented engineering?
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-zinc-400">
            Open the demo workspace right now to inspect projects, test deterministic workflows, and review simulated executions.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to={status === 'authenticated' ? '/dashboard' : '/signup'}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all"
            >
              <span>{status === 'authenticated' ? 'Go to Dashboard' : 'Create Free Account'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950 py-12 text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-5 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 font-semibold text-zinc-200 text-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs text-white">
                K
              </div>
              <span>Kairo</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed max-w-sm text-zinc-400">
              AI-powered developer productivity and coding-agent platform. Inspect repositories, execute staged agent plans, and verify changes safely.
            </p>
            <div className="mt-4 text-[11px] text-zinc-600">
              © 2026 Kairo Platforms Inc. All rights reserved.
            </div>
          </div>

          <div>
            <div className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">Product</div>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="#features" className="hover:text-zinc-300 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-zinc-300 transition-colors">
                  Architecture & Workflow
                </a>
              </li>
              <li>
                <a href="#use-cases" className="hover:text-zinc-300 transition-colors">
                  Use Cases
                </a>
              </li>
              <li>
                <a href="#workspace" className="hover:text-zinc-300 transition-colors">
                  Interactive Preview
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">Workspace</div>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/dashboard" className="hover:text-zinc-300 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-zinc-300 transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/tasks" className="hover:text-zinc-300 transition-colors">
                  Tasks
                </Link>
              </li>
              <li>
                <Link to="/repositories" className="hover:text-zinc-300 transition-colors">
                  Repositories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">Security & Legal</div>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/settings/security" className="hover:text-zinc-300 transition-colors">
                  Sandbox Security
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-zinc-300 transition-colors">
                  Preferences
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-zinc-300 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <span className="text-zinc-600">Privacy Policy (Local)</span>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
