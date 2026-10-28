import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  elevated?: boolean
  children: React.ReactNode
}

export function Card({
  hoverable = false,
  elevated = false,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-all duration-200',
        elevated ? 'bg-zinc-900/60 shadow-lg' : '',
        hoverable ? 'hover:border-zinc-700 hover:bg-zinc-900/40 hover:shadow-md' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-3 mb-4 ${className}`}>
      <div>
        <h3 className="font-semibold text-zinc-100">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-zinc-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
