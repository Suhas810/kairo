import { ApiError } from './api'
import type { GitChangeEntry, RepositoryMetadata, RepositoryNode } from '../types/repository'

const REPOSITORIES_STORAGE_KEY = 'kairo-workspace-repos'

const initialRepositories: RepositoryMetadata[] = [
  {
    id: 'repo-kairo-demo',
    name: 'kairo-demo',
    fullName: 'kairo/kairo-demo',
    defaultBranch: 'main',
    language: 'TypeScript',
    description: 'Frontend workspace for the Kairo developer platform.',
    isPrivate: false,
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'repo-kairo-api',
    name: 'kairo-api',
    fullName: 'kairo/kairo-api',
    defaultBranch: 'main',
    language: 'Python',
    description: 'FastAPI orchestrator and execution broker for AI coding agents.',
    isPrivate: true,
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'repo-sandbox-runner',
    name: 'sandbox-runner',
    fullName: 'kairo/sandbox-runner',
    defaultBranch: 'main',
    language: 'Docker',
    description: 'Isolated container environment for deterministic test execution and safe code changes.',
    isPrivate: false,
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
]

function readStoredRepos(): RepositoryMetadata[] {
  try {
    const raw = localStorage.getItem(REPOSITORIES_STORAGE_KEY)
    if (!raw) return initialRepositories
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialRepositories
  } catch {
    return initialRepositories
  }
}

function writeStoredRepos(repos: RepositoryMetadata[]): void {
  try {
    localStorage.setItem(REPOSITORIES_STORAGE_KEY, JSON.stringify(repos))
  } catch (err) {
    console.error('Failed to save repos to storage', err)
  }
}

let repositoryMetadata: RepositoryMetadata = initialRepositories[0]

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
            content: `import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Workspace } from './components/Workspace'

export function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen bg-[#09090b] text-zinc-100">
        <Routes>
          <Route path="/" element={<Workspace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
`,
          },
        ],
      },
      {
        id: 'src/services',
        name: 'services',
        path: 'src/services',
        type: 'directory',
        children: [
          {
            id: 'src/services/orchestrator.ts',
            name: 'orchestrator.ts',
            path: 'src/services/orchestrator.ts',
            type: 'file',
            language: 'typescript',
            size: 2150,
            content: `export interface AgentTaskRequest {
  taskId: string
  repository: string
  branch: string
  instructions: string
}

export async function dispatchAgentWorkflow(request: AgentTaskRequest) {
  // Step 1: Analyze repository AST
  // Step 2: Formulate candidate patches
  // Step 3: Run isolated sandbox test verification
  return { status: 'queued', id: request.taskId }
}
`,
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
            content: `export function formatDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
`,
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
        id: 'docs/architecture.md',
        name: 'architecture.md',
        path: 'docs/architecture.md',
        type: 'file',
        language: 'markdown',
        size: 1540,
        content: `# Kairo Architecture Overview

Kairo coordinates an intelligent developer loop:
1. **Repository Context Ingestion**: AST extraction and symbol indexing.
2. **Agent Planning**: Structured breakdown of tasks into deterministic steps.
3. **Isolated Sandbox**: Dockerized ephemeral test runners.
4. **Interactive Review**: Unified git diffs with test evidence.
`,
      },
    ],
  },
  {
    id: 'package.json',
    name: 'package.json',
    path: 'package.json',
    type: 'file',
    language: 'json',
    size: 780,
    content: `{
  "name": "kairo-demo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run"
  }
}
`,
  },
]

const gitChanges: GitChangeEntry[] = [
  { path: 'src/services/orchestrator.ts', status: 'modified', detail: 'Added candidate patch synthesis pipeline', additions: 32, deletions: 6 },
  { path: 'src/utils/format.ts', status: 'added', detail: 'Added byte and timestamp formatting utilities', additions: 18, deletions: 0 },
  { path: 'docs/architecture.md', status: 'modified', detail: 'Documented sandbox boundary constraints', additions: 14, deletions: 2 },
  { path: 'docs/legacy-readme.md', status: 'deleted', detail: 'Cleaned up deprecated setup guide', additions: 0, deletions: 24 },
]

export async function listRepositories(): Promise<RepositoryMetadata[]> {
  return readStoredRepos()
}

export async function getRepositoryMetadata(): Promise<RepositoryMetadata> {
  const repos = readStoredRepos()
  return repos[0] ?? repositoryMetadata
}

export async function connectRepository(input: {
  name: string
  url: string
  provider?: string
  branch?: string
  description?: string
  isPrivate?: boolean
}): Promise<RepositoryMetadata> {
  if (!input.name.trim() || !input.url.trim()) {
    throw new ApiError('Repository name and repository URL are required.', 400)
  }

  const cleanName = input.name.trim()
  const cleanUrl = input.url.trim()
  const fullName = cleanUrl.includes('github.com/')
    ? cleanUrl.split('github.com/')[1].replace(/\.git$/, '')
    : `user/${cleanName}`

  const newRepo: RepositoryMetadata = {
    id: `repo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: cleanName,
    fullName,
    defaultBranch: input.branch?.trim() || 'main',
    language: 'TypeScript',
    description: input.description?.trim() || 'Imported repository connected to Kairo workspace.',
    isPrivate: input.isPrivate ?? false,
    updatedAt: new Date().toISOString(),
  }

  const stored = readStoredRepos()
  const next = [newRepo, ...stored]
  writeStoredRepos(next)
  return newRepo
}

export async function disconnectRepository(repoId: string): Promise<boolean> {
  const stored = readStoredRepos()
  const next = stored.filter((r) => r.id !== repoId)
  writeStoredRepos(next)
  return true
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
  listRepositories,
  connectRepository,
  disconnectRepository,
  getRepositoryMetadata,
  getRepositoryFileTree,
  getRepositoryFileContent,
  getRepositoryChanges,
}
