import { ArrowLeft, KeyRound, Lock, Mail, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const { login, status, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const destination = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError('')
    try {
      await login(email, password)
      navigate(destination, { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in.')
    }
  }

  function handleFillDemo() {
    setEmail('developer@kairo.dev')
    setPassword('demo-password-123')
    setFormError('')
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#09090b] px-4 py-10 text-zinc-100">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Kairo
        </Link>

        <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10 text-indigo-300">
          <KeyRound className="h-5 w-5" />
        </div>

        {/* Retain exact header string for test compatibility */}
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Sign in to Kairo</h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Access your AI developer workspace, connected repositories, and execution sandboxes.
        </p>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-2.5 text-xs text-indigo-300">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Demo account available
          </span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="rounded bg-indigo-600/30 px-2 py-0.5 text-[11px] font-medium text-indigo-200 hover:bg-indigo-600/50 transition-colors"
          >
            Auto-fill
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-300">
              Work Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="developer@kairo.dev"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-xs font-medium text-zinc-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {(formError || authError) && (
            <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-200">
              {formError || authError}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm transition-all"
          >
            {status === 'loading' ? 'Authenticating…' : 'Sign in to Workspace'}
          </button>
        </form>

        <div className="mt-6 border-t border-zinc-800/80 pt-4 flex items-center justify-between text-xs text-zinc-400">
          <span>Don&apos;t have an account?</span>
          <Link to="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">
            Create an account →
          </Link>
        </div>
      </section>
    </main>
  )
}
