import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AgentProvider } from './providers/AgentProvider'
import { AuthProvider } from './providers/AuthProvider'
import { ProjectProvider } from './providers/ProjectProvider'
import { TaskProvider } from './providers/TaskProvider'
import { ToastProvider } from './providers/ToastProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { PageLayout } from './components/layout/PageLayout'
import { LoadingSpinner } from './components/layout/LoadingSpinner'
import { Agent } from './pages/Agent'
import { AuthCallback } from './pages/AuthCallback'
import { Dashboard } from './pages/Dashboard'
import { Execution } from './pages/Execution'
import { Executions } from './pages/Executions'
import { ForgotPassword } from './pages/ForgotPassword'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Project } from './pages/Project'
import { Projects } from './pages/Projects'
import { Repository } from './pages/Repository'
import { Repositories } from './pages/Repositories'
import { Settings } from './pages/Settings'
import { Signup } from './pages/Signup'
import { Tasks } from './pages/Tasks'
import { ProjectSettings } from './components/project/ProjectSettings'
import { useProject } from './hooks/useProject'

function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <LoadingSpinner label="Restoring your session" />
  if (status !== 'authenticated')
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
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
  return (
    <main className="grid min-h-screen place-items-center bg-[#09090b] px-4 text-center text-zinc-100 font-sans">
      <div className="max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <p className="font-mono text-xs text-indigo-400 font-semibold tracking-widest uppercase">404 Error</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Page not found</h1>
        <p className="mt-2.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          The requested route is not part of this workspace or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm transition-all"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-all"
          >
            Return to Kairo
          </Link>
        </div>
      </div>
    </main>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route element={<RequireAuth />}>
        <Route element={<PageLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/executions" element={<Executions />} />
          <Route path="/projects/:projectId" element={<Project />} />
          <Route path="/projects/:projectId/tasks" element={<Tasks />} />
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
          <ToastProvider>
            <ProjectProvider>
              <TaskProvider>
                <AgentProvider>
                  <AppRoutes />
                </AgentProvider>
              </TaskProvider>
            </ProjectProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
