import { useMemo } from 'react'
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, ScatterChart, Scatter } from 'recharts'
import { getDeviceMetricsTable } from '@/lib/api'

const MEMORY_TYPES = ['GDDR6', 'GDDR6X', 'GDDR7', 'HBM2', 'HBM2e', 'HBM3', 'LPDDR5', 'LPDDR5X', 'DDR5', 'None/Unknown'] as const

export function MemoryAnalysisReport() {
  const table = useMemo(() => getDeviceMetricsTable(), [])
  const MEMORY_COLORS: Record<string, string> = {
    'GDDR6': '#3b82f6', 'GDDR6X': '#6366f1', 'GDDR7': '#8b5cf6',
    'HBM2': '#ef4444', 'HBM2e': '#f97316', 'HBM3': '#e11d48',
    'LPDDR5': '#10b981', 'LPDDR5X': '#06b6d4', 'DDR5': '#f59e0b',
    'None/Unknown': '#475569',
  }

  const memoryTypePie = useMemo(() => {
    const counts = new Map<string, number>()
    MEMORY_TYPES.forEach(t => counts.set(t, 0))
    table.forEach(r => {
      const t = r.memoryType ?? 'None/Unknown'
      if (counts.has(t)) counts.set(t, (counts.get(t) ?? 0) + 1)
      else counts.set('None/Unknown', (counts.get('None/Unknown') ?? 0) + 1)
    })
    return [...counts.entries()]
      .filter(([, count]) => count > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [table])

  const avgMemByCategory = useMemo(() => {
    const grouped = new Map<string, { total: number; count: number }>()
    table.forEach(r => {
      if (r.memoryCapacityGB != null && r.memoryCapacityGB > 0) {
        const entry = grouped.get(r.categoryName) ?? { total: 0, count: 0 }
        entry.total += r.memoryCapacityGB!
        entry.count++
        grouped.set(r.categoryName, entry)
      }
    })
    return [...grouped.entries()]
      .map(([cat, d]) => ({ category: cat, avgGB: (d.total / d.count).toFixed(1), count: d.count }))
      .sort((a, b) => Number(b.avgGB) - Number(a.avgGB))
  }, [table])

  const memBwScatter = useMemo(() => {
    return table
      .filter(r => r.memoryBandwidthGBps != null && r.memoryBandwidthGBps! > 0 && r.effectiveInt8Tops > 0)
      .map(r => ({ name: r.modelName, bandwidth: r.memoryBandwidthGBps!, tops: r.effectiveInt8Tops, category: r.categoryName }))
  }, [table])

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-text-primary">Memory Analysis</h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Memory Type Distribution</h4>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={memoryTypePie} cx="50%" cy="50%" outerRadius={85} innerRadius={40} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={{ stroke: '#64748b' }}>
                {memoryTypePie.map((entry) => <Cell key={entry.name} fill={MEMORY_COLORS[entry.name] ?? '#475569'} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Avg Memory Capacity by Category (GB)</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={avgMemByCategory} layout="vertical">
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis type="category" dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} width={50} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
              <Bar dataKey="avgGB" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-2">Memory Bandwidth vs INT8 TOPS ({memBwScatter.length} devices)</h4>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart>
            <XAxis type="number" dataKey="bandwidth" name="Bandwidth" tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'Bandwidth (GB/s)', position: 'insideBottom', offset: -5, style: { fill: '#64748b', fontSize: 11 } }} />
            <YAxis type="number" dataKey="tops" name="TOPS" tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'INT8 TOPS', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 11 } }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
            <Scatter data={memBwScatter} fill="#8b5cf6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
