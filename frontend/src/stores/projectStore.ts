import { create } from 'zustand'
import { createProject, deleteProject, getProjectById, listProjects, updateProject } from '../services/projects'
import type { Project, ProjectCreateInput, ProjectUpdateInput } from '../types/project'

interface ProjectStoreState {
  projects: Project[]
  selectedProjectId: string | null
  isLoading: boolean
  error: string | null
  selectedProject: Project | null
  loadProjects: () => Promise<void>
  selectProject: (projectId: string) => Promise<void>
  createProject: (input: ProjectCreateInput) => Promise<Project>
  updateProject: (projectId: string, updates: ProjectUpdateInput) => Promise<Project>
  deleteProject: (projectId: string, confirmed?: boolean) => Promise<boolean>
  refresh: () => Promise<void>
}

export const useProjectStore = create<ProjectStoreState>()((set, get) => ({
  projects: [],
  selectedProjectId: null,
  isLoading: false,
  error: null,
  selectedProject: null,

  async loadProjects() {
    set({ isLoading: true, error: null })

    try {
      const projects = await listProjects()
      const selectedProject = projects[0] ?? null
      set({ projects, selectedProjectId: selectedProject?.id ?? null, selectedProject, isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unable to load projects.',
      })
    }
  },

  async selectProject(projectId) {
    const project = await getProjectById(projectId)
    set({ selectedProjectId: projectId, selectedProject: project, error: project ? null : 'Project not found.' })
  },

  async createProject(input) {
    const project = await createProject(input)
    set((state) => ({
      projects: [project, ...state.projects],
      selectedProjectId: project.id,
      selectedProject: project,
    }))
    return project
  },

  async updateProject(projectId, updates) {
    const project = await updateProject(projectId, updates)
    set((state) => ({
      projects: state.projects.map((item) => (item.id === projectId ? project : item)),
      selectedProject: get().selectedProjectId === projectId ? project : get().selectedProject,
    }))
    return project
  },

  async deleteProject(projectId, confirmed = false) {
    const deleted = await deleteProject(projectId, confirmed)
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== projectId),
      selectedProject: state.selectedProject?.id === projectId ? null : state.selectedProject,
      selectedProjectId: state.selectedProjectId === projectId ? null : state.selectedProjectId,
    }))
    return deleted
  },

  async refresh() {
    await get().loadProjects()
  },
}))
