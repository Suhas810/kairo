import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { TerminalHeader } from './TerminalHeader'
import { TerminalLine, type TerminalLineType } from './TerminalLine'

type Entry = { id: number; type: TerminalLineType; text: string }
const files = ['README.md', 'package.json', 'src/', 'tests/', 'sandbox/', 'Dockerfile']

export function Terminal() {
  const [history, setHistory] = useState<Entry[]>([
    { id: 0, type: 'info', text: 'Kairo Isolated Sandbox Terminal (Ephemeral Docker Runner).' },
    { id: 1, type: 'info', text: 'Type "help" to see available sandbox commands.' },
  ])
  const [value, setValue] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  function execute(raw: string) {
    const command = raw.trim()
    if (!command) return
    const lines: Entry[] = [{ id: Date.now(), type: 'prompt', text: `operator@kairo-sandbox:~/workspace$ ${command}` }]

    if (command === 'help') {
      lines.push({
        id: Date.now() + 1,
        type: 'stdout',
        text: 'Available commands: help, pwd, ls, npm test, git status, git diff, node -v, cat package.json, clear',
      })
    } else if (command === 'pwd') {
      lines.push({ id: Date.now() + 1, type: 'stdout', text: '/workspace/kairo (isolated container mount)' })
    } else if (command === 'ls') {
      lines.push({ id: Date.now() + 1, type: 'stdout', text: files.join('   ') })
    } else if (command === 'node -v' || command === 'node --version') {
      lines.push({ id: Date.now() + 1, type: 'stdout', text: 'v22.12.0' })
    } else if (command === 'npm test' || command === 'npm run test') {
      lines.push(
        { id: Date.now() + 1, type: 'stdout', text: '> vitest run\n\n ✓ tests/test_runner.test.ts (4 tests passed)\n ✓ tests/routing-and-theme.test.tsx (3 tests passed)\n\nTest Files  2 passed (2)\nTests  7 passed (7)\nDuration  1.42s' },
      )
    } else if (command === 'git status') {
      lines.push({
        id: Date.now() + 1,
        type: 'stdout',
        text: 'On branch main\nYour branch is up to date with origin/main.\n\nChanges to be committed:\n  modified:   sandbox/runner/process.py\n  modified:   docs/architecture.md',
      })
    } else if (command === 'git diff') {
      lines.push({
        id: Date.now() + 1,
        type: 'stdout',
        text: 'diff --git a/sandbox/runner/process.py b/sandbox/runner/process.py\n+        process.send_signal(signal.SIGTERM)\n+        process.kill()',
      })
    } else if (command === 'cat package.json') {
      lines.push({
        id: Date.now() + 1,
        type: 'stdout',
        text: '{\n  "name": "kairo-sandbox",\n  "version": "1.0.0",\n  "type": "module"\n}',
      })
    } else if (command === 'clear') {
      setHistory([])
      return
    } else {
      lines.push({
        id: Date.now() + 1,
        type: 'stderr',
        text: `bash: command not found: ${command}. Type "help" to view sandbox commands.`,
      })
    }
    setHistory((current) => [...current, ...lines])
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    execute(value)
    setValue('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const lastCommand = [...history].reverse().find((entry) => entry.type === 'prompt')?.text.split('$ ').at(-1)
      if (lastCommand) setValue(lastCommand)
    }
  }

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-800 bg-[#09090b]">
      <TerminalHeader onClear={() => setHistory([])} onCollapse={() => setCollapsed((state) => !state)} collapsed={collapsed} />
      {!collapsed && (
        <div className="max-h-80 min-h-48 overflow-auto p-3 font-mono" onClick={() => input.current?.focus()}>
          <div aria-live="polite">
            {history.map((entry) => (
              <TerminalLine key={entry.id} type={entry.type}>
                {entry.text}
              </TerminalLine>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xs text-indigo-400">operator@kairo-sandbox:~/workspace$</span>
            <input
              ref={input}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Simulated terminal command"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-100 outline-none"
            />
          </form>
        </div>
      )}
    </section>
  )
}
