export type Project = {
  id: string
  name: string
  description: string
  repository: string | null
  language: string
  status: 'Healthy' | 'Reviewing' | 'On track'
  updatedAt: string
}

export type RepositoryNode = {
  id: string
  name: string
  path: string
  kind: 'file' | 'folder'
  children?: RepositoryNode[]
  language?: string
  content?: string
  size?: string
}

export const projects: Project[] = [
  {
    id: 'kairo-api',
    name: 'Kairo API',
    description: 'TypeScript services for task orchestration and repository automation.',
    repository: 'kairo/api',
    language: 'TypeScript',
    status: 'Healthy',
    updatedAt: '12 minutes ago',
  },
  {
    id: 'dashboard-ui',
    name: 'Dashboard UI',
    description: 'The React workspace for inspecting projects and simulated agent runs.',
    repository: 'kairo/frontend',
    language: 'React',
    status: 'Reviewing',
    updatedAt: '1 hour ago',
  },
  {
    id: 'auth-service',
    name: 'Auth Service',
    description: 'A sample Node.js identity service used in the Kairo demo workspace.',
    repository: null,
    language: 'Node.js',
    status: 'On track',
    updatedAt: 'Today',
  },
]

export const repositoryTree: RepositoryNode[] = [
  {
    id: 'src',
    name: 'src',
    path: 'src',
    kind: 'folder',
    children: [
      {
        id: 'src/index.ts',
        name: 'index.ts',
        path: 'src/index.ts',
        kind: 'file',
        language: 'typescript',
        size: '1.2 KB',
        content: `import { createServer } from './server'
import { loadConfig } from './config'

const config = loadConfig()
const server = createServer(config)

server.listen(config.port, () => {
  console.info(\`Kairo API listening on :\${config.port}\`)
})
`,
      },
      {
        id: 'src/server.ts',
        name: 'server.ts',
        path: 'src/server.ts',
        kind: 'file',
        language: 'typescript',
        size: '2.8 KB',
        content: `import type { ServerConfig } from './types'

export function createServer(config: ServerConfig) {
  return {
    listen(port: number, onReady: () => void) {
      console.info(\`Starting \${config.name} on \${port}\`)
      onReady()
    },
  }
}
`,
      },
      {
        id: 'src/config.ts',
        name: 'config.ts',
        path: 'src/config.ts',
        kind: 'file',
        language: 'typescript',
        size: '940 B',
        content: `export function loadConfig() {
  return {
    name: 'Kairo API',
    port: Number(process.env.PORT ?? 4100),
  }
}
`,
      },
      {
        id: 'src/auth',
        name: 'auth',
        path: 'src/auth',
        kind: 'folder',
        children: [
          {
            id: 'src/auth/session.ts',
            name: 'session.ts',
            path: 'src/auth/session.ts',
            kind: 'file',
            language: 'typescript',
            size: '1.1 KB',
            content: `export function isSessionValid(expiresAt: number, now = Date.now()) {
  return expiresAt > now
}
`,
          },
          {
            id: 'src/auth/validator.ts',
            name: 'validator.ts',
            path: 'src/auth/validator.ts',
            kind: 'file',
            language: 'typescript',
            size: '782 B',
            content: `export function isValidEmail(value: string) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)
}
`,
          },
        ],
      },
      {
        id: 'src/legacy',
        name: 'legacy',
        path: 'src/legacy',
        kind: 'folder',
        children: [
          {
            id: 'src/legacy/token.ts',
            name: 'token.ts',
            path: 'src/legacy/token.ts',
            kind: 'file',
            language: 'typescript',
            size: '420 B',
            content: `// Demo fixture representing a removed legacy file.
export const legacyTokenFormat = 'v1'
`,
          },
        ],
      },
    ],
  },
  {
    id: 'tests',
    name: 'tests',
    path: 'tests',
    kind: 'folder',
    children: [
      {
        id: 'tests/session.test.ts',
        name: 'session.test.ts',
        path: 'tests/session.test.ts',
        kind: 'file',
        language: 'typescript',
        size: '1.3 KB',
        content: `import { describe, expect, it } from 'vitest'
import { isSessionValid } from '../src/auth/session'

describe('isSessionValid', () => {
  it('rejects expired sessions', () => {
    expect(isSessionValid(100, 101)).toBe(false)
  })
})
`,
      },
      {
        id: 'tests/server.test.ts',
        name: 'server.test.ts',
        path: 'tests/server.test.ts',
        kind: 'file',
        language: 'typescript',
        size: '1.6 KB',
        content: `import { describe, expect, it } from 'vitest'
import { createServer } from '../src/server'

describe('createServer', () => {
  it('returns a listener for the configured port', () => {
    const server = createServer({ name: 'test' })
    expect(server.listen).toBeTypeOf('function')
  })
})
`,
      },
    ],
  },
  {
    id: 'README.md',
    name: 'README.md',
    path: 'README.md',
    kind: 'file',
    language: 'markdown',
    size: '2.1 KB',
    content: `# Kairo API

A demo service for task orchestration and repository automation.

## Development

Install dependencies with your package manager, then run the development server.

This repository view is populated with local demo fixtures; it is not connected to GitHub.
`,
  },
  {
    id: 'package.json',
    name: 'package.json',
    path: 'package.json',
    kind: 'file',
    language: 'json',
    size: '768 B',
    content: `{
  "name": "kairo-api",
  "private": true,
  "scripts": {
    "dev": "vite",
    "test": "vitest run"
  },
  "dependencies": {
    "typescript": "^5.7.0"
  }
}
`,
  },
]

export const gitChanges = [
  { path: 'src/auth/session.ts', status: 'M' as const, detail: 'Modified' },
  { path: 'src/auth/validator.ts', status: 'A' as const, detail: 'Added' },
  { path: 'tests/session.test.ts', status: '?' as const, detail: 'Untracked' },
  { path: 'src/legacy/token.ts', status: 'D' as const, detail: 'Deleted' },
]
