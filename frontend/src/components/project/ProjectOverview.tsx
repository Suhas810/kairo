import { Activity, Briefcase, Cpu, Sparkles, Zap } from 'lucide-react'

const stack = ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Tailwind']

export function ProjectOverview() {
  return (
    <section className="panel p-5 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Project overview</h3>
          <p className="text-sm text-zinc-400">Current execution state and key engineering signals</p>
        </div>
        <span className="status-badge border-emerald-500/40 bg-emerald-500/10 text-emerald-200">Healthy</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Status</span>
            <Activity className="h-4 w-4 text-emerald-300" />
          </div>
          <div className="mt-3 text-2xl font-semibold text-white">Stable</div>
          <p className="mt-2 text-xs text-zinc-500">No critical failures</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Progress</span>
            <Zap className="h-4 w-4 text-violet-300" />
          </div>
          <div className="mt-3 text-2xl font-semibold text-white">82%</div>
          <p className="mt-2 text-xs text-zinc-500">Sprint target: 88%</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Tasks</span>
            <Briefcase className="h-4 w-4 text-cyan-300" />
          </div>
          <div className="mt-3 text-2xl font-semibold text-white">14</div>
          <p className="mt-2 text-xs text-zinc-500">7 completed this sprint</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Agent</span>
            <Cpu className="h-4 w-4 text-amber-300" />
          </div>
          <div className="mt-3 text-2xl font-semibold text-white">Running</div>
          <p className="mt-2 text-xs text-zinc-500">Refining type safety</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h4 className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">Technology stack</h4>
          <div className="flex flex-wrap gap-2">
            {stack.map((item) => (
              <span key={item} className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Sparkles className="h-4 w-4 text-violet-300" />
            Recent progress
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
                <span>Repository inspection</span>
                <span>100%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div className="h-full w-full rounded-full bg-emerald-500" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
                <span>Code generation</span>
                <span>82%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div className="h-full w-[82%] rounded-full bg-violet-500" />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
                <span>Test validation</span>
                <span>64%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div className="h-full w-[64%] rounded-full bg-amber-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
