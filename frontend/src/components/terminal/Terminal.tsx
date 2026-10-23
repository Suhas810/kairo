import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { TerminalHeader } from './TerminalHeader'
import { TerminalLine, type TerminalLineType } from './TerminalLine'

type Entry = { id: number; type: TerminalLineType; text: string }
const files = ['README.md', 'package.json', 'src/', 'tests/']

export function Terminal() {
  const [history, setHistory] = useState<Entry[]>([
    { id: 0, type: 'info', text: 'This is a simulated terminal. It never executes operating-system commands.' },
  ])
  const [value, setValue] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  function execute(raw: string) {
    const command = raw.trim()
    if (!command) return
    const lines: Entry[] = [{ id: Date.now(), type: 'prompt', text: `demo@kairo:~/kairo$ ${command}` }]
    if (command === 'help') {
      lines.push({ id: Date.now() + 1, type: 'stdout', text: 'Supported commands: help, pwd, ls, clear' })
    } else if (command === 'pwd') {
      lines.push({ id: Date.now() + 1, type: 'stdout', text: '/workspace/kairo (simulated)' })
    } else if (command === 'ls') {
      lines.push({ id: Date.now() + 1, type: 'stdout', text: files.join('  ') })
    } else if (command === 'clear') {
      setHistory([])
      return
    } else {
      lines.push({ id: Date.now() + 1, type: 'stderr', text: `Command not supported: ${command}. Type "help" for demo commands.` })
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
    <section className="overflow-hidden rounded-lg border border-zinc-800 bg-[#0b0d10]">
      <TerminalHeader onClear={() => setHistory([])} onCollapse={() => setCollapsed((state) => !state)} collapsed={collapsed} />
      {!collapsed && <div className="max-h-80 min-h-40 overflow-auto p-3" onClick={() => input.current?.focus()}>
        <div aria-live="polite">{history.map((entry) => <TerminalLine key={entry.id} type={entry.type}>{entry.text}</TerminalLine>)}</div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="font-mono text-xs text-indigo-300">demo@kairo:~/kairo$</span>
          <input ref={input} value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={handleKeyDown} aria-label="Simulated terminal command" autoComplete="off" className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-100 outline-none" />
        </form>
      </div>}
    </section>
  )
}
