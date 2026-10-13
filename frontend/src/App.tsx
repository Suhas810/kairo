import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ActivityFeed } from './components/dashboard/ActivityFeed'
import { DashboardStats } from './components/dashboard/DashboardStats'
import { ProjectCard } from './components/dashboard/ProjectCard'
import { RecentTasks } from './components/dashboard/RecentTasks'
import { AgentChat } from './components/agent/AgentChat'
import { PageLayout } from './components/layout/PageLayout'
import { Header } from './components/layout/Header'
import { ProjectHeader } from './components/project/ProjectHeader'
import { ProjectOverview } from './components/project/ProjectOverview'
import { RepositoryCard } from './components/project/RepositoryCard'
import { ProjectSettings } from './components/project/ProjectSettings'

const mockProjects = [
  {
    name: 'Kairo API',
    description: 'TypeScript backend for task orchestration, execution, and repository automation.',
    status: 'Healthy',
    repository: 'kairo/api',
    language: 'TypeScript',
    updatedAt: '12 minutes ago',
    progress: 82,
    accent: 'bg-violet-500',
  },
  {
    name: 'Dashboard UI',
    description: 'Responsive React frontend for the Kairo agent workspace and project dashboard.',
    status: 'Reviewing',
    repository: 'kairo/frontend',
    language: 'React',
    updatedAt: '1 hour ago',
    progress: 64,
    accent: 'bg-cyan-500',
  },
  {
    name: 'Auth Service',
    description: 'Node.js service handling sign-in, token issuance, and enterprise identity flows.',
    status: 'On track',
    repository: 'identity/auth',
    language: 'Node.js',
    updatedAt: 'Today',
    progress: 91,
    accent: 'bg-emerald-500',
  },
]

function DashboardPage() {
  return (
    <PageLayout>
      <Header
        title="Dashboard"
        subtitle="Monitor active projects, execution health, and AI agent progress."
        actionButtons={[
          { label: 'New project', variant: 'primary' },
          { label: 'View backlog', variant: 'secondary' },
        ]}
      />

      <div className="space-y-8">
        <DashboardStats />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Projects</h2>
            <button className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition hover:border-violet-500 hover:text-white">
              Manage all
            </button>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {mockProjects.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <RecentTasks />
          <ActivityFeed />
        </div>
      </div>
    </PageLayout>
  )
}

function ProjectPage() {
  return (
    <PageLayout>
      <Header
        title="Kairo API"
        subtitle="AI coding platform backend and orchestration layer."
        breadcrumb={['Projects', 'Kairo API']}
        status={{ label: 'Healthy', tone: 'success' }}
        actionButtons={[
          { label: 'Open repository', variant: 'secondary' },
          { label: 'Run agent', variant: 'primary' },
        ]}
      />

      <div className="space-y-6">
        <ProjectHeader
          projectName="Kairo API"
          description="Backend services for orchestration, project execution, and agent task management across repositories and code environments."
          status="Healthy"
          repository="github.com/kairo/kairo-api"
          branch="main"
        />

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <ProjectOverview />
          <div className="space-y-6">
            <RepositoryCard
              name="kairo-api"
              provider="GitHub"
              defaultBranch="main"
              disconnected={false}
              latestCommit="7a4f20c"
              lastCommitMessage="Add task telemetry and execution summaries"
              repositoryUrl="https://github.com/kairo/kairo-api"
            />
            <ProjectSettings />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

function AgentPage() {
  return (
    <PageLayout>
      <Header
        title="Agent workspace"
        subtitle="Debugging failing test run and reviewing repository context."
        breadcrumb={['Agents', 'Code repair agent']}
        status={{ label: 'Debugging', tone: 'warning' }}
      />

      <AgentChat />
    </PageLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectPage />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
