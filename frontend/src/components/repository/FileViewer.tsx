import { Check, Copy, FileCode2 } from 'lucide-react'
import { useState } from 'react'
import type { RepositoryNode } from '../../data/mockData'
import { CodeViewer } from './CodeViewer'

export function FileViewer({ file }: { file: RepositoryNode | null }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  if (!file) return <div className="grid min-h-72 flex-1 place-items-center text-sm text-zinc-400">Select a file to inspect its contents.</div>

  async function copyFile() {
    try {
      await navigator.clipboard.writeText(file?.content ?? '')
      setCopied(true)
      setCopyError('')
      window.setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.error('Unable to copy file contents', error)
      setCopyError('Clipboard access is unavailable in this browser.')
    }
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <FileCode2 className="h-4 w-4 shrink-0 text-indigo-300" />
          <span className="truncate font-medium text-zinc-100">{file.name}</span>
          <span className="hidden truncate font-mono text-xs text-zinc-500 sm:inline">{file.path}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>{file.language ?? 'Plain text'} · {file.size ?? '—'}</span>
          <button type="button" onClick={() => void copyFile()} className="inline-flex items-center gap-1 rounded border border-zinc-700 px-2 py-1 text-zinc-300 hover:border-zinc-500" aria-label="Copy file contents">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </header>
      {copyError && <p role="alert" className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-200">{copyError}</p>}
      <CodeViewer content={file.content ?? ''} language={file.language} />
    </section>
  )
}
