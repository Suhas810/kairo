import { ArrowUpRight, GitBranch } from 'lucide-react'

type ProjectHeaderProps = {
  projectName: string
  description: string
  status: string
  repository: string
  branch: string
}

export function ProjectHeader({ projectName, description, status, repository, branch }: ProjectHeaderProps) {
  return (
    <section className="panel p-5 md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-lg font-semibold text-white">
            KA
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold text-white">{projectName}</h2>
              <span className="status-badge border-emerald-500/40 bg-emerald-500/10 text-emerald-200">
                {status}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
            <GitBranch className="h-4 w-4" />
            {repository}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
            <GitBranch className="h-4 w-4" />
            {branch}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-zinc-600 hover:text-white">
          Open repository
          <ArrowUpRight className="h-4 w-4" />
        </button>
        <button type="button" className="rounded-xl border border-violet-500 bg-violet-500 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400">
          Run agent
        </button>
        <button type="button" className="rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-zinc-600 hover:text-white">
          Project settings
        </button>
      </div>
    </section>
  )
}
