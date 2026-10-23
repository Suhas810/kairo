import { useState } from 'react'
import { repositoryTree, type RepositoryNode } from '../data/mockData'

function findFile(nodes: RepositoryNode[], id: string): RepositoryNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const nested = node.children ? findFile(node.children, id) : null
    if (nested) return nested
  }
  return null
}

export function useRepository() {
  const [selectedFileId, setSelectedFileId] = useState('src/index.ts')
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['src'])
  const selectedFile = findFile(repositoryTree, selectedFileId)

  function toggleFolder(id: string) {
    setExpandedFolders((current) =>
      current.includes(id) ? current.filter((folder) => folder !== id) : [...current, id],
    )
  }

  return {
    files: repositoryTree,
    selectedFile,
    selectedFileId,
    expandedFolders,
    selectFile: setSelectedFileId,
    toggleFolder,
  }
}
