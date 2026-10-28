import type { ReactNode } from 'react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { CommandPalette } from './CommandPalette'

type PageLayoutProps = {
  children?: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-[#09090B] text-zinc-50 lg:flex-row">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar onOpenCommandPalette={() => setPaletteOpen(true)} />
        <main className="workspace-main flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 xl:px-8">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  )
}
