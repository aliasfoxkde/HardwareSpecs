import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, ScatterChart, Scatter, LineChart, Line, ComposedChart, Legend } from 'recharts'
import { getDevices, getVendors, getFamilies, getAllDeviceMetrics, getDeviceMetricsTable } from '@/lib/api'
import type { DeviceCategory } from '@/types'

const VENDOR_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#e11d48', '#84cc16']

const CATEGORIES: DeviceCategory[] = ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'Memory', 'Storage']

function CompletenessChart() {
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

function CategoryCoverageChart() {
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

function VendorDistributionChart() {
  const families = useMemo(() => getFamilies(), [])
  const vendors = useMemo(() => getVendors(), [])
  const { devices } = useMemo(() => getDevices({ pageSize: 9999 }), [])

  const vendorMap = new Map(vendors.map(v => [v.vendorId, v]))
  const familyVendorMap = new Map(families.map(f => [f.familyId, f]))

  const data = useMemo(() => {
    const counts = new Map<string, number>()
    devices.forEach(d => {
      const vendorId = familyVendorMap.get(d.device.familyId)?.vendorId ?? ''
      counts.set(vendorId, (counts.get(vendorId) ?? 0) + 1)
    })
    return [...counts.entries()]
      .map(([id, count]) => ({ name: vendorMap.get(id)?.name ?? id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [devices, vendorMap, familyVendorMap])

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-text-primary">Vendor Distribution (Top 10)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="count" nameKey="name" label={({ name, percent }: Record<string, unknown>) => `${name} ${((percent as number) * 100).toFixed(0)}%`} labelLine={{ stroke: '#64748b' }}>
            {data.map((_, i) => <Cell key={i} fill={VENDOR_COLORS[i % VENDOR_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function DataGapsReport() {
  const { devices } = useMemo(() => getDevices({ pageSize: 9999 }), [])
  const metrics = useMemo(() => getAllDeviceMetrics(), [])

  const gaps = useMemo(() => {
    return devices.map(d => {
      const m = metrics.get(d.device.deviceId)
      const missing: string[] = []
      if (!d.device.tdpWatts) missing.push('TDP')
      if (!d.device.processNm) missing.push('Process')
      if (!d.device.memoryCapacityGB) missing.push('Memory')
      if (!m?.latestPrice) missing.push('Price')
      if (m?.effectiveInt8Tops === 0) missing.push('TOPS')
      if (!m?.topBenchmarkScore) missing.push('Benchmarks')
      if (m?.fp16Tflops == null && m?.fp32Tflops == null && m?.fp4Tflops == null) missing.push('Compute Specs')
      if (m?.dataCompleteness < 0.3) missing.push('Low Completeness')
      return { name: d.device.modelName, vendor: d.vendor.name, missing, count: missing.length }
    }).filter(g => g.count > 0).sort((a, b) => b.count - a.count)
  }, [devices, metrics])

  const summary = useMemo(() => {
    const total = devices.length
    const noPrice = devices.filter(d => !metrics.get(d.device.deviceId)?.latestPrice).length
    const noTdp = devices.filter(d => !d.device.tdpWatts).length
    const noTops = devices.filter(d => (metrics.get(d.device.deviceId)?.effectiveInt8Tops ?? 0) === 0).length
    const noBench = devices.filter(d => !metrics.get(d.device.deviceId)?.topBenchmarkScore).length
    return { total, noPrice, noTdp, noTops, noBench }
  }, [devices, metrics])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Data Gaps Report</h3>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-red-400">{summary.noPrice}</div>
          <div className="text-xs text-text-secondary">No Price ({(summary.noPrice / summary.total * 100).toFixed(0)}%)</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-orange-400">{summary.noTdp}</div>
          <div className="text-xs text-text-secondary">No TDP ({(summary.noTdp / summary.total * 100).toFixed(0)}%)</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-yellow-400">{summary.noTops}</div>
          <div className="text-xs text-text-secondary">No TOPS ({(summary.noTops / summary.total * 100).toFixed(0)}%)</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-400">{summary.noBench}</div>
          <div className="text-xs text-text-secondary">No Benchmarks ({(summary.noBench / summary.total * 100).toFixed(0)}%)</div>
        </div>
      </div>

      {/* Gaps table */}
      <div className="overflow-auto max-h-80">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-bg-secondary">
            <tr>
              <th className="px-3 py-2 text-left text-xs text-text-secondary">Device</th>
              <th className="px-3 py-2 text-left text-xs text-text-secondary">Vendor</th>
              <th className="px-3 py-2 text-left text-xs text-text-secondary">Missing Fields</th>
              <th className="px-3 py-2 text-right text-xs text-text-secondary">Count</th>
            </tr>
          </thead>
          <tbody>
            {gaps.slice(0, 50).map((g, i) => (
              <tr key={i} className="border-b border-border-subtle/20">
                <td className="px-3 py-1.5 text-text-primary font-medium">{g.name}</td>
                <td className="px-3 py-1.5 text-text-secondary">{g.vendor}</td>
                <td className="px-3 py-1.5">
                  <div className="flex flex-wrap gap-1">
                    {g.missing.map(m => (
                      <span key={m} className="px-1.5 py-0.5 text-[10px] rounded bg-red-500/20 text-red-400">{m}</span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-1.5 text-right text-text-muted">{g.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {gaps.length > 50 && <div className="text-xs text-text-muted text-center py-2">Showing 50 of {gaps.length} devices with gaps</div>}
      </div>
    </div>
  )
}

function TopPerformersReport() {
  const metrics = useMemo(() => getAllDeviceMetrics(), [])
  const { devices } = useMemo(() => getDevices({ pageSize: 9999 }), [])

  const topTopsPerDollar = useMemo(() => {
    return [...metrics.entries()]
      .filter(([, m]) => m.topsPerDollar != null && m.topsPerDollar > 0)
      .sort((a, b) => (b[1].topsPerDollar ?? 0) - (a[1].topsPerDollar ?? 0))
      .slice(0, 10)
      .map(([id, m]) => {
        const dev = devices.find(d => d.device.deviceId === id)
        return { name: dev?.device.modelName ?? id, value: m.topsPerDollar! }
      })
  }, [metrics, devices])

  const topTopsPerWatt = useMemo(() => {
    return [...metrics.entries()]
      .filter(([, m]) => m.topsPerWatt != null && m.topsPerWatt > 0)
      .sort((a, b) => (b[1].topsPerWatt ?? 0) - (a[1].topsPerWatt ?? 0))
      .slice(0, 10)
      .map(([id, m]) => {
        const dev = devices.find(d => d.device.deviceId === id)
        return { name: dev?.device.modelName ?? id, value: m.topsPerWatt! }
      })
  }, [metrics, devices])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Top Performers</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-green-400 mb-2">TOP 10 TOPS/$ (Value)</h4>
          <div className="space-y-1">
            {topTopsPerDollar.map((d, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-bg-tertiary/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-5">{i + 1}</span>
                  <span className="text-sm text-text-primary">{d.name}</span>
                </div>
                <span className="text-sm font-medium text-green-400">{d.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-blue-400 mb-2">TOP 10 TOPS/W (Efficiency)</h4>
          <div className="space-y-1">
            {topTopsPerWatt.map((d, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-bg-tertiary/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-5">{i + 1}</span>
                  <span className="text-sm text-text-primary">{d.name}</span>
                </div>
                <span className="text-sm font-medium text-blue-400">{d.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PriceAnalysisReport() {
  const table = useMemo(() => getDeviceMetricsTable(), [])
  const families = useMemo(() => getFamilies(), [])
  const familyMap = useMemo(() => new Map(families.map(f => [f.familyId, f])), [families])

  const withPrice = useMemo(() => table.filter(r => r.latestPrice != null && r.latestPrice! > 0), [table])

  const priceByCategory = useMemo(() => {
    const grouped = new Map<string, number[]>()
    withPrice.forEach(r => {
      const arr = grouped.get(r.categoryName) ?? []
      arr.push(r.latestPrice!)
      grouped.set(r.categoryName, arr)
    })
    return [...grouped.entries()]
      .map(([cat, prices]) => {
        const sorted = [...prices].sort((a, b) => a - b)
        const avg = prices.reduce((s, p) => s + p, 0) / prices.length
        const mid = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)]
        return { category: cat, avg: avg.toFixed(0), median: mid.toFixed(0), min: sorted[0].toFixed(0), max: sorted[sorted.length - 1].toFixed(0), count: prices.length }
      })
      .sort((a, b) => Number(b.avg) - Number(a.avg))
  }, [withPrice])

  const priceBands = useMemo(() => {
    const bands = [
      { range: '$0-200', min: 0, max: 200, fill: '#10b981' },
      { range: '$200-500', min: 200, max: 500, fill: '#3b82f6' },
      { range: '$500-1000', min: 500, max: 1000, fill: '#f59e0b' },
      { range: '$1000-2000', min: 1000, max: 2000, fill: '#f97316' },
      { range: '$2000+', min: 2000, max: Infinity, fill: '#ef4444' },
    ]
    return bands.map(b => ({ ...b, count: withPrice.filter(r => r.latestPrice! >= b.min && r.latestPrice! < b.max).length }))
  }, [withPrice])

  const scatterData = useMemo(() => {
    return table
      .filter(r => r.latestPrice != null && r.latestPrice! > 0 && r.effectiveInt8Tops > 0)
      .sort((a, b) => b.effectiveInt8Tops - a.effectiveInt8Tops)
      .slice(0, 50)
      .map(r => ({ name: r.modelName, price: r.latestPrice!, tops: r.effectiveInt8Tops, category: r.categoryName }))
  }, [table])

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-text-primary">Price Analysis</h3>

      {/* Price by category table */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-2">Price Stats by Category (USD)</h4>
        <div className="overflow-auto max-h-60">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-bg-secondary">
              <tr>
                <th className="px-3 py-2 text-left text-xs text-text-secondary">Category</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">Count</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">Avg</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">Median</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">Min</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">Max</th>
              </tr>
            </thead>
            <tbody>
              {priceByCategory.map(r => (
                <tr key={r.category} className="border-b border-border-subtle/20">
                  <td className="px-3 py-1.5 text-text-primary font-medium">{r.category}</td>
                  <td className="px-3 py-1.5 text-right text-text-muted">{r.count}</td>
                  <td className="px-3 py-1.5 text-right text-text-primary">${r.avg}</td>
                  <td className="px-3 py-1.5 text-right text-text-secondary">${r.median}</td>
                  <td className="px-3 py-1.5 text-right text-text-muted">${r.min}</td>
                  <td className="px-3 py-1.5 text-right text-text-muted">${r.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price bands */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-2">Price Band Distribution ({withPrice.length} devices with price)</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={priceBands}>
            <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {priceBands.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Price vs TOPS scatter */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-2">Price vs INT8 TOPS (Top 50)</h4>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart>
            <XAxis type="number" dataKey="price" name="Price" tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'Price ($)', position: 'insideBottom', offset: -5, style: { fill: '#64748b', fontSize: 11 } }} />
            <YAxis type="number" dataKey="tops" name="TOPS" tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'INT8 TOPS', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 11 } }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} formatter={(value: number, name: string) => [name === 'price' ? `$${value.toLocaleString()}` : value.toLocaleString(), name === 'price' ? 'Price' : 'INT8 TOPS']} />
            <Scatter data={scatterData} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ProcessNodeReport() {
  const table = useMemo(() => getDeviceMetricsTable(), [])

  const BUCKETS = ['5nm', '7nm', '10nm', '12nm', '14nm', '16nm', '20nm', '28nm', '35nm+', 'Unknown'] as const

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
    BUCKETS.forEach(b => grouped.set(b, { count: 0, topsSum: 0, topsPerWSum: 0, topsPerWCount: 0 }))

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

    return BUCKETS.map(b => {
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

function MemoryAnalysisReport() {
  const table = useMemo(() => getDeviceMetricsTable(), [])
  const families = useMemo(() => getFamilies(), [])
  const familyMap = useMemo(() => new Map(families.map(f => [f.familyId, f])), [families])

  const MEMORY_TYPES = ['GDDR6', 'GDDR6X', 'GDDR7', 'HBM2', 'HBM2e', 'HBM3', 'LPDDR5', 'LPDDR5X', 'DDR5', 'None/Unknown'] as const
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
              <Pie data={memoryTypePie} cx="50%" cy="50%" outerRadius={85} innerRadius={40} dataKey="value" nameKey="name" label={({ name, percent }: Record<string, unknown>) => `${name} ${((percent as number) * 100).toFixed(0)}%`} labelLine={{ stroke: '#64748b' }}>
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

function VendorDeepDiveReport() {
  const table = useMemo(() => getDeviceMetricsTable(), [])
  const vendors = useMemo(() => getVendors(), [])
  const families = useMemo(() => getFamilies(), [])
  const familyMap = useMemo(() => new Map(families.map(f => [f.familyId, f])), [families])

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

function LaunchTimelineReport() {
  const table = useMemo(() => getDeviceMetricsTable(), [])
  const families = useMemo(() => getFamilies(), [])
  const familyMap = useMemo(() => new Map(families.map(f => [f.familyId, f])), [families])

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

const REPORTS = [
  { id: 'overview', name: 'Overview', icon: '📊', description: 'Data completeness distribution and summary stats', component: CompletenessChart },
  { id: 'categories', name: 'Categories', icon: '📁', description: 'Device and data coverage by category', component: CategoryCoverageChart },
  { id: 'vendors', name: 'Vendors', icon: '🏢', description: 'Vendor distribution and device counts', component: VendorDistributionChart },
  { id: 'gaps', name: 'Data Gaps', icon: '🔍', description: 'Devices missing key data fields', component: DataGapsReport },
  { id: 'performers', name: 'Top Performers', icon: '🏆', description: 'Best value and efficiency rankings', component: TopPerformersReport },
  { id: 'price', name: 'Price Analysis', icon: '💵', description: 'Price distribution, value bands, and price vs performance', component: PriceAnalysisReport },
  { id: 'process', name: 'Process Node', icon: '🔬', description: 'Process technology analysis and performance correlation', component: ProcessNodeReport },
  { id: 'memory', name: 'Memory', icon: '🧠', description: 'Memory types, capacity, and bandwidth analysis', component: MemoryAnalysisReport },
  { id: 'vendor-deep', name: 'Vendor Deep Dive', icon: '🏢', description: 'Detailed vendor-level analysis and comparison', component: VendorDeepDiveReport },
  { id: 'timeline', name: 'Timeline', icon: '📅', description: 'Launch dates, trends, and generational analysis', component: LaunchTimelineReport },
] as const

export function ReportsPage() {
  const [activeReport, setActiveReport] = useState<string>('overview')
  const ActiveComponent = REPORTS.find(r => r.id === activeReport)?.component ?? CompletenessChart

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        <p className="text-sm text-text-secondary mt-1">Data quality, coverage analysis, and performance rankings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {REPORTS.map(report => (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className={`px-4 py-3 rounded-lg text-left text-sm whitespace-nowrap transition-colors ${
                  activeReport === report.id
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent'
                }`}
              >
                <span className="mr-2">{report.icon}</span>
                {report.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active report */}
        <div className="flex-1 bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6 min-w-0">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}
