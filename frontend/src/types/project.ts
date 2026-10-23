export type ProjectStatus =
  | 'healthy'
  | 'reviewing'
  | 'on-track'
  | 'archived'
  | 'Healthy'
  | 'Reviewing'
  | 'On track'

export interface Project {
  id: string
  name: string
  description: string
  repository: string | null
  language: string
  status: ProjectStatus
  updatedAt: string
  createdAt?: string
  ownerId?: string
}

export interface ProjectCreateInput {
  name: string
  description?: string
  repository?: string | null
  language?: string
}

export interface ProjectUpdateInput {
  name?: string
  description?: string
  repository?: string | null
  language?: string
  status?: ProjectStatus
}

export interface ProjectListResponse {
  projects: Project[]
  total: number
}
