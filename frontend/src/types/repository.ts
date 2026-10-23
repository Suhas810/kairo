export type RepositoryNodeType = 'file' | 'directory'
export type GitChangeStatus = 'added' | 'modified' | 'deleted' | 'renamed' | 'unchanged'

export interface RepositoryMetadata {
  id: string
  name: string
  fullName: string
  defaultBranch: string
  language: string
  description?: string
  isPrivate: boolean
  updatedAt: string
}

export interface RepositoryNode {
  id: string
  name: string
  path: string
  type: RepositoryNodeType
  language?: string
  size?: number
  content?: string
  children?: RepositoryNode[]
}

export interface RepositoryFile {
  id: string
  name: string
  path: string
  language?: string
  type: RepositoryNodeType
  content?: string
  children?: RepositoryFile[]
}

export interface GitChangeEntry {
  path: string
  status: GitChangeStatus
  detail?: string
  additions?: number
  deletions?: number
}
