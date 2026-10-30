import { api, ApiError } from './api'
import type { Project, ProjectCreateInput, ProjectUpdateInput } from '../types/project'
import { isValidProjectName } from '../utils/validation'

const initialProjects: Project[] = [
  {
    id: 'kairo-demo',
    name: 'Kairo Demo',
    description: 'Demo project for agent orchestration, repository review, and simulated execution.',
    repository: 'kairo/frontend',
    language: 'TypeScript',
    status: 'healthy',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dashboard-ui',
    name: 'Dashboard UI',
    description: 'Design system and product dashboard used to inspect workstreams and task progress.',
    repository: 'kairo/frontend',
    language: 'React',
    status: 'reviewing',
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

let projectStore: Project[] = [...initialProjects]

export async function listProjects(): Promise<Project[]> {
  try {
    const res = await api.get<{ projects: Project[] } | Project[]>('/projects')
    if (res) {
      const items = Array.isArray(res) ? res : res.projects || []
      if (items.length > 0) {
        projectStore = items
        return items
      }
    }
  } catch {
    // Graceful fallback to local store in demo or unauthenticated mode
  }
  return projectStore
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  if (!projectId || projectId.trim().length === 0) {
    throw new ApiError('Project id is required.', 400)
  }

  try {
    const res = await api.get<Project>(`/projects/${projectId}`)
    if (res) {
      return res
    }
  } catch {
    // Fallback
  }

  return projectStore.find((project) => project.id === projectId) ?? null
}

export async function createProject(input: ProjectCreateInput): Promise<Project> {
  if (!isValidProjectName(input.name)) {
    throw new ApiError('Project names must be between 2 and 80 characters.', 400)
  }

  try {
    const created = await api.post<Project>('/projects', {
      name: input.name.trim(),
      description: input.description?.trim() || 'No description provided.',
      repository_url: input.repository ? `https://github.com/${input.repository}` : null,
      language: input.language?.trim() || 'TypeScript',
    })
    if (created && created.id) {
      projectStore = [created, ...projectStore]
      return created
    }
  } catch {
    // Fallback to local store
  }

  const createdAt = new Date().toISOString()
  const project: Project = {
    id: `project-${Math.random().toString(36).slice(2, 9)}`,
    name: input.name.trim(),
    description: input.description?.trim() || 'No description provided.',
    repository: input.repository ?? null,
    language: input.language?.trim() || 'TypeScript',
    status: 'healthy',
    updatedAt: createdAt,
    createdAt,
  }

  projectStore = [project, ...projectStore]
  return project
}

export async function updateProject(projectId: string, updates: ProjectUpdateInput): Promise<Project> {
  try {
    const updated = await api.patch<Project>(`/projects/${projectId}`, updates)
    if (updated) {
      projectStore = projectStore.map((item) => (item.id === projectId ? updated : item))
      return updated
    }
  } catch {
    // Fallback
  }

  const project = projectStore.find((item) => item.id === projectId)
  if (!project) {
    throw new ApiError('Project not found.', 404)
  }

  const nextProject: Project = {
    ...project,
    ...updates,
    name: updates.name?.trim() || project.name,
    description: updates.description?.trim() || project.description,
    repository: updates.repository ?? project.repository,
    language: updates.language?.trim() || project.language,
    status: updates.status ?? project.status,
    updatedAt: new Date().toISOString(),
  }

  projectStore = projectStore.map((item) => (item.id === projectId ? nextProject : item))
  return nextProject
}

export async function deleteProject(projectId: string, confirmed = false): Promise<boolean> {
  if (!confirmed) {
    throw new ApiError('Delete actions require an explicit confirmation.', 409)
  }

  try {
    await api.del(`/projects/${projectId}`)
  } catch {
    // Continue with store deletion
  }

  const next = projectStore.filter((project) => project.id !== projectId)
  if (next.length === projectStore.length) {
    throw new ApiError('Project not found.', 404)
  }

  projectStore = next
  return true
}

export const projectService = {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
}
