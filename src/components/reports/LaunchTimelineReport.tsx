import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { getDeviceMetricsTable } from '@/lib/api'

export function LaunchTimelineReport() {
  const table = useMemo(() => getDeviceMetricsTable(), [])

  const currentYear = new Date().getFullYear()

  const launchesByYear = useMemo(() => {
    const yearData = new Map<number, { count: number; topsSum: number; topsCount: number; categories: Map<string, number> }>()
    for (let y = currentYear - 9; y <= currentYear; y++) {
      yearData.set(y, { count: 0, topsSum: 0, topsCount: 0, categories: new Map() })
    }
    table.forEach(r => {
      const year = new Date(r.launchDate).getFullYear()
      const entry = yearData.get(year)
      if (entry) {
        entry.count++
        if (r.effectiveInt8Tops > 0) {
          entry.topsSum += r.effectiveInt8Tops
          entry.topsCount++
        }
        entry.categories.set(r.categoryName, (entry.categories.get(r.categoryName) ?? 0) + 1)
      }
    })
    return [...yearData.entries()]
      .filter(([, d]) => d.count > 0)
      .map(([year, d]) => ({
        year: String(year),
        devices: d.count,
        avgTops: d.topsCount > 0 ? (d.topsSum / d.topsCount).toFixed(1) : '0',
        categories: [...d.categories.entries()].sort((a, b) => b[1] - a[1]),
      }))
  }, [table, currentYear])

  const eraData = useMemo(() => {
    const eras = [
      { label: '2020-2022', min: 2020, max: 2022 },
      { label: '2023-2024', min: 2023, max: 2024 },
      { label: '2025+', min: 2025, max: Infinity },
    ]
    return eras.map(era => {
      const rows = table.filter(r => {
        const y = new Date(r.launchDate).getFullYear()
        return y >= era.min && y <= era.max
      })
      const catCounts = new Map<string, number>()
      rows.forEach(r => catCounts.set(r.categoryName, (catCounts.get(r.categoryName) ?? 0) + 1))
      return { era: era.label, total: rows.length, categories: [...catCounts.entries()].sort((a, b) => b[1] - a[1]) }
    }).filter(e => e.total > 0)
  }, [table])

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-text-primary">Launch Timeline</h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Devices Launched per Year</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={launchesByYear}>
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
              <Bar dataKey="devices" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Avg INT8 TOPS by Launch Year</h4>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={launchesByYear}>
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
              <Line type="monotone" dataKey="avgTops" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Era breakdown */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-2">Category Distribution by Era</h4>
        <div className="space-y-3">
          {eraData.map(era => (
            <div key={era.era} className="bg-bg-tertiary/30 border border-border-subtle/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">{era.era}</span>
                <span className="text-xs text-text-muted">{era.total} devices</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {era.categories.map(([cat, count]) => {
                  const pct = (count / era.total * 100).toFixed(0)
                  return (
                    <span key={cat} className="px-2 py-0.5 text-xs rounded bg-brand-500/15 text-brand-300">
                      {cat} {pct}%
                    </span>
                  )
                })}
              </div>
              {/* Stacked bar */}
              <div className="mt-2 flex h-3 rounded-full overflow-hidden">
                {era.categories.map(([cat, count], i) => {
                  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1']
                  const pct = count / era.total * 100
                  return <div key={cat} style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }} title={`${cat}: ${count}`} />
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
