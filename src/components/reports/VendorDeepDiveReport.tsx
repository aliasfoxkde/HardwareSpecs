import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getDeviceMetricsTable, getVendors } from '@/lib/api'

export function VendorDeepDiveReport() {
  const table = useMemo(() => getDeviceMetricsTable(), [])
  const vendors = useMemo(() => getVendors(), [])

  const qualifiedVendors = useMemo(() => {
    const counts = new Map<string, number>()
    table.forEach(r => counts.set(r.vendorId, (counts.get(r.vendorId) ?? 0) + 1))
    return [...counts.entries()]
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id, name: vendors.find(v => v.vendorId === id)?.name ?? id, count }))
  }, [table, vendors])

  const [selectedVendorId, setSelectedVendorId] = useState<string>(qualifiedVendors[0]?.id ?? '')

  const selectedVendor = useMemo(() => {
    return qualifiedVendors.find(v => v.id === selectedVendorId) ?? qualifiedVendors[0]
  }, [selectedVendorId, qualifiedVendors])

  const vendorStats = useMemo(() => {
    if (!selectedVendor) return null
    const rows = table.filter(r => r.vendorId === selectedVendor.id)
    const categories = new Map<string, number>()
    rows.forEach(r => categories.set(r.categoryName, (categories.get(r.categoryName) ?? 0) + 1))

    const withPrice = rows.filter(r => r.latestPrice != null)
    const avgPrice = withPrice.length > 0 ? withPrice.reduce((s, r) => s + r.latestPrice!, 0) / withPrice.length : null
    const avgTops = rows.length > 0 ? rows.reduce((s, r) => s + r.effectiveInt8Tops, 0) / rows.length : 0
    const avgCompleteness = rows.length > 0 ? rows.reduce((s, r) => s + r.dataCompleteness, 0) / rows.length * 100 : 0

    return { totalDevices: rows.length, categories: [...categories.entries()].sort((a, b) => b[1] - a[1]), avgPrice, avgTops, avgCompleteness }
  }, [selectedVendor, table])

  const vendorTopsData = useMemo(() => {
    if (!selectedVendor) return []
    return table
      .filter(r => r.vendorId === selectedVendor.id && r.effectiveInt8Tops > 0)
      .sort((a, b) => b.effectiveInt8Tops - a.effectiveInt8Tops)
      .slice(0, 15)
      .map(r => ({ name: r.modelName.length > 18 ? r.modelName.slice(0, 18) + '...' : r.modelName, tops: r.effectiveInt8Tops }))
  }, [selectedVendor, table])

  const vendorValueData = useMemo(() => {
    if (!selectedVendor) return []
    return table
      .filter(r => r.vendorId === selectedVendor.id && r.topsPerDollar != null && r.topsPerDollar! > 0)
      .sort((a, b) => (b.topsPerDollar ?? 0) - (a.topsPerDollar ?? 0))
      .slice(0, 15)
      .map(r => ({ name: r.modelName.length > 18 ? r.modelName.slice(0, 18) + '...' : r.modelName, topsPerDollar: r.topsPerDollar! }))
  }, [selectedVendor, table])

  if (qualifiedVendors.length === 0) {
    return <div className="text-text-secondary">Not enough vendor data (need 3+ devices per vendor).</div>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Vendor Deep Dive</h3>
        <select
          value={selectedVendorId}
          onChange={e => setSelectedVendorId(e.target.value)}
          className="bg-bg-tertiary border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {qualifiedVendors.map(v => (
            <option key={v.id} value={v.id}>{v.name} ({v.count})</option>
          ))}
        </select>
      </div>

      {vendorStats && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-400">{vendorStats.totalDevices}</div>
              <div className="text-xs text-text-secondary">Total Devices</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-400">{vendorStats.avgTops.toFixed(1)}</div>
              <div className="text-xs text-text-secondary">Avg INT8 TOPS</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-400">{vendorStats.avgPrice != null ? `$${vendorStats.avgPrice.toFixed(0)}` : 'N/A'}</div>
              <div className="text-xs text-text-secondary">Avg Price</div>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-cyan-400">{vendorStats.avgCompleteness.toFixed(1)}%</div>
              <div className="text-xs text-text-secondary">Avg Completeness</div>
            </div>
          </div>

          {/* Category breakdown */}
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {vendorStats.categories.map(([cat, count]) => (
                <span key={cat} className="px-2.5 py-1 text-xs rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/20">
                  {cat}: {count}
                </span>
              ))}
            </div>
          </div>

          {/* TOPS chart */}
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-2">Top Devices by INT8 TOPS</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vendorTopsData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={140} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
                <Bar dataKey="tops" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* TOPS/$ chart */}
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-2">Top Devices by TOPS/$</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vendorValueData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={140} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
                <Bar dataKey="topsPerDollar" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
