import { ArrowUp, Lightbulb, SendHorizontal } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { AgentMessage, type AgentMessageProps } from './AgentMessage'
import { AgentStatus } from './AgentStatus'
import { AgentTimeline } from './AgentTimeline'
import { ToolCall } from './ToolCall'

const initialMessages: AgentMessageProps[] = [
  {
    role: 'assistant',
    content:
      'I reviewed the current failure pattern and narrowed it to the authentication validation path. I am preparing a focused patch and validating the most likely impact areas.',
    timestamp: '09:43 AM',
    status: 'completed',
  },
  {
    role: 'user',
    content: 'Fix the failing tests in my project.',
    timestamp: '09:44 AM',
    status: 'sent',
  },
  {
    role: 'assistant',
    content:
      'The failure is caused by a mismatch between validation rules and the request schema. I am updating the checks and running the targeted suite next.',
    timestamp: '09:45 AM',
    status: 'thinking',
  },
]

const suggestions = [
  'Fix the failing tests in my project.',
  'Explain the authentication flow.',
  'Add input validation to the signup form.',
  'Find and fix the bug in the API handler.',
]

export function AgentChat() {
  const [messages, setMessages] = useState<AgentMessageProps[]>(initialMessages)
  const [input, setInput] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!input.trim()) return

    const userMessage: AgentMessageProps = {
      role: 'user',
      content: input.trim(),
      timestamp: 'Now',
      status: 'sent',
    }

    const demoReply: AgentMessageProps = {
      role: 'assistant',
      content:
        'I have received the request and can demonstrate the workflow locally. The agent would inspect the target files, propose a code change, and then validate the affected tests in a sandboxed pass.',
      timestamp: 'Now',
      status: 'thinking',
    }

    setMessages((current) => [...current, userMessage, demoReply])
    setInput('')
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <AgentStatus state="Debugging" />
          <AgentTimeline />
        </div>

        <div className="panel flex min-h-[720px] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Agent session</h3>
              <p className="text-sm text-zinc-400">Repairing auth validation in the current workspace</p>
            </div>
            <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-200">
              Live demo
            </span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-sm text-zinc-400">
                Start a conversation with the agent.
              </div>
            ) : (
              messages.map((message, index) => <AgentMessage key={`${message.role}-${message.timestamp}-${index}`} {...message} />)
            )}

            <div className="space-y-3">
              <ToolCall
                name="Code search"
                description="Inspect the validation rules shaping the authentication responses."
                status="success"
                argument={'rg -n "validate.*token|auth.*schema" src/'}
                output={`src/auth/validators.ts: 22
  - strict token validation
src/routes/session.ts: 48
  - expired session check
`}
              />
              <ToolCall
                name="Test execution"
                description="Run the affected unit tests after the validation update."
                status="running"
                argument="npm test -- --runInBand auth-session"
                output="Running targeted suite...\n  1 failed, 12 passed"
              />
            </div>
          </div>

          <div className="border-t border-zinc-800 bg-zinc-950/60 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:border-violet-500/40 hover:text-white"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-violet-300" />
                  {suggestion}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={2}
                className="min-h-[60px] flex-1 resize-none rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500/60 focus:outline-none"
                placeholder="Ask the agent to inspect, patch, or explain the project..."
              />
              <button
                type="submit"
                className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl border border-violet-500 bg-violet-500 text-white transition hover:bg-violet-400"
                aria-label="Send message"
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end text-xs text-zinc-500">
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1">
          <ArrowUp className="h-3.5 w-3.5" />
          Press Enter to send, Shift + Enter for a new line
        </span>
      </div>
    </div>
  )
}
