import { useMemo } from 'react'
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getDevices, getVendors, getFamilies } from '@/lib/api'

const VENDOR_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#e11d48', '#84cc16']

export function VendorDistributionChart() {
  const families = useMemo(() => getFamilies(), [])
  const vendors = useMemo(() => getVendors(), [])
  const { devices } = useMemo(() => getDevices({ pageSize: 9999 }), [])

  const data = useMemo(() => {
    const vendorMap = new Map(vendors.map(v => [v.vendorId, v]))
    const familyVendorMap = new Map(families.map(f => [f.familyId, f]))
    const counts = new Map<string, number>()
    devices.forEach(d => {
      const vendorId = familyVendorMap.get(d.device.familyId)?.vendorId ?? ''
      counts.set(vendorId, (counts.get(vendorId) ?? 0) + 1)
    })
    return [...counts.entries()]
      .map(([id, count]) => ({ name: vendorMap.get(id)?.name ?? id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [devices, vendors, families])

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-text-primary">Vendor Distribution (Top 10)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="count" nameKey="name" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={{ stroke: '#64748b' }}>
            {data.map((_, i) => <Cell key={i} fill={VENDOR_COLORS[i % VENDOR_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
