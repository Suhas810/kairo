export function formatDate(value?: Date | string | null): string {
  if (!value) return '—'

  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatRelativeTime(value?: Date | string | null): string {
  if (!value) return 'just now'

  const date = typeof value === 'string' ? new Date(value) : value
  const diffMs = date.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60000)

  if (Math.abs(diffMinutes) < 1) return 'just now'
  if (Math.abs(diffMinutes) < 60) return `${Math.abs(diffMinutes)}m ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return `${Math.abs(diffHours)}h ago`

  const diffDays = Math.round(diffHours / 24)
  return `${Math.abs(diffDays)}d ago`
}

export function formatStatus(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export function truncateText(value: string, maxLength = 80): string {
  if (value.length <= maxLength) return value
  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}
