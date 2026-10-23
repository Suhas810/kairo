import { createContext } from 'react'
import type { Project } from '../data/mockData'

export type ProjectContextValue = {
  projects: Project[]
  createProject: (name: string, description: string) => Project
  updateProject: (projectId: string, updates: Pick<Project, 'name' | 'description'>) => Project | null
  deleteProject: (projectId: string) => boolean
}

export const ProjectContext = createContext<ProjectContextValue | null>(null)
