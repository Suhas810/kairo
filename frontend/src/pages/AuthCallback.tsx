import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function AuthCallback() {
  const navigate = useNavigate()
  const { status } = useAuth()
  const [error] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search)
    const errorDesc = params.get('error_description') || params.get('error')
    return errorDesc ? decodeURIComponent(errorDesc) : null
  })

  useEffect(() => {
    if (error) return

    // In a real OAuth flow or Supabase redirect, the hash or query contains tokens.
    // If user is already authenticated or restores session, redirect to /dashboard
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 1200)

    return () => clearTimeout(timer)
  }, [error, navigate, status])

  return (
    <main className="grid min-h-screen place-items-center bg-[#09090b] px-4 text-zinc-100">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400">
          <Sparkles className="h-6 w-6" />
        </div>

        {error ? (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-center gap-2 text-red-400 font-semibold text-sm">
              <AlertCircle className="h-4 w-4" /> Authentication Failed
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
            <Link
              to="/login"
              className="mt-4 inline-block rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-center gap-2 text-indigo-300 font-semibold text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              <span>Verifying authorization...</span>
            </div>
            <p className="text-xs text-zinc-400">Completing identity handshake with provider</p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Directing to workspace
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
