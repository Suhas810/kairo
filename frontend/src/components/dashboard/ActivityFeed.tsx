import { Activity } from 'lucide-react'

export function ActivityFeed() {
  return (
    <section className="panel p-4 md:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Activity</h2>
        <p className="text-sm text-zinc-400">Updates from connected services</p>
      </div>
      <div className="grid min-h-32 place-items-center rounded border border-dashed border-zinc-800 p-5 text-center">
        <div>
          <Activity className="mx-auto h-5 w-5 text-zinc-500" aria-hidden="true" />
          <p className="mt-2 text-sm text-zinc-300">No activity yet</p>
          <p className="mt-1 text-xs text-zinc-500">Activity will appear here when a backend service is configured.</p>
        </div>
      </div>
    </section>
  )
}
