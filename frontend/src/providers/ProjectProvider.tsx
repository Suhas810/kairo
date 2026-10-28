import { useMemo, useState, type ReactNode } from 'react'
import { ProjectContext, type ProjectContextValue } from '../contexts/ProjectContext'
import { projects as initialProjects, type Project } from '../data/mockData'

const PROJECTS_STORAGE_KEY = 'kairo-workspace-projects'

function readStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY)
    if (!raw) return initialProjects
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialProjects
  } catch {
    return initialProjects
  }
}

function writeStoredProjects(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects))
  } catch (err) {
    console.error('Failed to save projects to storage', err)
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(readStoredProjects)

  const value = useMemo<ProjectContextValue>(() => ({
    projects,
    createProject(name, description, repository = null, language = 'TypeScript', status = 'On track') {
      const baseId = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-project'
      const id = projects.some((project) => project.id === baseId) ? `${baseId}-${Date.now()}` : baseId
      const project: Project = {
        id,
        name: name.trim(),
        description: description.trim() || 'A demo project created in this browser session.',
        repository: repository || null,
        language: language || 'TypeScript',
        status: status || 'On track',
        updatedAt: 'Just now',
      }
      setProjects((current) => {
        const next = [...current, project]
        writeStoredProjects(next)
        return next
      })
      return project
    },
    updateProject(projectId, updates) {
      const currentProject = projects.find((item) => item.id === projectId)
      if (!currentProject) return null
      const updatedProject: Project = {
        ...currentProject,
        ...updates,
        name: updates.name !== undefined ? updates.name.trim() : currentProject.name,
        description: updates.description !== undefined ? updates.description.trim() : currentProject.description,
        repository: updates.repository !== undefined ? updates.repository : currentProject.repository,
        language: updates.language !== undefined ? updates.language : currentProject.language,
        status: updates.status !== undefined ? updates.status : currentProject.status,
        updatedAt: 'Just now',
      }
      setProjects((current) => {
        const next = current.map((item) => (item.id === projectId ? updatedProject : item))
        writeStoredProjects(next)
        return next
      })
      return updatedProject
    },
    deleteProject(projectId) {
      if (!projects.some((item) => item.id === projectId)) return false
      setProjects((current) => {
        const next = current.filter((item) => item.id !== projectId)
        writeStoredProjects(next)
        return next
      })
      return true
    },
  }), [projects])

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}
