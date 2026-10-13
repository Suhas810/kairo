import { CheckCircle2, ExternalLink, GitBranch } from 'lucide-react'

type RepositoryCardProps = {
  name: string
  provider: string
  defaultBranch: string
  latestCommit?: string
  lastCommitMessage?: string
  disconnected?: boolean
  repositoryUrl?: string
}

export function RepositoryCard({
  name,
  provider,
  defaultBranch,
  latestCommit,
  lastCommitMessage,
  disconnected = false,
  repositoryUrl,
}: RepositoryCardProps) {
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Repository</h3>
          <p className="text-sm text-zinc-400">{provider} hosting</p>
        </div>
        <span className={`status-badge ${disconnected ? 'border-zinc-600 bg-zinc-900 text-zinc-200' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'}`}>
          {disconnected ? 'Disconnected' : 'Connected'}
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-100">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium text-zinc-100">{name}</div>
              <div className="text-xs text-zinc-400">{provider}</div>
            </div>
          </div>
          {repositoryUrl && (
            <a href={repositoryUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-zinc-700 p-2 text-zinc-200 transition hover:border-zinc-600 hover:text-white" aria-label={`Open ${name} repository`}>
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-zinc-400">
              <GitBranch className="h-4 w-4" />
              Default branch
            </span>
            <span>{defaultBranch}</span>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-zinc-800 pt-3">
            <span className="text-zinc-400">Latest commit</span>
            <span className="font-medium text-zinc-100">{latestCommit ?? '—'}</span>
          </div>

          {lastCommitMessage && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-300">
              {lastCommitMessage}
            </div>
          )}
        </div>
      </div>

      {!disconnected && (
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          Repository sync is active and ready for agent inspection.
        </div>
      )}
    </section>
  )
}
