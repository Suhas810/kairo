import { ArrowRight, CircleDot } from 'lucide-react'

export type HeaderAction = {
  label: string
  variant?: 'primary' | 'secondary'
  onClick?: () => void
}

export type HeaderStatus = {
  label: string
  tone?: 'success' | 'warning' | 'error' | 'neutral'
}

type HeaderProps = {
  title: string
  subtitle?: string
  breadcrumb?: string[]
  actionButtons?: HeaderAction[]
  status?: HeaderStatus
}

const toneStyles: Record<NonNullable<HeaderStatus['tone']>, string> = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  error: 'border-red-500/40 bg-red-500/10 text-red-200',
  neutral: 'border-zinc-700 bg-zinc-900 text-zinc-200',
}

export function Header({ title, subtitle, breadcrumb, actionButtons = [], status }: HeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-zinc-800 pb-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
              {breadcrumb.map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                  <span>{item}</span>
                  {index < breadcrumb.length - 1 && <ArrowRight className="h-3 w-3" />}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white md:text-3xl">{title}</h1>
            {status && (
              <span className={`status-badge ${toneStyles[status.tone ?? 'neutral']}`}>
                <CircleDot className="h-2.5 w-2.5 fill-current" />
                {status.label}
              </span>
            )}
          </div>
        </div>

        {actionButtons.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {actionButtons.map(({ label, variant = 'secondary' }) => (
              <button
                key={label}
                type="button"
                className={[
                  'rounded-xl border px-3.5 py-2 text-sm font-medium transition',
                  variant === 'primary'
                    ? 'border-violet-500 bg-violet-500 text-white hover:bg-violet-400'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-600 hover:text-white',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {subtitle && <p className="max-w-3xl text-sm text-zinc-400 md:text-base">{subtitle}</p>}
    </div>
  )
}
