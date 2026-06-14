import * as React from 'react'
import { cn } from '../../lib/utils'

type TabsContextValue = {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export function Tabs({ value, onValueChange, children }: React.PropsWithChildren<TabsContextValue>) {
  return <TabsContext.Provider value={{ value, onValueChange }}>{children}</TabsContext.Provider>
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('tabs-list', className)} role="tablist" {...props} />
}

export function TabsTrigger({ value, className, children }: React.PropsWithChildren<{ value: string; className?: string }>) {
  const context = React.useContext(TabsContext)
  if (!context) return null
  const selected = context.value === value

  return (
    <button
      aria-selected={selected}
      className={cn('tabs-trigger', selected && 'tabs-trigger-active', className)}
      onClick={() => context.onValueChange(value)}
      role="tab"
      type="button"
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children }: React.PropsWithChildren<{ value: string; className?: string }>) {
  const context = React.useContext(TabsContext)
  if (!context || context.value !== value) return null

  return <div className={cn('tabs-content', className)}>{children}</div>
}
