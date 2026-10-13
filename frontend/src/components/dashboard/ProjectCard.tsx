import { MoreHorizontal, Sparkles } from 'lucide-react'

type ProjectCardProps = {
  name: string
  description: string
  status: string
  repository: string
  language: string
  updatedAt: string
  progress: number
  accent: string
}

const statusStyles: Record<string, string> = {
  Healthy: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  Reviewing: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  'On track': 'border-violet-500/40 bg-violet-500/10 text-violet-200',
}

export function ProjectCard({
  name,
  description,
  status,
  repository,
  language,
  updatedAt,
  progress,
  accent,
}: ProjectCardProps) {
  return (
    <article className="panel group flex h-full flex-col p-4 transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent} text-sm font-semibold text-white`}>
            {name
              .split(' ')
              .slice(0, 2)
              .map((word) => word[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <p className="text-xs text-zinc-400">{repository}</p>
          </div>
        </div>

        <button type="button" className="rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 transition hover:border-zinc-700 hover:text-white" aria-label={`More options for ${name}`}>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-4 min-h-[48px] text-sm leading-6 text-zinc-300">{description}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className={`status-badge ${statusStyles[status] ?? 'border-zinc-700 bg-zinc-900 text-zinc-200'}`}>
          <Sparkles className="h-3 w-3" />
          {status}
        </span>
        <span className="text-xs text-zinc-500">Updated {updatedAt}</span>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>{language}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className={`h-full rounded-full ${accent}`} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </article>
  )
}
