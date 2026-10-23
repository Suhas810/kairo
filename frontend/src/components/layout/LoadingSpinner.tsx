import { LoaderCircle } from 'lucide-react'

export function LoadingSpinner({ label = 'Loading workspace' }: { label?: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0d10] px-4 text-zinc-100" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-sm text-zinc-300">
        <LoaderCircle className="h-5 w-5 animate-spin text-indigo-300" aria-hidden="true" />
        <span>{label}</span>
      </div>
    </main>
  )
}
