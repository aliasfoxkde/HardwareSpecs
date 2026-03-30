import { useMemo } from 'react'
import { getDevicesByCategory } from '@/lib/api'
import { getVendorColor, formatNumber } from './chartUtils'
import type { DeviceCategory } from '@/types'

export function PriceTdpHeatmap({ category }: { category: DeviceCategory }) {
  const data = useMemo(() => {
    const devices = getDevicesByCategory(category)
    return devices
      .filter(d => d.latestPrice && d.device.tdpWatts)
      .map(d => ({
        name: d.device.modelName.length > 22 ? d.device.modelName.slice(0, 20) + '..' : d.device.modelName,
        fullName: d.device.modelName,
        vendor: d.vendor.name,
        vendorId: d.vendor.vendorId,
        price: d.latestPrice!.priceUsd,
        tdp: d.device.tdpWatts!,
      }))
  }, [category])

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">No price+TDP data for {category}</div>
  }

  const maxPrice = Math.max(...data.map(d => d.price))
  const maxTdp = Math.max(...data.map(d => d.tdp))
  const maxArea = maxPrice * maxTdp

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-end gap-1 text-xs text-text-muted px-1">
        <div className="w-28 shrink-0" />
        <div className="flex-1 text-center">Price →</div>
      </div>

      {/* Rows */}
      {data.slice(0, 15).map(d => {
        const xPct = (d.price / maxPrice) * 100
        const area = d.price * d.tdp
        const intensity = Math.min(area / maxArea, 1)
        const bgOpacity = 0.2 + intensity * 0.6

        return (
          <div key={d.fullName} className="flex items-center gap-1" title={`${d.fullName}: $${d.price.toLocaleString()}, ${d.tdp}W`}>
            <div className="w-28 shrink-0 text-xs text-text-secondary truncate">{d.name}</div>
            <div className="flex-1 relative h-6 bg-bg-tertiary/30 rounded overflow-hidden">
              <div
                className="absolute inset-0 rounded"
                style={{
                  backgroundColor: getVendorColor(d.vendorId),
                  opacity: bgOpacity,
                  width: `${xPct}%`,
                  marginLeft: 'auto',
                }}
              />
            </div>
            <div className="w-12 text-right text-xs text-text-muted">
              ${d.price >= 1000 ? `${(d.price / 1000).toFixed(1)}k` : d.price}
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
        <span>Low price/TDP</span>
        <div className="flex-1 h-2 bg-bg-tertiary/30 rounded overflow-hidden">
          <div className="h-full rounded bg-brand-500" style={{ opacity: 0.2, width: '100%' }} />
        </div>
        <span>High price/TDP</span>
      </div>
    </div>
  )
}

export function VendorPerfHeatmap({ category }: { category: DeviceCategory }) {
  const data = useMemo(() => {
    const devices = getDevicesByCategory(category)
    const vendorMap: Record<string, { tops: number; topsPerDollar: number; topsPerWatt: number; count: number; name: string }> = {}

    for (const d of devices) {
      const vId = d.vendor.vendorId
      if (!vendorMap[vId]) {
        vendorMap[vId] = { tops: 0, topsPerDollar: 0, topsPerWatt: 0, count: 0, name: d.vendor.name }
      }
      const vm = vendorMap[vId]
      vm.count++
      vm.tops += d.metrics.effectiveInt8Tops
      if (d.metrics.topsPerDollar != null) vm.topsPerDollar += d.metrics.topsPerDollar
      if (d.metrics.topsPerWatt != null) vm.topsPerWatt += d.metrics.topsPerWatt
    }

    return Object.entries(vendorMap)
      .filter(([, v]) => v.count >= 2)
      .map(([vId, v]) => ({
        vendorId: vId,
        name: v.name,
        avgTops: Math.round(v.tops / v.count),
        avgTopsPerDollar: v.topsPerDollar > 0 ? Math.round(v.topsPerDollar / v.count * 10) / 10 : 0,
        avgTopsPerWatt: v.topsPerWatt > 0 ? Math.round(v.topsPerWatt / v.count * 10) / 10 : 0,
        count: v.count,
      }))
      .sort((a, b) => b.avgTops - a.avgTops)
  }, [category])

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">No vendor data for {category}</div>
  }

  const maxTops = Math.max(...data.map(d => d.avgTops))
  const maxTpd = Math.max(...data.map(d => d.avgTopsPerDollar))
  const maxTpw = Math.max(...data.map(d => d.avgTopsPerWatt))

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-[100px_1fr_1fr_1fr_50px] gap-2 text-xs font-semibold text-text-secondary mb-2 px-1">
        <div>Vendor</div>
        <div className="text-center">Avg TOPS</div>
        <div className="text-center">Avg TOPS/$</div>
        <div className="text-center">Avg TOPS/W</div>
        <div className="text-right">#</div>
      </div>

      {/* Rows */}
      {data.map(d => (
        <div key={d.vendorId} className="grid grid-cols-[100px_1fr_1fr_1fr_50px] gap-2 items-center py-1.5 px-1 rounded hover:bg-bg-tertiary/30">
          <div className="text-sm text-text-primary font-medium truncate">{d.name}</div>
          <div className="relative h-5">
            <div
              className="absolute inset-y-0 left-0 rounded bg-brand-500/30"
              style={{ width: `${(d.avgTops / maxTops) * 100}%` }}
            />
            <div className="absolute inset-y-0 left-1 flex items-center text-xs text-text-primary font-medium">
              {formatNumber(d.avgTops, 0)}
            </div>
          </div>
          <div className="relative h-5">
            <div
              className="absolute inset-y-0 left-0 rounded bg-green-500/30"
              style={{ width: `${(d.avgTopsPerDollar / maxTpd) * 100}%` }}
            />
            <div className="absolute inset-y-0 left-1 flex items-center text-xs text-green-400 font-medium">
              {formatNumber(d.avgTopsPerDollar)}
            </div>
          </div>
          <div className="relative h-5">
            <div
              className="absolute inset-y-0 left-0 rounded bg-blue-500/30"
              style={{ width: `${(d.avgTopsPerWatt / maxTpw) * 100}%` }}
            />
            <div className="absolute inset-y-0 left-1 flex items-center text-xs text-blue-400 font-medium">
              {formatNumber(d.avgTopsPerWatt)}
            </div>
          </div>
          <div className="text-xs text-text-muted text-right">{d.count}</div>
        </div>
      ))}
    </div>
  )
}
