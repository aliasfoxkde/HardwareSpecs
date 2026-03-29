import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getDeviceMetricsTable } from '@/lib/api'
import { getVendorColor, CHART_STYLES, formatNumber } from './chartUtils'

function truncateName(name: string, max = 20): string {
  return name.length > max ? name.slice(0, max - 2) + '..' : name
}

export function TopTopsBarChart({ limit = 20 }: { limit?: number }) {
  const data = useMemo(() => {
    return getDeviceMetricsTable()
      .filter(m => m.effectiveInt8Tops > 0)
      .sort((a, b) => b.effectiveInt8Tops - a.effectiveInt8Tops)
      .slice(0, limit)
      .map(m => ({
        deviceId: m.deviceId,
        name: truncateName(m.modelName),
        vendorId: m.vendorId,
        tops: m.effectiveInt8Tops,
      }))
  }, [limit])

  if (data.length === 0) return <div className="flex items-center justify-center h-full text-text-muted">No INT8 TOPS data available</div>

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 30)}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, bottom: 20, left: 100 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
        <XAxis type="number" tick={{ fill: CHART_STYLES.axisTick, fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} width={95} />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
          formatter={(value: number) => [`${formatNumber(value)} TOPS`, 'INT8 TOPS']}
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
  const data = useMemo(() => {
    return getDeviceMetricsTable()
      .filter(m => m.topsPerDollar != null && m.topsPerDollar > 0)
      .sort((a, b) => (b.topsPerDollar ?? 0) - (a.topsPerDollar ?? 0))
      .slice(0, limit)
      .map(m => ({
        deviceId: m.deviceId,
        name: truncateName(m.modelName),
        vendorId: m.vendorId,
        topsPerDollar: m.topsPerDollar,
      }))
  }, [limit])

  if (data.length === 0) return <div className="flex items-center justify-center h-full text-text-muted">No TOPS/$ data available</div>

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 30)}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, bottom: 20, left: 100 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
        <XAxis type="number" tick={{ fill: CHART_STYLES.axisTick, fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} width={95} />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
          formatter={(value: number) => [`${formatNumber(value)} TOPS/$`, 'TOPS/$']}
        />
        <Bar dataKey="topsPerDollar" name="TOPS/$" fill="#22c55e" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TopTopsPerWattChart({ limit = 20 }: { limit?: number }) {
  const data = useMemo(() => {
    return getDeviceMetricsTable()
      .filter(m => m.topsPerWatt != null && m.topsPerWatt > 0)
      .sort((a, b) => (b.topsPerWatt ?? 0) - (a.topsPerWatt ?? 0))
      .slice(0, limit)
      .map(m => ({
        deviceId: m.deviceId,
        name: truncateName(m.modelName),
        vendorId: m.vendorId,
        topsPerWatt: m.topsPerWatt,
      }))
  }, [limit])

  if (data.length === 0) return <div className="flex items-center justify-center h-full text-text-muted">No TOPS/W data available</div>

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 30)}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, bottom: 20, left: 100 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
        <XAxis type="number" tick={{ fill: CHART_STYLES.axisTick, fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} width={95} />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
          formatter={(value: number) => [`${formatNumber(value)} TOPS/W`, 'TOPS/W']}
        />
        <Bar dataKey="topsPerWatt" name="TOPS/W" fill="#3b82f6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
