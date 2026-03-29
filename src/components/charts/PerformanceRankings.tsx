import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getAllDeviceMetrics } from '@/lib/api'
import { getVendorColor, CHART_STYLES, formatNumber } from './chartUtils'

export function TopTopsBarChart({ limit = 20 }: { limit?: number }) {
  const data = useMemo(() => {
    const metrics = getAllDeviceMetrics()
    return [...metrics.entries()]
      .filter(([, m]) => m.effectiveInt8Tops > 0)
      .sort((a, b) => b[1].effectiveInt8Tops - a[1].effectiveInt8Tops)
      .slice(0, limit)
      .map(([id, m]) => {
        const vendorId = m.vendorId
        return {
          deviceId: id,
          name: m.modelName.length > 20 ? m.modelName.slice(0, 18) + '...' : m.modelName,
          vendorId,
          tops: m.effectiveInt8Tops,
        }
      })
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
    const metrics = getAllDeviceMetrics()
    return [...metrics.entries()]
      .filter(([, m]) => m.topsPerDollar != null && m.topsPerDollar > 0)
      .sort((a, b) => (b[1].topsPerDollar ?? 0) - (a[1].topsPerDollar ?? 0))
      .slice(0, limit)
      .map(([id, m]) => ({
        deviceId: id,
        name: m.modelName.length > 20 ? m.modelName.slice(0, 18) + '...' : m.modelName,
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
    const metrics = getAllDeviceMetrics()
    return [...metrics.entries()]
      .filter(([, m]) => m.topsPerWatt != null && m.topsPerWatt > 0)
      .sort((a, b) => (b[1].topsPerWatt ?? 0) - (a[1].topsPerWatt ?? 0))
      .slice(0, limit)
      .map(([id, m]) => ({
        deviceId: id,
        name: m.modelName.length > 20 ? m.modelName.slice(0, 18) + '...' : m.modelName,
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
