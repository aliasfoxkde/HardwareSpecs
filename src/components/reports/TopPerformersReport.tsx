import { useMemo } from 'react'
import { getDevices, getAllDeviceMetrics } from '@/lib/api'

export function TopPerformersReport() {
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
