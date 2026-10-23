import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AgentProvider } from './providers/AgentProvider'
import { AuthProvider } from './providers/AuthProvider'
import { ProjectProvider } from './providers/ProjectProvider'
import { PageLayout } from './components/layout/PageLayout'
import { LoadingSpinner } from './components/layout/LoadingSpinner'
import { Agent } from './pages/Agent'
import { Dashboard } from './pages/Dashboard'
import { Execution } from './pages/Execution'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Project } from './pages/Project'
import { Projects } from './pages/Projects'
import { Repository } from './pages/Repository'
import { Repositories } from './pages/Repositories'
import { Settings } from './pages/Settings'
import { Signup } from './pages/Signup'
import { ProjectSettings } from './components/project/ProjectSettings'
import { useProject } from './hooks/useProject'
import { ThemeProvider } from './providers/ThemeProvider'

function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <LoadingSpinner label="Restoring your session" />
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  return <Outlet />
}

function LoginRoute() {
  const { status } = useAuth()
  if (status === 'loading') return <LoadingSpinner label="Checking your session" />
  return status === 'authenticated' ? <Navigate to="/dashboard" replace /> : <Login />
}

function NewAgentRoute() {
  const { projects } = useProject()
  const project = projects[0]
  return project ? <Navigate to={`/projects/${project.id}/agent`} replace /> : <Navigate to="/projects" replace />
}

function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#0b0d10] px-4 text-center text-zinc-100"><div><p className="font-mono text-xs text-zinc-500">404</p><h1 className="mt-2 text-2xl font-semibold">Page not found</h1><p className="mt-2 text-sm text-zinc-400">That route is not part of this workspace.</p><Link to="/" className="mt-5 inline-block rounded border border-zinc-700 px-3 py-2 text-sm hover:border-zinc-500">Return to Kairo</Link></div></main>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<RequireAuth />}>
        <Route element={<PageLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/projects/:projectId" element={<Project />} />
          <Route path="/projects/:projectId/settings" element={<ProjectSettings />} />
          <Route path="/projects/:projectId/repository" element={<Repository />} />
          <Route path="/projects/:projectId/agent" element={<Agent />} />
          <Route path="/projects/:projectId/execution" element={<Execution />} />
          <Route path="/agent/new" element={<NewAgentRoute />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/profile" element={<Settings />} />
          <Route path="/settings/preferences" element={<Settings />} />
          <Route path="/settings/appearance" element={<Settings />} />
          <Route path="/settings/security" element={<Settings />} />
          <Route path="/settings/notifications" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ProjectProvider>
            <AgentProvider>
              <AppRoutes />
            </AgentProvider>
          </ProjectProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
