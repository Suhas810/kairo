import { api, ApiError } from './api'
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
            content: `import { BrowserRouter, Routes, Route } from 'react-router-dom'\nimport { Workspace } from './components/Workspace'\n\nexport function App() {\n  return (\n    <BrowserRouter>\n      <main className="min-h-screen bg-[#09090b] text-zinc-100">\n        <Routes>\n          <Route path="/" element={<Workspace />} />\n        </Routes>\n      </main>\n    </BrowserRouter>\n  )\n}\n`,
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
            content: `export interface AgentTaskRequest {\n  taskId: string\n  repository: string\n  branch: string\n  instructions: string\n}\n\nexport async function dispatchAgentWorkflow(request: AgentTaskRequest) {\n  return { status: 'queued', id: request.taskId }\n}\n`,
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
            content: `export function formatDate(value: Date | string): string {\n  const date = typeof value === 'string' ? new Date(value) : value\n  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })\n}\n`,
          },
        ],
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
    content: `{\n  "name": "kairo-demo",\n  "version": "1.0.0",\n  "private": true\n}\n`,
  },
]

const gitChanges: GitChangeEntry[] = [
  { path: 'src/services/orchestrator.ts', status: 'modified', detail: 'Added candidate patch synthesis pipeline', additions: 32, deletions: 6 },
  { path: 'src/utils/format.ts', status: 'added', detail: 'Added byte and timestamp formatting utilities', additions: 18, deletions: 0 },
  { path: 'docs/architecture.md', status: 'modified', detail: 'Documented sandbox boundary constraints', additions: 14, deletions: 2 },
]

export async function listRepositories(projectId?: string): Promise<RepositoryMetadata[]> {
  try {
    const res = await api.get<RepositoryMetadata[]>('/repositories', {
      params: { project_id: projectId || '061f6320-e711-4074-9689-b762b63cf4f4' },
    })
    if (Array.isArray(res) && res.length > 0) {
      writeStoredRepos(res)
      return res
    }
  } catch {
    // Fallback
  }
  return readStoredRepos()
}

export async function getRepositoryMetadata(): Promise<RepositoryMetadata> {
  const repos = readStoredRepos()
  return repos[0] ?? repositoryMetadata
}

export async function connectRepository(input: {
  name: string
  url: string
  projectId?: string
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

  try {
    const [owner, repoName] = fullName.split('/')
    if (owner && repoName && input.projectId) {
      const res = await api.post<RepositoryMetadata>('/repositories', {
        project_id: input.projectId,
        owner,
        repository: repoName,
        provider: input.provider || 'github',
        default_branch: input.branch || 'main',
      })
      if (res) {
        return res
      }
    }
  } catch {
    // Fallback to local store
  }

  const stored = readStoredRepos()
  const next = [newRepo, ...stored]
  writeStoredRepos(next)
  return newRepo
}

export async function disconnectRepository(repoId: string, projectId?: string, fullName?: string): Promise<boolean> {
  if (projectId && fullName && fullName.includes('/')) {
    const [owner, repository] = fullName.split('/')
    try {
      await api.del(`/repositories/${owner}/${repository}`, {
        params: { project_id: projectId },
      })
    } catch {
      // Fallback
    }
  }
  const stored = readStoredRepos()
  const next = stored.filter((r) => r.id !== repoId)
  writeStoredRepos(next)
  return true
}

export async function getRepositoryFileTree(projectId?: string, fullName?: string, branch?: string): Promise<RepositoryNode[]> {
  if (projectId && fullName && fullName.includes('/')) {
    const [owner, repository] = fullName.split('/')
    try {
      const res = await api.get<RepositoryNode[]>(`/repositories/${owner}/${repository}/tree`, {
        params: { project_id: projectId, branch: branch || 'main' },
      })
      if (Array.isArray(res) && res.length > 0) return res
    } catch {
      // Fallback
    }
  }
  return repositoryTree
}

export async function getRepositoryFileContent(path: string, projectId?: string, fullName?: string, branch?: string): Promise<string> {
  if (!path || path.trim().length === 0) {
    throw new ApiError('Repository path is required.', 400)
  }

  if (projectId && fullName && fullName.includes('/')) {
    const [owner, repository] = fullName.split('/')
    try {
      const res = await api.get<{ content: string }>(`/repositories/${owner}/${repository}/content`, {
        params: { path, project_id: projectId, branch: branch || 'main' },
      })
      if (res && typeof res.content === 'string') return res.content
    } catch {
      // Fallback
    }
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

export async function getRepositoryChanges(projectId?: string, fullName?: string): Promise<GitChangeEntry[]> {
  if (projectId && fullName && fullName.includes('/')) {
    const [owner, repository] = fullName.split('/')
    try {
      const res = await api.get<GitChangeEntry[]>(`/repositories/${owner}/${repository}/changes`, {
        params: { project_id: projectId },
      })
      if (Array.isArray(res) && res.length > 0) return res
    } catch {
      // Fallback
    }
  }
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
