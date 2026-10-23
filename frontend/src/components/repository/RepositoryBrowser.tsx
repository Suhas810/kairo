import { ChevronRight, GitBranch, RefreshCw } from 'lucide-react'
import { useRepository } from '../../hooks/useRepository'
import { FileTree } from './FileTree'
import { FileViewer } from './FileViewer'
import { GitChanges } from './GitChanges'

export function RepositoryBrowser() {
  const repository = useRepository()
  return (
    <section className="flex h-[min(76vh,820px)] min-h-[520px] min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="font-semibold text-zinc-100">kairo / api</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
          <span className="truncate font-mono text-xs text-zinc-400">{repository.selectedFile?.path ?? 'Repository'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300"><GitBranch className="h-3.5 w-3.5" /> main</span>
          <button type="button" onClick={() => repository.selectFile('src/index.ts')} className="rounded border border-zinc-700 p-1.5 text-zinc-400 hover:text-white" aria-label="Reset selected demo file"><RefreshCw className="h-3.5 w-3.5" /></button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-40 shrink-0 flex-col overflow-y-auto border-r border-zinc-800 sm:w-56 lg:w-64">
          <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Explorer</p>
          <FileTree
            files={repository.files}
            selectedFileId={repository.selectedFileId}
            expandedFolders={repository.expandedFolders}
            onSelect={repository.selectFile}
            onToggle={repository.toggleFolder}
          />
          <div className="mt-auto"><GitChanges onSelect={repository.selectFile} /></div>
        </aside>
        <FileViewer file={repository.selectedFile} />
      </div>
      <footer className="flex items-center justify-between border-t border-zinc-800 px-3 py-1.5 text-[11px] text-zinc-500">
        <span>Read-only demo repository</span><span>{repository.selectedFile?.language ?? 'Text'}</span>
      </footer>
    </section>
  )
}
