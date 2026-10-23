import { ChevronDown, ChevronRight, FileCode2, FileJson2, FileText, Folder, FolderOpen } from 'lucide-react'
import type { RepositoryNode } from '../../data/mockData'

type FileTreeProps = {
  files: RepositoryNode[]
  selectedFileId: string
  expandedFolders: string[]
  onSelect: (id: string) => void
  onToggle: (id: string) => void
}

function TreeItem({ node, depth, ...props }: { node: RepositoryNode; depth: number } & Omit<FileTreeProps, 'files'>) {
  const isFolder = node.kind === 'folder'
  const expanded = props.expandedFolders.includes(node.id)
  const FileIcon = node.language === 'json' ? FileJson2 : node.language === 'markdown' ? FileText : FileCode2
  return (
    <li>
      <button
        type="button"
        onClick={() => (isFolder ? props.onToggle(node.id) : props.onSelect(node.id))}
        aria-expanded={isFolder ? expanded : undefined}
        aria-current={!isFolder && props.selectedFileId === node.id ? 'page' : undefined}
        className={`flex w-full min-w-0 items-center gap-2 rounded-md py-1.5 pr-2 text-left text-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${props.selectedFileId === node.id ? 'bg-indigo-500/15 text-indigo-100' : 'text-zinc-300'}`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {isFolder ? (expanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-500" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" />) : <span className="w-3.5 shrink-0" />}
        {isFolder ? (expanded ? <FolderOpen className="h-4 w-4 shrink-0 text-amber-300" /> : <Folder className="h-4 w-4 shrink-0 text-amber-300" />) : <FileIcon className="h-4 w-4 shrink-0 text-zinc-400" />}
        <span className="truncate">{node.name}</span>
      </button>
      {isFolder && expanded && node.children && (
        <ul>
          {node.children.map((child) => <TreeItem key={child.id} node={child} depth={depth + 1} {...props} />)}
        </ul>
      )}
    </li>
  )
}

export function FileTree(props: FileTreeProps) {
  if (props.files.length === 0) return <p className="p-4 text-sm text-zinc-400">This repository is empty.</p>
  return (
    <ul aria-label="Repository files" className="space-y-0.5 py-2">
      {props.files.map((node) => <TreeItem key={node.id} node={node} depth={0} {...props} />)}
    </ul>
  )
}
