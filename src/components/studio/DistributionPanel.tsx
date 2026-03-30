import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { CHART_STYLES } from '@/components/charts/chartUtils'
import type { DeviceMetricsRow } from '@/lib/api'

function MiniBar({ data, color }: { data: { range: string; count: number }[]; color: string }) {
  const _max = Math.max(...data.map(d => d.count), 1)
  void _max
  return (
    <ResponsiveContainer width="100%" height={data.length * 22}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 55 }}>
        <XAxis type="number" hide tick={false} />
        <YAxis type="category" dataKey="range" tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} width={50} />
        <Tooltip contentStyle={{ backgroundColor: CHART_STYLES.tooltipBg, border: `1px solid ${CHART_STYLES.tooltipBorder}`, borderRadius: '8px', color: CHART_STYLES.tooltipText, fontSize: 12 }} />
        <Bar dataKey="count" fill={color} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DistributionPanel({ data }: { data: DeviceMetricsRow[] }) {
  const filtered = useMemo(() => data.filter(d => d.effectiveInt8Tops > 0), [data])

  const topDistribution = useMemo(() => {
    const buckets = [
      { range: '0-1', min: 0, max: 1 },
      { range: '1-10', min: 1, max: 10 },
      { range: '10-50', min: 10, max: 50 },
      { range: '50-100', min: 50, max: 100 },
      { range: '100-500', min: 100, max: 500 },
      { range: '500-1000', min: 500, max: 1000 },
      { range: '1000+', min: 1000, max: Infinity },
    ]
    return buckets.map(b => ({
      range: b.range,
      count: filtered.filter(d => d.effectiveInt8Tops >= b.min && d.effectiveInt8Tops < b.max).length,
    }))
  }, [filtered])

  const tdpDistribution = useMemo(() => {
    const buckets = [
      { range: '0-50W', min: 0, max: 50 },
      { range: '50-100W', min: 50, max: 100 },
      { range: '100-200W', min: 100, max: 200 },
      { range: '200-350W', min: 200, max: 350 },
      { range: '350W+', min: 350, max: Infinity },
    ]
    return buckets.map(b => ({
      range: b.range,
      count: data.filter(d => d.tdpWatts != null && d.tdpWatts >= b.min && d.tdpWatts < b.max).length,
    }))
  }, [data])

  const priceDistribution = useMemo(() => {
    const buckets = [
      { range: '0-100', min: 0, max: 100 },
      { range: '100-300', min: 100, max: 300 },
      { range: '300-500', min: 300, max: 500 },
      { range: '500-1000', min: 500, max: 1000 },
      { range: '1000+', min: 1000, max: Infinity },
    ]
    return buckets.map(b => ({
      range: b.range,
      count: data.filter(d => d.latestPrice != null && d.latestPrice >= b.min && d.latestPrice < b.max).length,
    }))
  }, [data])

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">INT8 TOPS Distribution</h4>
      <MiniBar data={topDistribution} color="#3b82f6" />
      <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mt-3">TDP Distribution</h4>
      <MiniBar data={tdpDistribution} color="#ef4444" />
      <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mt-3">Price Distribution</h4>
      <MiniBar data={priceDistribution} color="#22c55e" />
      <div className="text-xs text-text-muted mt-4">
        Showing {filtered.length} devices with TOPS data, {data.length} total
      </div>
    </div>
  )
}
