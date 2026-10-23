import { useMemo, useState, type ReactNode } from 'react'
import { ProjectContext, type ProjectContextValue } from '../contexts/ProjectContext'
import { projects as initialProjects, type Project } from '../data/mockData'

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState(initialProjects)
  const value = useMemo<ProjectContextValue>(() => ({
    projects,
    createProject(name, description) {
      const baseId = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-project'
      const id = projects.some((project) => project.id === baseId) ? `${baseId}-${Date.now()}` : baseId
      const project: Project = {
        id,
        name: name.trim(),
        description: description.trim() || 'A demo project created in this browser session.',
        repository: null,
        language: 'Not configured',
        status: 'On track',
        updatedAt: 'Just now',
      }
      setProjects((current) => [...current, project])
      return project
    },
    updateProject(projectId, updates) {
      const currentProject = projects.find((item) => item.id === projectId)
      if (!currentProject) return null
      const updatedProject = {
        ...currentProject,
        name: updates.name.trim(),
        description: updates.description.trim(),
        updatedAt: 'Just now',
      }
      setProjects((current) => current.map((item) => item.id === projectId ? updatedProject : item))
      return updatedProject
    },
    deleteProject(projectId) {
      if (!projects.some((item) => item.id === projectId)) return false
      setProjects((current) => current.filter((item) => item.id !== projectId))
      return true
    },
  }), [projects])
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}
