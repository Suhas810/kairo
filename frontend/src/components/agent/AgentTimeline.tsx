import type { StepStatus } from './AgentStep'
import { AgentStep } from './AgentStep'

type TimelineEntry = {
  title: string
  description: string
  status: StepStatus
  timestamp: string
  details?: string
}

const timeline: TimelineEntry[] = [
  { title: 'Task received', description: 'User request queued and parsed for coding context.', status: 'Completed', timestamp: '09:42' },
  { title: 'Planning started', description: 'Agent identified likely repository scopes and failing components.', status: 'Completed', timestamp: '09:44' },
  { title: 'Repository inspected', description: 'Relevant files and execution traces were reviewed for root cause.', status: 'Completed', timestamp: '09:51' },
  { title: 'Relevant files identified', description: 'The agent narrowed the issue to validation and auth middleware logic.', status: 'Completed', timestamp: '09:57' },
  { title: 'Code changes generated', description: 'Patching in progress with targeted validation and cleanup.', status: 'Running', timestamp: '10:04' },
  { title: 'Tests executed', description: 'The agent is now validating the new patch against the project suite.', status: 'Pending', timestamp: 'Awaiting' },
  { title: 'Results reported', description: 'Will summarize the final validation status after the run completes.', status: 'Pending', timestamp: 'Queued' },
]

export function AgentTimeline() {
  return (
    <section className="panel p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Execution timeline</h3>
        <p className="text-sm text-zinc-400">Detailed workflow for the current coding session</p>
      </div>

      <div className="space-y-4">
        {timeline.map((step, index) => (
          <div key={step.title} className="relative pl-6">
            {index !== timeline.length - 1 && <div className="absolute left-[0.7rem] top-10 h-[calc(100%-1.5rem)] w-px bg-zinc-800" />}
            <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-200">
              {index + 1}
            </div>
            <div className="ml-2">
              <AgentStep {...step} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
