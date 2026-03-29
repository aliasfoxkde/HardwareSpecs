import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { getDevices, getVendors, getFamilies, getAllDeviceMetrics, getBenchmarkTypes } from '@/lib/api'
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
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="count" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#64748b' }}>
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

const REPORTS = [
  { id: 'overview', name: 'Overview', icon: '📊', description: 'Data completeness distribution and summary stats', component: CompletenessChart },
  { id: 'categories', name: 'Categories', icon: '📁', description: 'Device and data coverage by category', component: CategoryCoverageChart },
  { id: 'vendors', name: 'Vendors', icon: '🏢', description: 'Vendor distribution and device counts', component: VendorDistributionChart },
  { id: 'gaps', name: 'Data Gaps', icon: '🔍', description: 'Devices missing key data fields', component: DataGapsReport },
  { id: 'performers', name: 'Top Performers', icon: '🏆', description: 'Best value and efficiency rankings', component: TopPerformersReport },
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
