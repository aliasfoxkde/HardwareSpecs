import { useMemo } from 'react'
import { getDevices, getAllDeviceMetrics } from '@/lib/api'

export function DataGapsReport() {
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
      if ((m?.dataCompleteness ?? 0) < 0.3) missing.push('Low Completeness')
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
