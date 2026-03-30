import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getDeviceMetricsTable } from '@/lib/api'

const PROCESS_BUCKETS = ['5nm', '7nm', '10nm', '12nm', '14nm', '16nm', '20nm', '28nm', '35nm+', 'Unknown'] as const

export function ProcessNodeReport() {
  const table = useMemo(() => getDeviceMetricsTable(), [])

  const bucketForNm = (nm: number | null): string => {
    if (nm == null) return 'Unknown'
    if (nm <= 6) return '5nm'
    if (nm <= 8) return '7nm'
    if (nm <= 11) return '10nm'
    if (nm <= 13) return '12nm'
    if (nm <= 15) return '14nm'
    if (nm <= 18) return '16nm'
    if (nm <= 24) return '20nm'
    if (nm <= 32) return '28nm'
    return '35nm+'
  }

  const bucketData = useMemo(() => {
    const grouped = new Map<string, { count: number; topsSum: number; topsPerWSum: number; topsPerWCount: number }>()
    PROCESS_BUCKETS.forEach(b => grouped.set(b, { count: 0, topsSum: 0, topsPerWSum: 0, topsPerWCount: 0 }))

    table.forEach(r => {
      const bucket = bucketForNm(r.processNm)
      const entry = grouped.get(bucket)!
      entry.count++
      entry.topsSum += r.effectiveInt8Tops
      if (r.topsPerWatt != null && r.topsPerWatt > 0) {
        entry.topsPerWSum += r.topsPerWatt
        entry.topsPerWCount++
      }
    })

    return PROCESS_BUCKETS.map(b => {
      const e = grouped.get(b)!
      return {
        node: b,
        count: e.count,
        avgTops: e.count > 0 ? (e.topsSum / e.count).toFixed(1) : '0',
        avgTopsPerW: e.topsPerWCount > 0 ? (e.topsPerWSum / e.topsPerWCount).toFixed(2) : '0',
      }
    }).filter(d => d.count > 0)
  }, [table])

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-text-primary">Process Node Analysis</h3>

      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-2">Devices by Process Node</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={bucketData}>
            <XAxis dataKey="node" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Avg INT8 TOPS by Process Node</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bucketData}>
              <XAxis dataKey="node" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
              <Bar dataKey="avgTops" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Avg TOPS/W by Process Node</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bucketData}>
              <XAxis dataKey="node" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
              <Bar dataKey="avgTopsPerW" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
