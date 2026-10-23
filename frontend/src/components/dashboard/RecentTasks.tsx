import { Bot } from 'lucide-react'
import { Link } from 'react-router-dom'

export function RecentTasks() {
  return (
    <section className="panel p-4 md:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Recent tasks</h2>
        <p className="text-sm text-zinc-400">Agent task submissions</p>
      </div>
      <div className="grid min-h-32 place-items-center rounded border border-dashed border-zinc-800 p-5 text-center">
        <div>
          <Bot className="mx-auto h-5 w-5 text-zinc-500" aria-hidden="true" />
          <p className="mt-2 text-sm text-zinc-300">No task history available</p>
          <p className="mt-1 text-xs text-zinc-500">Task history requires a configured agent service.</p>
          <Link to="/projects" className="mt-3 inline-block text-xs text-indigo-300 hover:text-indigo-200">Choose a project</Link>
        </div>
      </div>
    </section>
  )
}
