import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getDeviceMetricsTable, getVendors } from '@/lib/api'
import { getVendorColor, CHART_STYLES, formatNumber } from './chartUtils'

function shortName(name: string, _vendorName: string): string {
  // Strip vendor prefix for brevity, keep the actual model name
  let short = name
  const prefixes = [
    'NVIDIA GeForce ', 'NVIDIA GeForce RTX ', 'NVIDIA ',
    'AMD Radeon ', 'AMD Radeon RX ', 'AMD ',
    'Intel Arc ', 'Intel ',
  ]
  for (const prefix of prefixes) {
    if (short.startsWith(prefix)) {
      short = short.slice(prefix.length)
      break
    }
  }
  return short
}

export function TopTopsBarChart({ limit = 20 }: { limit?: number }) {
  const vendors = useMemo(() => getVendors(), [])
  const vendorNameMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const v of vendors) m[v.vendorId] = v.name
    return m
  }, [vendors])

  const data = useMemo(() => {
    return getDeviceMetricsTable()
      .filter(m => m.effectiveInt8Tops > 0)
      .sort((a, b) => b.effectiveInt8Tops - a.effectiveInt8Tops)
      .slice(0, limit)
      .map(m => ({
        deviceId: m.deviceId,
        name: shortName(m.modelName, vendorNameMap[m.vendorId] ?? ''),
        fullName: m.modelName,
        vendorId: m.vendorId,
        vendorName: vendorNameMap[m.vendorId] ?? m.vendorId,
        tops: m.effectiveInt8Tops,
      }))
  }, [limit, vendorNameMap])

  if (data.length === 0) return <div className="flex items-center justify-center h-full text-text-muted">No INT8 TOPS data available</div>

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, bottom: 20, left: 140 }} aria-label="Top devices ranked by INT8 TOPS performance">
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
        <XAxis type="number" tick={{ fill: CHART_STYLES.axisTick, fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: CHART_STYLES.axisTick, fontSize: 11 }} width={135} />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
          formatter={(value) => [`${formatNumber(Number(value ?? 0))} TOPS`, 'INT8 TOPS']}
        />
        <Bar dataKey="tops" name="INT8 TOPS" radius={[0, 4, 4, 0]}>
          {data.map(entry => (
            <Cell key={entry.deviceId} fill={getVendorColor(entry.vendorId)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TopTopsPerDollarChart({ limit = 20 }: { limit?: number }) {
  const vendors = useMemo(() => getVendors(), [])
  const vendorNameMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const v of vendors) m[v.vendorId] = v.name
    return m
  }, [vendors])

  const data = useMemo(() => {
    return getDeviceMetricsTable()
      .filter(m => m.topsPerDollar != null && m.topsPerDollar > 0)
      .sort((a, b) => (b.topsPerDollar ?? 0) - (a.topsPerDollar ?? 0))
      .slice(0, limit)
      .map(m => ({
        deviceId: m.deviceId,
        name: shortName(m.modelName, vendorNameMap[m.vendorId] ?? ''),
        fullName: m.modelName,
        vendorId: m.vendorId,
        topsPerDollar: m.topsPerDollar,
      }))
  }, [limit, vendorNameMap])

  if (data.length === 0) return <div className="flex items-center justify-center h-full text-text-muted">No TOPS/$ data available</div>

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, bottom: 20, left: 140 }} aria-label="Top devices ranked by TOPS per dollar value">
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
        <XAxis type="number" tick={{ fill: CHART_STYLES.axisTick, fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: CHART_STYLES.axisTick, fontSize: 11 }} width={135} />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
          formatter={(value) => [`${formatNumber(Number(value ?? 0))} TOPS/$`, 'TOPS/$']}
        />
        <Bar dataKey="topsPerDollar" name="TOPS/$" fill="#22c55e" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TopTopsPerWattChart({ limit = 20 }: { limit?: number }) {
  const vendors = useMemo(() => getVendors(), [])
  const vendorNameMap = useMemo(() => {
    const m: Record<string, string> = {}
    for (const v of vendors) m[v.vendorId] = v.name
    return m
  }, [vendors])

  const data = useMemo(() => {
    return getDeviceMetricsTable()
      .filter(m => m.topsPerWatt != null && m.topsPerWatt > 0)
      .sort((a, b) => (b.topsPerWatt ?? 0) - (a.topsPerWatt ?? 0))
      .slice(0, limit)
      .map(m => ({
        deviceId: m.deviceId,
        name: shortName(m.modelName, vendorNameMap[m.vendorId] ?? ''),
        fullName: m.modelName,
        vendorId: m.vendorId,
        topsPerWatt: m.topsPerWatt,
      }))
  }, [limit, vendorNameMap])

  if (data.length === 0) return <div className="flex items-center justify-center h-full text-text-muted">No TOPS/W data available</div>

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, bottom: 20, left: 140 }} aria-label="Top devices ranked by TOPS per watt efficiency">
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
        <XAxis type="number" tick={{ fill: CHART_STYLES.axisTick, fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: CHART_STYLES.axisTick, fontSize: 11 }} width={135} />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
          formatter={(value) => [`${formatNumber(Number(value ?? 0))} TOPS/W`, 'TOPS/W']}
        />
        <Bar dataKey="topsPerWatt" name="TOPS/W" fill="#3b82f6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
