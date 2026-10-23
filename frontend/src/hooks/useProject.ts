import { useContext } from 'react'
import type { Project } from '../data/mockData'
import { ProjectContext } from '../contexts/ProjectContext'

export type ProjectState =
  | { status: 'loading' }
  | { status: 'success'; project: Project }
  | { status: 'empty' }
  | { status: 'error'; message: string }

export function useProject(projectId?: string) {
  const context = useContext(ProjectContext)
  if (!context) throw new Error('useProject must be used inside ProjectProvider')
  const { projects } = context
  const project = projects.find((item) => item.id === projectId) ?? (projectId ? undefined : projects[0])
  const state: ProjectState = project
    ? { status: 'success', project }
    : projectId
      ? { status: 'error', message: 'This project is not available in the current demo session.' }
      : { status: 'empty' }
  return {
    state,
    projects,
    project,
    createProject: context.createProject,
    updateProject: context.updateProject,
    deleteProject: context.deleteProject,
  }
}
