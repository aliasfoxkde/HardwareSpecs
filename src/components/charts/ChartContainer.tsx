import type { ReactNode } from 'react'

export function ChartContainer({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-text-secondary mb-3">{title}</h3>
      {children}
    </div>
  )
}
