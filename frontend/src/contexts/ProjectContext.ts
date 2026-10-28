import { createContext } from 'react'
import type { Project } from '../data/mockData'

export type ProjectContextValue = {
  projects: Project[]
  createProject: (
    name: string,
    description: string,
    repository?: string | null,
    language?: string,
    status?: Project['status'],
  ) => Project
  updateProject: (
    projectId: string,
    updates: Partial<Pick<Project, 'name' | 'description' | 'repository' | 'language' | 'status'>>,
  ) => Project | null
  deleteProject: (projectId: string) => boolean
}

export const ProjectContext = createContext<ProjectContextValue | null>(null)
