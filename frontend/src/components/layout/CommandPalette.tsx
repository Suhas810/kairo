import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bot,
  BriefcaseBusiness,
  CheckSquare,
  Code2,
  FileCode,
  LayoutDashboard,
  Moon,
  Play,
  Plus,
  Search,
  Settings,
  Sun,
  X,
} from 'lucide-react'
import { useProject } from '../../hooks/useProject'
import { useTask } from '../../hooks/useTask'
import { useTheme } from '../../hooks/useTheme'

export interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onOpenCreateProject?: () => void
  onOpenCreateTask?: () => void
}

interface PaletteItem {
  id: string
  title: string
  subtitle?: string
  category: 'Navigation' | 'Projects' | 'Tasks' | 'Actions'
  icon: typeof LayoutDashboard
  onSelect: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenCreateProject,
  onOpenCreateTask,
}: CommandPaletteProps) {
  const navigate = useNavigate()
  const { projects } = useProject()
  const { tasks } = useTask()
  const { preference, setPreference } = useTheme()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const items = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [
      // Navigation
      {
        id: 'nav-dash',
        title: 'Dashboard',
        subtitle: 'Workspace overview and recent executions',
        category: 'Navigation',
        icon: LayoutDashboard,
        onSelect: () => {
          navigate('/dashboard')
          onClose()
        },
      },
      {
        id: 'nav-proj',
        title: 'Projects',
        subtitle: 'View and manage all projects',
        category: 'Navigation',
        icon: BriefcaseBusiness,
        onSelect: () => {
          navigate('/projects')
          onClose()
        },
      },
      {
        id: 'nav-tasks',
        title: 'Tasks',
        subtitle: 'Task board and engineering backlog',
        category: 'Navigation',
        icon: CheckSquare,
        onSelect: () => {
          navigate('/tasks')
          onClose()
        },
      },
      {
        id: 'nav-repos',
        title: 'Repositories',
        subtitle: 'Connected Git repositories and code browser',
        category: 'Navigation',
        icon: Code2,
        onSelect: () => {
          navigate('/repositories')
          onClose()
        },
      },
      {
        id: 'nav-settings',
        title: 'Settings',
        subtitle: 'Profile, preferences, security, and appearance',
        category: 'Navigation',
        icon: Settings,
        onSelect: () => {
          navigate('/settings')
          onClose()
        },
      },
      // Actions
      {
        id: 'act-new-proj',
        title: 'Create New Project',
        subtitle: 'Initialize a new project in your workspace',
        category: 'Actions',
        icon: Plus,
        onSelect: () => {
          onClose()
          if (onOpenCreateProject) {
            onOpenCreateProject()
          } else {
            navigate('/projects')
          }
        },
      },
      {
        id: 'act-new-task',
        title: 'Create New Task',
        subtitle: 'Add a new coding task or bug fix',
        category: 'Actions',
        icon: Plus,
        onSelect: () => {
          onClose()
          if (onOpenCreateTask) {
            onOpenCreateTask()
          } else {
            navigate('/tasks')
          }
        },
      },
      {
        id: 'act-toggle-theme',
        title: `Toggle Theme (current: ${preference})`,
        subtitle: 'Switch between dark and light appearance',
        category: 'Actions',
        icon: preference === 'dark' ? Sun : Moon,
        onSelect: () => {
          setPreference(preference === 'dark' ? 'light' : 'dark')
          onClose()
        },
      },
    ]

    // Add projects
    projects.forEach((project) => {
      list.push({
        id: `proj-${project.id}`,
        title: project.name,
        subtitle: `Project · ${project.language} · ${project.repository ?? 'No repository'}`,
        category: 'Projects',
        icon: BriefcaseBusiness,
        onSelect: () => {
          navigate(`/projects/${project.id}`)
          onClose()
        },
      })
      list.push({
        id: `agent-${project.id}`,
        title: `Launch Agent: ${project.name}`,
        subtitle: `Start AI coding agent for ${project.name}`,
        category: 'Projects',
        icon: Bot,
        onSelect: () => {
          navigate(`/projects/${project.id}/agent`)
          onClose()
        },
      })
      list.push({
        id: `exec-${project.id}`,
        title: `Run Execution: ${project.name}`,
        subtitle: `Inspect sandbox checks and tests for ${project.name}`,
        category: 'Projects',
        icon: Play,
        onSelect: () => {
          navigate(`/projects/${project.id}/execution`)
          onClose()
        },
      })
    })

    // Add tasks
    tasks.forEach((task) => {
      list.push({
        id: `task-${task.id}`,
        title: task.title,
        subtitle: `Task [${task.status}] · Priority: ${task.priority} · Type: ${task.taskType}`,
        category: 'Tasks',
        icon: FileCode,
        onSelect: () => {
          navigate('/tasks')
          onClose()
        },
      })
    })

    return list
  }, [projects, tasks, preference, navigate, onClose, onOpenCreateProject, onOpenCreateTask, setPreference])

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q),
    )
  }, [items, query])

  if (!isOpen) return null

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect()
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search projects, tasks, and routes..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSelectedIndex(0)
              }}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon
              const isSelected = idx === selectedIndex

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={[
                    'w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-indigo-600/15 text-indigo-200 ring-1 ring-indigo-500/30'
                      : 'text-zinc-300 hover:bg-zinc-900 hover:text-white',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-md ${
                        isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-xs sm:text-sm truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[11px] text-zinc-500 truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider font-mono text-zinc-500">
                    {item.category}
                  </span>
                </button>
              )
            })
          )}
        </div>

        <div className="border-t border-zinc-800/80 px-4 py-2 flex items-center justify-between text-[11px] text-zinc-500 bg-zinc-900/30">
          <span>Navigate with <kbd className="font-mono text-zinc-400">↑</kbd> <kbd className="font-mono text-zinc-400">↓</kbd></span>
          <span>Select with <kbd className="font-mono text-zinc-400">↵ Enter</kbd></span>
        </div>
      </div>
    </div>
  )
}
