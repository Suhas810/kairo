import { ApiError } from './api'
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
  return projectStore
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  if (!projectId || projectId.trim().length === 0) {
    throw new ApiError('Project id is required.', 400)
  }

  return projectStore.find((project) => project.id === projectId) ?? null
}

export async function createProject(input: ProjectCreateInput): Promise<Project> {
  if (!isValidProjectName(input.name)) {
    throw new ApiError('Project names must be between 2 and 80 characters.', 400)
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
