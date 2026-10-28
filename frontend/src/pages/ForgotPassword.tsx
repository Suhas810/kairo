import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const res = await resetPassword(email)
      setSuccessMessage(res.message)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to request password reset.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#09090b] px-4 py-10 text-zinc-100">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>

        <div className="mt-6 flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10 text-indigo-300">
          <KeyRound className="h-5 w-5" />
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Reset password</h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Enter your registered work email and we will dispatch recovery instructions to your inbox.
        </p>

        {successMessage ? (
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200 space-y-3">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Instructions Sent
            </div>
            <p className="text-xs leading-relaxed text-emerald-300">{successMessage}</p>
            <Link
              to="/login"
              className="inline-block rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="recovery-email" className="mb-1.5 block text-xs font-medium text-zinc-300">
                Work Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@kairo.dev"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {errorMessage && (
              <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-200">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm transition-all"
            >
              {isSubmitting ? 'Sending instructions…' : 'Send Recovery Instructions'}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-zinc-800/80 pt-4 flex items-center justify-between text-xs text-zinc-400">
          <span>Remember your credentials?</span>
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in →
          </Link>
        </div>
      </section>
    </main>
  )
}
