import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getDevices, getFamilies, getAllDeviceMetrics } from '@/lib/api'
import type { DeviceCategory } from '@/types'

const CATEGORIES: DeviceCategory[] = ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'Memory', 'Storage']

export function CategoryCoverageChart() {
  const families = useMemo(() => getFamilies(), [])
  const { devices } = useMemo(() => getDevices({ pageSize: 9999 }), [])
  const metrics = useMemo(() => getAllDeviceMetrics(), [])

  const data = useMemo(() => {
    const familyMap = new Map(families.map(f => [f.familyId, f]))
    return CATEGORIES.map(cat => {
      const catDevices = devices.filter(d => familyMap.get(d.device.familyId)?.category === cat)
      const avgComp = catDevices.length > 0
        ? catDevices.reduce((s, d) => s + (metrics.get(d.device.deviceId)?.dataCompleteness ?? 0), 0) / catDevices.length * 100
        : 0
      return { category: cat, devices: catDevices.length, avgCompleteness: avgComp.toFixed(1) }
    }).filter(d => d.devices > 0)
  }, [families, devices, metrics])

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-text-primary">Category Coverage</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis type="category" dataKey="category" tick={{ fill: '#94a3b8', fontSize: 12 }} width={50} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
          <Bar dataKey="devices" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
