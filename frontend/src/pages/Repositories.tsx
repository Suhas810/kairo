import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Code2,
  GitBranch,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Unlock,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { repositoryService } from '../services/repositories'
import { useToast } from '../hooks/useToast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Badge } from '../components/ui/Badge'
import type { RepositoryMetadata } from '../types/repository'

export function Repositories() {
  const [repositories, setRepositories] = useState<RepositoryMetadata[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const toast = useToast()

  // Modal: Connect Repo
  const [isConnectOpen, setIsConnectOpen] = useState(false)
  const [repoName, setRepoName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [repoBranch, setRepoBranch] = useState('main')
  const [repoDesc, setRepoDesc] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dialog: Disconnect Repo
  const [disconnectingRepo, setDisconnectingRepo] = useState<RepositoryMetadata | null>(null)

  useEffect(() => {
    let isMounted = true
    void repositoryService
      .listRepositories()
      .then((data) => {
        if (isMounted) setRepositories(data)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredRepositories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return repositories.filter((repo) => {
      const matchesQuery =
        repo.name.toLowerCase().includes(q) ||
        repo.fullName.toLowerCase().includes(q) ||
        (repo.description && repo.description.toLowerCase().includes(q))
      return matchesQuery
    })
  }, [repositories, searchQuery])

  function handleOpenConnect() {
    setRepoName('')
    setRepoUrl('')
    setRepoBranch('main')
    setRepoDesc('')
    setIsPrivate(false)
    setConnectError('')
    setIsConnectOpen(true)
  }

  async function handleConnectSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!repoName.trim() || !repoUrl.trim()) {
      setConnectError('Repository name and URL are required.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await repositoryService.connectRepository({
        name: repoName,
        url: repoUrl,
        branch: repoBranch,
        description: repoDesc,
        isPrivate,
      })
      setRepositories((prev) => [created, ...prev])
      toast.success(`Repository "${created.fullName}" connected and indexed.`)
      setIsConnectOpen(false)
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Failed to connect repository.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSync(repo: RepositoryMetadata) {
    setSyncingId(repo.id)
    setTimeout(() => {
      setSyncingId(null)
      toast.success(`Repository "${repo.name}" AST graph synchronized.`)
    }, 1000)
  }

  async function handleConfirmDisconnect() {
    if (!disconnectingRepo) return
    try {
      await repositoryService.disconnectRepository(disconnectingRepo.id)
      setRepositories((prev) => prev.filter((r) => r.id !== disconnectingRepo.id))
      toast.success(`Repository "${disconnectingRepo.name}" disconnected.`)
      setDisconnectingRepo(null)
    } catch {
      toast.error('Unable to disconnect repository.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-mono">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-indigo-400">Git Integrations</span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-white">Repositories</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Connect Git repositories to enable AST symbol indexing, agent planning, and diff auditing.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenConnect}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Connect Repository
        </Button>
      </header>

      {/* Security Info Banner */}
      <section className="flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs leading-relaxed text-zinc-300">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
        <div>
          <span className="font-semibold text-zinc-200">Secure Sandboxed Analysis:</span> Repositories
          are cloned read-only into memory or ephemeral test containers. Token authentication is handled securely
          without exposing credentials in client-side bundles.
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories by name or slug..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-8 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-mono">{filteredRepositories.length} repositories</span>
        </div>
      </div>

      {/* Repository List */}
      {filteredRepositories.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRepositories.map((repo) => {
            const isSyncing = syncingId === repo.id
            return (
              <li key={repo.id}>
                <div className="flex flex-col justify-between h-full rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/40">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2 text-indigo-300 shrink-0">
                          <Code2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-zinc-100 truncate">{repo.name}</div>
                          <div className="font-mono text-[11px] text-zinc-500 truncate">{repo.fullName}</div>
                        </div>
                      </div>

                      <Badge tone={repo.isPrivate ? 'warning' : 'success'} size="xs">
                        {repo.isPrivate ? (
                          <span className="flex items-center gap-1">
                            <Lock className="h-2.5 w-2.5" /> Private
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Unlock className="h-2.5 w-2.5" /> Public
                          </span>
                        )}
                      </Badge>
                    </div>

                    <p className="mt-3.5 text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {repo.description || 'No repository description provided.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono mb-3">
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3 text-zinc-400" />
                        <span>{repo.defaultBranch}</span>
                      </span>
                      <span>{repo.language}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-850 pt-2.5">
                      <Link
                        to="/projects/kairo-demo/repository"
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <span>Browse Code</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSync(repo)}
                          disabled={isSyncing}
                          className="rounded p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
                          title="Sync AST Index"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDisconnectingRepo(repo)}
                          className="rounded p-1 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Disconnect Repository"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-950/40">
          <GitBranch className="mx-auto h-8 w-8 text-zinc-600" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-200">No repositories found</h3>
          <p className="mt-1 text-xs text-zinc-500">
            {searchQuery ? 'No repositories match your search query.' : 'Connect a GitHub or GitLab repository to start.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={handleOpenConnect}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Connect Repository
          </Button>
        </div>
      )}

      {/* Modal: Connect Repository */}
      <Modal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        title="Connect Remote Repository"
        description="Provide repository metadata to register it with the Kairo analysis engine."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsConnectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConnectSubmit}
              isLoading={isSubmitting}
            >
              Connect Repository
            </Button>
          </>
        }
      >
        <form onSubmit={handleConnectSubmit} className="space-y-4">
          <Input
            label="Repository Name"
            required
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="e.g. backend-api"
            error={connectError}
          />

          <Input
            label="Git Repository URL / Slug"
            required
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="e.g. https://github.com/my-org/backend-api or my-org/backend-api"
            helperText="Public repositories can be indexed immediately; private repos require an authorized token."
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Default Branch"
              value={repoBranch}
              onChange={(e) => setRepoBranch(e.target.value)}
              placeholder="main"
            />
            <div>
              <label htmlFor="repo-privacy" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Visibility
              </label>
              <select
                id="repo-privacy"
                value={isPrivate ? 'private' : 'public'}
                onChange={(e) => setIsPrivate(e.target.value === 'private')}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
              >
                <option value="public">Public Repository</option>
                <option value="private">Private Repository</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="repo-desc" className="mb-1.5 block text-xs font-medium text-zinc-300">
              Description (Optional)
            </label>
            <textarea
              id="repo-desc"
              rows={2}
              value={repoDesc}
              onChange={(e) => setRepoDesc(e.target.value)}
              placeholder="Short description of this codebase..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
            />
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog: Disconnect Repo */}
      {disconnectingRepo && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDisconnectingRepo(null)}
          onConfirm={handleConfirmDisconnect}
          title="Disconnect Repository"
          message={`Are you sure you want to disconnect repository "${disconnectingRepo.name}"? Cached AST symbol graphs will be removed.`}
          confirmLabel="Disconnect"
        />
      )}
    </div>
  )
}
