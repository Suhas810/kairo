import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Signup() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0d10] px-4 py-10 text-zinc-100">
      <section className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Back to sign in</Link>
        <div className="mt-7 flex h-10 w-10 items-center justify-center rounded border border-amber-400/30 bg-amber-500/10 text-amber-200"><ShieldAlert className="h-5 w-5" /></div>
        <h1 className="mt-4 text-2xl font-semibold">Create an account</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">Sign-up is unavailable because this repository has no configured authentication provider or backend. No account information is collected here.</p>
        <div className="mt-5 rounded border border-zinc-800 bg-zinc-900/50 p-3 text-xs leading-5 text-zinc-400">
          Configure a supported auth service and its public client settings before enabling account creation. Never place a service-role key or private credential in frontend environment variables.
        </div>
        <Link to="/login" className="mt-5 inline-block rounded bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-400">Return to sign in</Link>
      </section>
    </main>
  )
}
