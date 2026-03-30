import { useMemo } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import { getDeviceMetricsTable, getVendors } from '@/lib/api'
import { CHART_STYLES } from './chartUtils'

const RADAR_METRICS = [
  { key: 'tops', label: 'INT8 TOPS', maxKey: 'effectiveInt8Tops' },
  { key: 'topsPerDollar', label: 'TOPS/$', maxKey: 'topsPerDollar' },
  { key: 'topsPerWatt', label: 'TOPS/W', maxKey: 'topsPerWatt' },
  { key: 'perfPerDollar', label: 'Perf/$', maxKey: 'perfPerDollar' },
  { key: 'perfPerWatt', label: 'Perf/W', maxKey: 'perfPerWatt' },
  { key: 'memory', label: 'Memory', maxKey: 'memoryCapacityGB' },
] as const

const RADAR_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#f59e0b', '#06b6d4']

export function RadarComparisonChart({ deviceIds }: { deviceIds: string[] }) {
  const vendors = useMemo(() => getVendors(), [])
  const vendorNameMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const v of vendors) m[v.vendorId] = v.name
    return m
  }, [vendors])

  const { chartData, devices } = useMemo(() => {
    const table = getDeviceMetricsTable()
    const selected = deviceIds
      .map(id => table.find(m => m.deviceId === id))
      .filter((m): m is NonNullable<typeof m> => m != null)

    if (selected.length === 0) return { chartData: [], devices: [] }

    // Compute max values for normalization
    const allMetrics = getDeviceMetricsTable().filter(m => m.effectiveInt8Tops > 0)
    const maxValues: Record<string, number> = {}
    for (const metric of RADAR_METRICS) {
      const values = allMetrics.map(m => m[metric.maxKey as keyof typeof m] as number | null | undefined).filter((v): v is number => v != null && v > 0)
      maxValues[metric.key] = values.length > 0 ? Math.max(...values) : 1
    }

    const chartData = RADAR_METRICS.map(metric => {
      const point: Record<string, string | number> = { metric: metric.label }
      for (let i = 0; i < selected.length; i++) {
        const m = selected[i]
        const raw = m[metric.maxKey as keyof typeof m] as number | null | undefined
        point[`device${i}`] = raw != null && raw > 0 ? Math.min(Math.round((raw / maxValues[metric.key]) * 100), 100) : 0
      }
      return point
    })

    return { chartData, devices: selected }
  }, [deviceIds, vendorNameMap])

  if (devices.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">Select devices to compare</div>
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart aria-label="Device multi-metric radar comparison" data={chartData} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke={CHART_STYLES.gridStroke} />
        <PolarAngleAxis dataKey="metric" tick={{ fill: CHART_STYLES.axisTick, fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
          formatter={(value) => [`${Number(value ?? 0)}%`, 'Relative Score']}
        />
        {devices.map((d, i) => (
          <Radar
            key={d.deviceId}
            name={d.modelName}
            dataKey={`device${i}`}
            stroke={RADAR_COLORS[i % RADAR_COLORS.length]}
            fill={RADAR_COLORS[i % RADAR_COLORS.length]}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export function TopDevicesRadar({ category }: { category: string }) {
  const vendors = useMemo(() => getVendors(), [])
  const vendorNameMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const v of vendors) m[v.vendorId] = v.name
    return m
  }, [vendors])

  const { chartData, deviceNames } = useMemo(() => {
    const table = getDeviceMetricsTable().filter(m => m.categoryName === category)

    // Pick top 5 by INT8 TOPS that have decent data
    const top = table
      .filter(m => m.effectiveInt8Tops > 0)
      .sort((a, b) => b.effectiveInt8Tops - a.effectiveInt8Tops)
      .slice(0, 5)

    if (top.length === 0) return { chartData: [], deviceNames: [] }

    const allInCategory = table
    const maxValues: Record<string, number> = {}
    for (const metric of RADAR_METRICS) {
      const values = allInCategory.map(m => m[metric.maxKey as keyof typeof m] as number | null | undefined).filter((v): v is number => v != null && v > 0)
      maxValues[metric.key] = values.length > 0 ? Math.max(...values) : 1
    }

    const chartData = RADAR_METRICS.map(metric => {
      const point: Record<string, string | number> = { metric: metric.label }
      for (let i = 0; i < top.length; i++) {
        const m = top[i]
        const raw = m[metric.maxKey as keyof typeof m] as number | null | undefined
        point[`device${i}`] = raw != null && raw > 0 ? Math.min(Math.round((raw / maxValues[metric.key]) * 100), 100) : 0
      }
      return point
    })

    return { chartData, deviceNames: top.map(d => d.modelName) }
  }, [category, vendorNameMap])

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">No compute data for {category}</div>
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart aria-label="Top 5 devices radar comparison" data={chartData} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke={CHART_STYLES.gridStroke} />
        <PolarAngleAxis dataKey="metric" tick={{ fill: CHART_STYLES.axisTick, fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
          formatter={(value) => [`${Number(value ?? 0)}%`, 'Relative Score']}
        />
        {deviceNames.map((name, i) => (
          <Radar
            key={name}
            name={name}
            dataKey={`device${i}`}
            stroke={RADAR_COLORS[i % RADAR_COLORS.length]}
            fill={RADAR_COLORS[i % RADAR_COLORS.length]}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}
