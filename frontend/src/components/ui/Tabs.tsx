import React from 'react'

export interface TabItem<T extends string = string> {
  id: T
  label: React.ReactNode
  badge?: React.ReactNode
  icon?: React.ReactNode
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[]
  activeTab: T
  onChange: (id: T) => void
  className?: string
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: TabsProps<T>) {
  return (
    <nav
      aria-label="Tabs"
      className={`flex items-center gap-1 border-b border-zinc-800 overflow-x-auto ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={[
              'relative inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700',
            ].join(' ')}
          >
            {tab.icon && <span className="h-4 w-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="rounded-full bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-400">
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
