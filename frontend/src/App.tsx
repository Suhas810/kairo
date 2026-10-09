import {
  ArrowRight,
  BrainCircuit,
  Bug,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  FolderKanban,
  Github,
  Layers3,
  Menu,
  Play,
  Search,
  Sparkles,
  TestTube2,
  Workflow,
} from 'lucide-react';

const navItems = ['Features', 'How It Works', 'Technology'];

const capabilityCards = [
  {
    icon: Workflow,
    title: 'Plan',
    description: 'Break complex tasks into manageable steps and keep momentum focused.',
  },
  {
    icon: Search,
    title: 'Research',
    description: 'Organize findings, compare ideas, and build clarity before action.',
  },
  {
    icon: Code2,
    title: 'Build',
    description: 'Support implementation workflows with structured development context.',
  },
  {
    icon: TestTube2,
    title: 'Test',
    description: 'Validate progress, verify assumptions, and identify weak points early.',
  },
];

const featureCards = [
  {
    icon: Layers3,
    title: 'Intelligent Planning',
    description: 'Organize complex requests into structured steps and manageable tasks.',
  },
  {
    icon: Search,
    title: 'Research Workflows',
    description: 'Explore information, organize findings, and build a clearer understanding.',
  },
  {
    icon: Code2,
    title: 'Coding Assistance',
    description: 'Support development workflows with code-oriented task organization and guidance.',
  },
  {
    icon: TestTube2,
    title: 'Testing and Validation',
    description: 'Make testing steps and validation activities part of the development journey.',
  },
  {
    icon: Bug,
    title: 'Debugging Support',
    description: 'Structure debugging activities to investigate issues and identify solutions.',
  },
];

const workflowSteps = [
  {
    number: '01',
    title: 'Describe',
    description: 'The user explains the task or problem.',
  },
  {
    number: '02',
    title: 'Plan',
    description: 'Kairo organizes the task into a sequence of steps.',
  },
  {
    number: '03',
    title: 'Execute',
    description: 'The proposed workflow represents research, development, or problem solving.',
  },
  {
    number: '04',
    title: 'Review',
    description: 'The user reviews the proposed output and next steps.',
  },
];

const technologies = ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Nebius AI'];

function App() {
  return (
    <div className="min-h-screen bg-[#08090D] text-zinc-50 antialiased">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute left-[-120px] top-[180px] h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-[-100px] top-[340px] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090D]/75 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300 shadow-glow">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Kairo</span>
          </div>

          <div className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="transition hover:text-white">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#top"
              className="hidden rounded-full border border-white/10 p-2 text-zinc-300 transition hover:border-violet-400/50 hover:text-white md:inline-flex"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="#product"
              className="inline-flex items-center rounded-full border border-violet-400/40 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-100 transition hover:border-violet-300 hover:bg-violet-500/20"
            >
              Explore Kairo
            </a>
            <button className="inline-flex rounded-full border border-white/10 p-2 text-zinc-300 md:hidden" aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        <section id="top" className="mx-auto max-w-6xl px-6 pb-20 pt-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-violet-100">
              <Sparkles className="h-3.5 w-3.5" />
              AI-POWERED AGENT WORKSPACE
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.94] tracking-[-0.08em] text-white md:text-7xl">
              From complex tasks
              <span className="block bg-gradient-to-r from-violet-300 via-violet-500 to-blue-400 bg-clip-text text-transparent">
                to clear outcomes.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Kairo brings planning, research, coding, and problem-solving into one intelligent workspace.
              Turn ambitious ideas into structured workflows and actionable results.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#product"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-3 text-base font-medium text-white shadow-[0_10px_30px_rgba(96,165,250,0.35)] transition hover:brightness-110"
              >
                Explore Kairo
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-base font-medium text-zinc-100 transition hover:border-violet-400/50 hover:bg-white/10"
              >
                <Play className="h-4 w-4 fill-current" />
                See How It Works
              </a>
            </div>

            <p className="mt-6 text-sm text-zinc-400">Built for developers. Designed for intelligent workflows.</p>
          </div>
        </section>

        <section id="product" className="mx-auto max-w-6xl px-6 pb-20 lg:px-8 lg:pb-24">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.02] p-3 shadow-glow sm:p-5">
            <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0B0D12]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Demo Interface
                </div>
              </div>

              <div className="grid min-h-[620px] lg:grid-cols-[220px_minmax(0,1fr)]">
                <aside className="border-b border-white/10 bg-[#0D0F15] p-5 lg:border-b-0 lg:border-r">
                  <div className="flex items-center gap-3 pb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/35 bg-violet-500/10 text-violet-300">
                      <BrainCircuit className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-white">Kairo</span>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button className="flex w-full items-center justify-between rounded-xl border border-violet-400/40 bg-violet-500/10 px-3 py-2 text-sm text-violet-100">
                      <span>New Task</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    {['Overview', 'My Workflows', 'Recent Tasks', 'Settings'].map((item) => (
                      <button
                        key={item}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </aside>

                <main className="bg-[#0B0D12] p-4 sm:p-6">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-zinc-400">Good afternoon</p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">What are we building today?</h2>
                      </div>
                      <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300">
                        Ready
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-[#11131B] p-3">
                      <div className="flex items-center gap-3 rounded-2xl border border-violet-400/25 bg-[#181B27] p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-sm text-zinc-400">
                          Describe a task, explore an idea, or start a new project...
                        </div>
                        <button className="rounded-lg border border-white/10 p-2 text-zinc-200 transition hover:border-violet-400/40 hover:text-white">
                          <FolderKanban className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">
                          <Cpu className="h-3.5 w-3.5 text-violet-300" />
                          Workflow: Discovery Sprint
                        </div>
                        <button className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_30px_rgba(139,92,246,0.35)]">
                          Submit
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {capabilityCards.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="rounded-2xl border border-white/10 bg-[#11131B] p-4">
                          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                            <Icon className="h-4 w-4" />
                          </div>
                          <h3 className="text-base font-semibold text-white">{title}</h3>
                          <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-[#11131B] p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-white">Live workflow</h3>
                        <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Updated now</span>
                      </div>

                      <div className="space-y-3">
                        {[
                          ['Research brief', 'In progress', 'bg-violet-500/15 text-violet-200'],
                          ['Architecture review', 'Queued', 'bg-blue-500/15 text-blue-200'],
                          ['Prototype validation', 'Ready', 'bg-emerald-500/15 text-emerald-200'],
                        ].map(([task, status, badge]) => (
                          <div key={task} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#151924] p-3">
                            <div>
                              <p className="font-medium text-zinc-100">{task}</p>
                              <p className="text-xs text-zinc-400">Next milestone: validation</p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] ${badge}`}>
                              {status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 pb-20 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
              Everything you need to move from idea to execution.
            </h2>
            <p className="mt-4 text-lg text-zinc-300">
              One workspace. Structured workflows. A clearer path from problem to solution.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/10 bg-[#11131B]/80 p-5 transition duration-200 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-[#141825]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/35 bg-violet-500/10 text-violet-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-6 pb-20 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
              From a single prompt to a structured workflow.
            </h2>
          </div>

          <div className="mt-12 rounded-[28px] border border-white/10 bg-[#0D0F15] p-6 shadow-glow sm:p-8">
            <div className="grid gap-5 lg:grid-cols-4">
              {workflowSteps.map(({ number, title, description }, index) => (
                <div key={number} className="relative">
                  <div className="rounded-2xl border border-white/10 bg-[#11131B] p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-sm font-medium text-violet-200">{number}</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_18px_rgba(168,85,247,0.8)]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="absolute right-[-14px] top-1/2 hidden h-px w-7 -translate-y-1/2 bg-gradient-to-r from-violet-400/60 to-blue-400/60 lg:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="technology" className="mx-auto max-w-6xl px-6 pb-20 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
              Built on a modern AI infrastructure stack.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {technologies.map((tech, index) => (
              <div
                key={tech}
                className="rounded-2xl border border-white/10 bg-[#11131B] p-5 text-center transition hover:border-violet-400/40 hover:bg-[#141825]"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-violet-200">
                  {index === technologies.length - 1 ? <Cpu className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                </div>
                <div className="text-lg font-semibold text-white">{tech}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="cta" className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] border border-violet-400/30 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.28),transparent_45%),radial-gradient(circle_at_right,_rgba(96,165,250,0.2),transparent_35%),#0D0F15] px-6 py-14 text-center sm:px-10">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
                Ready to rethink your workflow?
              </h2>
              <p className="mt-4 text-lg text-zinc-300">
                Explore a more structured way to plan, research, build, and solve problems.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="#top"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-3 text-base font-medium text-white shadow-[0_10px_32px_rgba(99,102,241,0.35)] transition hover:brightness-110"
                >
                  Explore Kairo
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#technology"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-base font-medium text-zinc-100 transition hover:border-violet-400/50 hover:bg-white/10"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
