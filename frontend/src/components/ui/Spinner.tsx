import { Loader2 } from 'lucide-react'

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const sizeMap = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function Spinner({ size = 'md', label, className = '' }: SpinnerProps) {
  return (
    <div className={`inline-flex items-center gap-2 text-zinc-400 ${className}`}>
      <Loader2 className={`animate-spin text-indigo-400 ${sizeMap[size]}`} aria-hidden="true" />
      {label && <span className="text-xs">{label}</span>}
    </div>
  )
}
