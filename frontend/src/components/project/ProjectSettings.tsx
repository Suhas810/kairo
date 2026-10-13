import { useMemo, useState, type FormEvent } from 'react'

type ProjectFormState = {
  name: string
  description: string
  defaultBranch: string
  language: string
  agentPreference: string
}

const initialForm: ProjectFormState = {
  name: 'Kairo API',
  description: 'AI-driven software engineering platform backend and orchestration services.',
  defaultBranch: 'main',
  language: 'TypeScript',
  agentPreference: 'Autonomous with review checkpoints',
}

export function ProjectSettings() {
  const [form, setForm] = useState<ProjectFormState>(initialForm)
  const [message, setMessage] = useState('')

  const validationErrors = useMemo(() => {
    const errors: Partial<Record<keyof ProjectFormState, string>> = {}

    if (form.name.trim().length < 3) {
      errors.name = 'Project name must be at least 3 characters.'
    }

    if (form.description.trim().length < 10) {
      errors.description = 'Please provide a fuller project description.'
    }

    if (form.defaultBranch.trim().length < 2) {
      errors.defaultBranch = 'Default branch is required.'
    }

    return errors
  }, [form])

  const handleChange = (field: keyof ProjectFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (Object.keys(validationErrors).length > 0) {
      setMessage('Please fix the validation issues before saving.')
      return
    }

    setMessage('Changes saved locally for the demo project settings.')
  }

  const handleDelete = () => {
    if (window.confirm('This will only simulate a destructive action in the demo UI. No project data will be deleted.')) {
      setMessage('Destructive action triggered in the UI demo only.')
    }
  }

  return (
    <section className="panel p-5">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white">Project settings</h3>
        <p className="text-sm text-zinc-400">Configure defaults for project execution and agent behavior.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-sm text-zinc-300">Project name</label>
          <input
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500/60 focus:outline-none"
          />
          {validationErrors.name && <p className="mt-1 text-xs text-red-300">{validationErrors.name}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-zinc-300">Description</label>
          <textarea
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500/60 focus:outline-none"
          />
          {validationErrors.description && <p className="mt-1 text-xs text-red-300">{validationErrors.description}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-zinc-300">Default branch</label>
            <input
              value={form.defaultBranch}
              onChange={(event) => handleChange('defaultBranch', event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500/60 focus:outline-none"
            />
            {validationErrors.defaultBranch && <p className="mt-1 text-xs text-red-300">{validationErrors.defaultBranch}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-zinc-300">Preferred language</label>
            <select
              value={form.language}
              onChange={(event) => handleChange('language', event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500/60 focus:outline-none"
            >
              <option>TypeScript</option>
              <option>React</option>
              <option>Node.js</option>
              <option>Python</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-zinc-300">Agent preferences</label>
          <input
            value={form.agentPreference}
            onChange={(event) => handleChange('agentPreference', event.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500/60 focus:outline-none"
          />
        </div>

        {message && <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-100">{message}</div>}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button type="submit" className="rounded-xl border border-violet-500 bg-violet-500 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400">
            Save changes
          </button>

          <button type="button" onClick={handleDelete} className="rounded-xl border border-red-500/50 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-500/20">
            Delete project
          </button>
        </div>
      </form>
    </section>
  )
}
