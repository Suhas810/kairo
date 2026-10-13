import type { ReactNode } from 'react'
import { useState } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

type PageLayoutProps = {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#09090B] text-zinc-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar workspace="Kairo Workspace" activeProject="Kairo API" />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 xl:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
