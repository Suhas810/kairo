export type TerminalLineType = 'prompt' | 'command' | 'stdout' | 'stderr' | 'info' | 'success' | 'warning'
const styles: Record<TerminalLineType, string> = {
  prompt: 'text-indigo-300',
  command: 'text-zinc-100',
  stdout: 'text-zinc-300',
  stderr: 'text-red-300',
  info: 'text-sky-300',
  success: 'text-emerald-300',
  warning: 'text-amber-300',
}
export function TerminalLine({ type, children }: { type: TerminalLineType; children: string }) {
  return <div className={`whitespace-pre-wrap break-words font-mono text-xs leading-6 ${styles[type]}`}>{children}</div>
}
