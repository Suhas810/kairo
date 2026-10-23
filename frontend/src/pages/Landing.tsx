import { ArrowRight, Bot, Check, Code2, GitBranch, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Landing() {
  const { status } = useAuth()
  return (
    <main className="min-h-screen bg-[#0b0d10] text-zinc-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded bg-indigo-500 text-sm">K</span>Kairo</Link>
        <nav className="flex items-center gap-4 text-sm">
          <a href="#workspace" className="hidden text-zinc-400 hover:text-white sm:block">Workspace preview</a>
          <Link to={status === 'authenticated' ? '/dashboard' : '/login'} className="rounded border border-zinc-700 px-3 py-2 hover:border-zinc-500">{status === 'authenticated' ? 'Open dashboard' : 'Sign in'}</Link>
        </nav>
      </header>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-24">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">A workspace for software work</p>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Understand the code. Plan the change. Verify the result.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400">Kairo brings repository context, task planning, and execution feedback into one focused developer workspace.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={status === 'authenticated' ? '/dashboard' : '/login'} className="inline-flex items-center gap-2 rounded bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-400">Open the workspace <ArrowRight className="h-4 w-4" /></Link>
            <a href="#workspace" className="rounded border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200 hover:border-zinc-500">See how it works</a>
          </div>
          <p className="mt-4 text-xs text-zinc-500">Frontend demo · agent and execution workflows use fixtures only.</p>
        </div>
        <div id="workspace" className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2 text-sm"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Kairo API <span className="text-zinc-600">/</span> Repository</div>
            <span className="rounded border border-zinc-700 px-2 py-1 font-mono text-[10px] text-zinc-400">main</span>
          </div>
          <div className="grid min-h-64 grid-cols-[140px_1fr] sm:grid-cols-[190px_1fr]">
            <div className="border-r border-zinc-800 p-3 font-mono text-xs leading-7 text-zinc-400"><div className="text-zinc-200">▾ src</div><div className="pl-4">index.ts</div><div className="pl-4">server.ts</div><div className="text-zinc-200">▾ tests</div><div className="pl-4">server.test.ts</div></div>
            <pre className="overflow-hidden p-4 font-mono text-xs leading-6 text-zinc-300"><span className="text-indigo-300">export function</span> createServer(config) {'{'}{'\n'}  <span className="text-indigo-300">return</span> {'{'}{'\n'}    listen(port, onReady) {'{'}{'\n'}      console.info(<span className="text-emerald-300">`Starting on ${'{'}port{'}'}`</span>){'\n'}      onReady(){'\n'}    {'}'}{'\n'}  {'}'}{'\n'}{'}'}</pre>
          </div>
          <div className="grid grid-cols-3 border-t border-zinc-800 text-xs">
            {[['Repository', GitBranch], ['Agent plan', Bot], ['Checks', Check]].map(([label, Icon]) => {
              const ItemIcon = Icon as typeof GitBranch
              return <div key={label as string} className="flex items-center justify-center gap-2 border-r border-zinc-800 py-3 text-zinc-300 last:border-r-0"><ItemIcon className="h-3.5 w-3.5 text-indigo-300" /><span>{label as string}</span></div>
            })}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 border-t border-zinc-800 px-5 py-10 sm:grid-cols-3">
        {[{ icon: Code2, title: 'Repository context', copy: 'Browse a clear file tree and inspect source with useful metadata.' }, { icon: Bot, title: 'Visible task progress', copy: 'Follow planning, research, coding, and test stages in one timeline.' }, { icon: ShieldCheck, title: 'Safe by default', copy: 'This demo does not connect to an AI model or run commands locally.' }].map(({ icon: Icon, title, copy }) => <article key={title} className="border-l border-zinc-800 pl-4"><Icon className="h-4 w-4 text-indigo-300" /><h2 className="mt-3 text-sm font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-zinc-400">{copy}</p></article>)}
      </section>
    </main>
  )
}
