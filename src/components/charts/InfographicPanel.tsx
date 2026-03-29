import { useMemo } from 'react'
import { getDeviceMetricsTable, getFamilies } from '@/lib/api'
import { formatNumber } from './chartUtils'

export function InfographicPanel({ category }: { category: string }) {
  const stats = useMemo(() => {
    const table = getDeviceMetricsTable().filter(m => m.categoryName === category)
    const families = getFamilies().filter(f => f.category === category)

    const totalDevices = table.length
    const vendorsCount = new Set(table.map(m => m.vendorId)).size

    // TOPS stats
    const topsValues = table.map(m => m.effectiveInt8Tops).filter(v => v > 0)
    const maxTops = topsValues.length > 0 ? Math.max(...topsValues) : 0
    const avgTops = topsValues.length > 0 ? topsValues.reduce((s, v) => s + v, 0) / topsValues.length : 0

    // TOPS/$
    const tpdValues = table.map(m => m.topsPerDollar).filter((v): v is number => v != null && v > 0)
    const bestTopsPerDollar = tpdValues.length > 0 ? Math.max(...tpdValues) : 0
    const avgTopsPerDollar = tpdValues.length > 0 ? tpdValues.reduce((s, v) => s + v, 0) / tpdValues.length : 0

    // TOPS/W
    const tpwValues = table.map(m => m.topsPerWatt).filter((v): v is number => v != null && v > 0)
    const bestTopsPerWatt = tpwValues.length > 0 ? Math.max(...tpwValues) : 0

    // Price
    const priceValues = table.map(m => m.latestPrice).filter((v): v is number => v != null)
    const avgPrice = priceValues.length > 0 ? priceValues.reduce((s, v) => s + v, 0) / priceValues.length : 0
    const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0

    // TDP
    const tdpValues = table.map(m => m.tdpWatts).filter((v): v is number => v != null)
    const avgTdp = tdpValues.length > 0 ? tdpValues.reduce((s, v) => s + v, 0) / tdpValues.length : 0

    // Top device by TOPS
    const topDevice = topsValues.length > 0
      ? table.find(m => m.effectiveInt8Tops === maxTops)
      : null

    // Best value device
    const bestValueDevice = tpdValues.length > 0
      ? table.find(m => m.topsPerDollar === bestTopsPerDollar)
      : null

    // Most efficient
    const mostEfficientDevice = tpwValues.length > 0
      ? table.find(m => m.topsPerWatt === bestTopsPerWatt)
      : null

    // Date range
    const dates = table.map(m => m.launchDate).filter(d => d).sort()
    const dateRange = dates.length >= 2 ? `${dates[0]} — ${dates[dates.length - 1]}` : dates[0] ?? 'N/A'

    // Vendor breakdown
    const vendorCounts: Record<string, { name: string; count: number; tops: number }> = {}
    for (const m of table) {
      if (!vendorCounts[m.vendorId]) {
        vendorCounts[m.vendorId] = { name: m.vendorName, count: 0, tops: 0 }
      }
      vendorCounts[m.vendorId].count++
      vendorCounts[m.vendorId].tops += m.effectiveInt8Tops
    }
    const topVendors = Object.values(vendorCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalDevices, vendorsCount, familiesCount: families.length,
      maxTops, avgTops, bestTopsPerDollar, avgTopsPerDollar, bestTopsPerWatt,
      avgPrice, minPrice, avgTdp,
      topDevice, bestValueDevice, mostEfficientDevice,
      dateRange, topVendors,
      topsCoverage: topsValues.length > 0 ? Math.round(topsValues.length / totalDevices * 100) : 0,
      priceCoverage: priceValues.length > 0 ? Math.round(priceValues.length / totalDevices * 100) : 0,
    }
  }, [category])

  return (
    <div className="space-y-4">
      {/* Key stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Devices" value={stats.totalDevices.toLocaleString()} accent="text-brand-400" />
        <StatCard label="Vendors" value={stats.vendorsCount.toString()} accent="text-blue-400" />
        <StatCard label="Families" value={stats.familiesCount.toString()} accent="text-purple-400" />
        <StatCard label="Date Range" value={stats.dateRange} accent="text-text-secondary" />
      </div>

      {/* Performance row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Peak INT8 TOPS" value={formatNumber(stats.maxTops, 0)} accent="text-brand-400" />
        <StatCard label="Avg INT8 TOPS" value={formatNumber(stats.avgTops, 0)} accent="text-brand-300" />
        <StatCard label="Best TOPS/$" value={formatNumber(stats.bestTopsPerDollar)} accent="text-green-400" />
        <StatCard label="Best TOPS/W" value={formatNumber(stats.bestTopsPerWatt)} accent="text-blue-400" />
      </div>

      {/* Price & Power row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Avg Price" value={stats.avgPrice > 0 ? `$${Math.round(stats.avgPrice).toLocaleString()}` : '-'} accent="text-yellow-400" />
        <StatCard label="Min Price" value={stats.minPrice > 0 ? `$${Math.round(stats.minPrice)}` : '-'} accent="text-green-400" />
        <StatCard label="Avg TDP" value={stats.avgTdp > 0 ? `${Math.round(stats.avgTdp)}W` : '-'} accent="text-red-400" />
      </div>

      {/* Data coverage */}
      <div className="bg-bg-tertiary/30 rounded-lg p-3">
        <div className="text-xs text-text-muted font-semibold uppercase mb-2">Data Coverage</div>
        <div className="flex gap-4">
          <CoverageBar label="TOPS" pct={stats.topsCoverage} color="bg-brand-500" />
          <CoverageBar label="Price" pct={stats.priceCoverage} color="bg-green-500" />
        </div>
      </div>

      {/* Top devices */}
      <div className="bg-bg-tertiary/30 rounded-lg p-3 space-y-2">
        <div className="text-xs text-text-muted font-semibold uppercase">Highlights</div>
        {stats.topDevice && (
          <HighlightRow label="Most Powerful" name={stats.topDevice.modelName} value={`${formatNumber(stats.topDevice.effectiveInt8Tops, 0)} TOPS`} vendor={stats.topDevice.vendorName} />
        )}
        {stats.bestValueDevice && (
          <HighlightRow label="Best Value" name={stats.bestValueDevice.modelName} value={`${formatNumber(stats.bestValueDevice.topsPerDollar)} TOPS/$`} vendor={stats.bestValueDevice.vendorName} />
        )}
        {stats.mostEfficientDevice && (
          <HighlightRow label="Most Efficient" name={stats.mostEfficientDevice.modelName} value={`${formatNumber(stats.mostEfficientDevice.topsPerWatt)} TOPS/W`} vendor={stats.mostEfficientDevice.vendorName} />
        )}
      </div>

      {/* Vendor breakdown */}
      <div className="bg-bg-tertiary/30 rounded-lg p-3">
        <div className="text-xs text-text-muted font-semibold uppercase mb-2">Top Vendors</div>
        {stats.topVendors.map(v => (
          <div key={v.name} className="flex items-center justify-between py-1">
            <span className="text-sm text-text-primary">{v.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted">{v.count} devices</span>
              <span className="text-xs text-text-secondary w-20 text-right">{formatNumber(v.tops / v.count, 0)} avg TOPS</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-bg-tertiary/30 rounded-lg p-3">
      <div className="text-[10px] text-text-muted uppercase">{label}</div>
      <div className={`text-lg font-bold ${accent}`}>{value}</div>
    </div>
  )
}

function CoverageBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-muted">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function HighlightRow({ label, name, value, vendor }: { label: string; name: string; value: string; vendor: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-xs text-text-muted">{label}</span>
        <div className="text-sm text-text-primary font-medium">{name}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-brand-400">{value}</div>
        <div className="text-xs text-text-muted">{vendor}</div>
      </div>
    </div>
  )
}
