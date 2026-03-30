import type { ReactNode } from 'react'

export function ChartContainer({ title, children, description }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-4" role="img" aria-label={description ?? title}>
      <h3 className="text-sm font-semibold text-text-secondary mb-3">{title}</h3>
      {children}
    </div>
  )
}
