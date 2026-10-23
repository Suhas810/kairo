import { Bot, Sparkles, User } from 'lucide-react'

export type MessageRole = 'user' | 'assistant' | 'system'

export type AgentMessageProps = {
  role: MessageRole
  content: string
  timestamp: string
  status?: 'sent' | 'thinking' | 'completed'
}

const roleStyles: Record<MessageRole, string> = {
  user: 'bg-violet-500/10 border-violet-500/20',
  assistant: 'bg-zinc-900 border-zinc-700',
  system: 'bg-amber-500/10 border-amber-500/20',
}

const roleIcons: Record<MessageRole, typeof User> = {
  user: User,
  assistant: Bot,
  system: Sparkles,
}

export function AgentMessage({ role, content, timestamp, status }: AgentMessageProps) {
  const Icon = roleIcons[role]

  return (
    <div className={`flex gap-3 rounded-2xl border p-3 ${roleStyles[role]}`}>
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-950/80 text-zinc-100">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium capitalize text-zinc-100">
            {role === 'assistant' ? 'Kairo agent' : role}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            {status && <span>{status}</span>}
            <span>{timestamp}</span>
          </div>
        </div>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{content}</p>
      </div>
    </div>
  )
}
