import React from 'react'

export type BadgeTone = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'cyan' | 'purple' | 'amber'
export type BadgeSize = 'xs' | 'sm' | 'md'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  size?: BadgeSize
  dot?: boolean
  children: React.ReactNode
}

const toneMap: Record<BadgeTone, { badge: string; dot: string }> = {
  default: {
    badge: 'border-zinc-700/80 bg-zinc-850/80 text-zinc-300',
    dot: 'bg-zinc-400',
  },
  primary: {
    badge: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    dot: 'bg-indigo-400',
  },
  purple: {
    badge: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
    dot: 'bg-purple-400',
  },
  success: {
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    dot: 'bg-emerald-400',
  },
  warning: {
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    dot: 'bg-amber-400',
  },
  amber: {
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    dot: 'bg-amber-400',
  },
  error: {
    badge: 'border-red-500/30 bg-red-500/10 text-red-300',
    dot: 'bg-red-400',
  },
  cyan: {
    badge: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    dot: 'bg-cyan-400',
  },
}

const sizeMap: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-1',
  sm: 'px-2 py-0.5 text-xs gap-1.5',
  md: 'px-2.5 py-1 text-xs font-medium gap-1.5',
}

export function Badge({
  tone = 'default',
  size = 'sm',
  dot = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const styles = toneMap[tone] || toneMap.default

  return (
    <span
      className={[
        'inline-flex items-center rounded-md border font-mono select-none',
        styles.badge,
        sizeMap[size],
        className,
      ].join(' ')}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />}
      {children}
    </span>
  )
}
