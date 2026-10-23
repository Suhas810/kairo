import { ArrowLeft, KeyRound } from 'lucide-react'
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

  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0d10] px-4 py-10 text-zinc-100">
      <section className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Back to Kairo</Link>
        <div className="mt-7 flex h-10 w-10 items-center justify-center rounded border border-indigo-400/30 bg-indigo-500/10 text-indigo-200"><KeyRound className="h-5 w-5" /></div>
        <h1 className="mt-4 text-2xl font-semibold">Sign in to Kairo</h1>
        <p className="mt-2 text-sm text-zinc-400">{import.meta.env.DEV ? 'Development demo sign-in accepts a valid email and a password of at least 8 characters.' : 'Authentication is not configured for this deployment.'}</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div><label htmlFor="email" className="mb-1.5 block text-sm text-zinc-300">Email</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" /></div>
          <div><label htmlFor="password" className="mb-1.5 block text-sm text-zinc-300">Password</label><input id="password" type="password" autoComplete="current-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" /></div>
          {(formError || authError) && <p role="alert" className="rounded border border-red-500/30 bg-red-500/10 p-2.5 text-sm text-red-200">{formError || authError}</p>}
          <button type="submit" disabled={status === 'loading' || !import.meta.env.DEV} className="w-full rounded bg-indigo-500 px-4 py-2.5 text-sm font-medium hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">{status === 'loading' ? 'Signing in…' : import.meta.env.DEV ? 'Continue with demo account' : 'Sign-in unavailable'}</button>
        </form>
        <div className="mt-5 border-t border-zinc-800 pt-4">
          <p className="text-xs leading-5 text-zinc-500">{import.meta.env.DEV ? 'Development-only mock authentication. No credentials are sent to a server; this is not real account security.' : 'Connect a supported authentication provider before enabling sign-in.'}</p>
          <Link to="/signup" className="mt-3 inline-block text-xs text-indigo-300 hover:text-indigo-200">Need an account? Sign-up options</Link>
        </div>
      </section>
    </main>
  )
}
