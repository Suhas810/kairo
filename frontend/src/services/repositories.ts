import { ApiError } from './api'
import type { GitChangeEntry, RepositoryMetadata, RepositoryNode } from '../types/repository'

const repositoryMetadata: RepositoryMetadata = {
  id: 'repo-kairo-demo',
  name: 'kairo-demo',
  fullName: 'kairo/kairo-demo',
  defaultBranch: 'main',
  language: 'TypeScript',
  description: 'Frontend workspace for the Kairo demo application.',
  isPrivate: false,
  updatedAt: new Date().toISOString(),
}

const repositoryTree: RepositoryNode[] = [
  {
    id: 'src',
    name: 'src',
    path: 'src',
    type: 'directory',
    children: [
      {
        id: 'src/app',
        name: 'app',
        path: 'src/app',
        type: 'directory',
        children: [
          {
            id: 'src/app/App.tsx',
            name: 'App.tsx',
            path: 'src/app/App.tsx',
            type: 'file',
            language: 'typescript',
            size: 1280,
            content: "export function App() { return <main>Kairo</main> }",
          },
        ],
      },
      {
        id: 'src/utils',
        name: 'utils',
        path: 'src/utils',
        type: 'directory',
        children: [
          {
            id: 'src/utils/format.ts',
            name: 'format.ts',
            path: 'src/utils/format.ts',
            type: 'file',
            language: 'typescript',
            size: 640,
            content: "export function formatDate(value: Date) { return value.toISOString() }",
          },
        ],
      },
    ],
  },
  {
    id: 'docs',
    name: 'docs',
    path: 'docs',
    type: 'directory',
    children: [
      {
        id: 'docs/readme.md',
        name: 'readme.md',
        path: 'docs/readme.md',
        type: 'file',
        language: 'markdown',
        size: 1024,
        content: '# Kairo Demo\n\nLocal documentation for the demo repo.',
      },
    ],
  },
]

const gitChanges: GitChangeEntry[] = [
  { path: 'src/app/App.tsx', status: 'modified', detail: 'Updated app shell for the demo workspace', additions: 14, deletions: 4 },
  { path: 'src/utils/format.ts', status: 'added', detail: 'Added formatting helpers', additions: 12, deletions: 0 },
  { path: 'docs/readme.md', status: 'deleted', detail: 'Removed stale docs', additions: 0, deletions: 5 },
]

export async function getRepositoryMetadata(): Promise<RepositoryMetadata> {
  return repositoryMetadata
}

export async function getRepositoryFileTree(): Promise<RepositoryNode[]> {
  return repositoryTree
}

export async function getRepositoryFileContent(path: string): Promise<string> {
  if (!path || path.trim().length === 0) {
    throw new ApiError('Repository path is required.', 400)
  }

  function findFile(nodes: RepositoryNode[], target: string): RepositoryNode | undefined {
    for (const node of nodes) {
      if (node.path === target) return node
      if (node.children) {
        const child = findFile(node.children, target)
        if (child) return child
      }
    }

    return undefined
  }

  const file = findFile(repositoryTree, path)
  if (!file || file.type !== 'file') {
    throw new ApiError('File not found.', 404)
  }

  return file.content ?? ''
}

export async function getRepositoryChanges(): Promise<GitChangeEntry[]> {
  return gitChanges
}

export const repositoryService = {
  getRepositoryMetadata,
  getRepositoryFileTree,
  getRepositoryFileContent,
  getRepositoryChanges,
}
