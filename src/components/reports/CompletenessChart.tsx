import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getAllDeviceMetrics } from '@/lib/api'

export function CompletenessChart() {
  const metrics = useMemo(() => getAllDeviceMetrics(), [])

  const distribution = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0] // 0-20, 20-40, 40-60, 60-80, 80-100
    metrics.forEach(m => {
      const pct = m.dataCompleteness * 100
      if (pct < 20) buckets[0]++
      else if (pct < 40) buckets[1]++
      else if (pct < 60) buckets[2]++
      else if (pct < 80) buckets[3]++
      else buckets[4]++
    })
    return [
      { range: '0-20%', count: buckets[0], fill: '#ef4444' },
      { range: '20-40%', count: buckets[1], fill: '#f97316' },
      { range: '40-60%', count: buckets[2], fill: '#f59e0b' },
      { range: '60-80%', count: buckets[3], fill: '#3b82f6' },
      { range: '80-100%', count: buckets[4], fill: '#10b981' },
    ]
  }, [metrics])

  const avgCompleteness = useMemo(() => {
    let sum = 0
    metrics.forEach(m => sum += m.dataCompleteness)
    return metrics.size > 0 ? (sum / metrics.size * 100) : 0
  }, [metrics])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Data Completeness Distribution</h3>
        <span className="text-sm text-text-secondary">Avg: {avgCompleteness.toFixed(1)}%</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={distribution}>
          <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {distribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
