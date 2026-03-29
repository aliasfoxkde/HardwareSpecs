import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getDevicesByCategory } from '@/lib/api'
import { getVendorColor, CHART_STYLES, formatNumber } from './chartUtils'

export function TdpOverTimeChart({ category }: { category: string }) {
  const { seriesData, vendors } = useMemo(() => {
    const devices = getDevicesByCategory(category as any)
    const filtered = devices.filter(d => d.device.tdpWatts && d.device.launchDate)

    // Group by vendor, collect data points by year
    const vendorData: Record<string, Map<string, { avg: number; count: number }>> = {}

    for (const d of filtered) {
      const vId = d.vendor.vendorId
      const year = d.device.launchDate.slice(0, 4)
      if (!vendorData[vId]) vendorData[vId] = new Map()
      const entry = vendorData[vId].get(year)
      if (entry) {
        entry.avg = (entry.avg * entry.count + d.device.tdpWatts!) / (entry.count + 1)
        entry.count++
      } else {
        vendorData[vId].set(year, { avg: d.device.tdpWatts!, count: 1 })
      }
    }

    const years = [...new Set(filtered.map(d => d.device.launchDate.slice(0, 4)))].sort()
    const activeVendorIds = Object.keys(vendorData)
      .filter(vId => vendorData[vId].size >= 2)
      .sort((a, b) => {
        const aTotal = [...vendorData[a].values()].reduce((s, e) => s + e.count, 0)
        const bTotal = [...vendorData[b].values()].reduce((s, e) => s + e.count, 0)
        return bTotal - aTotal
      })
      .slice(0, 6)

    const seriesData = years.map(year => {
      const point: Record<string, string | number> = { year }
      for (const vId of activeVendorIds) {
        const entry = vendorData[vId].get(year)
        point[vId] = entry ? Math.round(entry.avg) : null
      }
      return point
    })

    return { seriesData, vendors: activeVendorIds }
  }, [category])

  if (seriesData.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">No TDP trend data for {category}</div>
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={seriesData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
        <XAxis
          dataKey="year"
          tick={{ fill: CHART_STYLES.axisTick, fontSize: 12 }}
          label={{ value: 'Launch Year', position: 'insideBottom', offset: -10, fill: CHART_STYLES.axisTick, fontSize: 12 }}
        />
        <YAxis
          tick={{ fill: CHART_STYLES.axisTick, fontSize: 12 }}
          label={{ value: 'Avg TDP (W)', angle: -90, position: 'insideLeft', fill: CHART_STYLES.axisTick, fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
        />
        <Legend />
        {vendors.map(vId => (
          <Line
            key={vId}
            type="monotone"
            dataKey={vId}
            stroke={getVendorColor(vId)}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
            name={vId}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

export function TopsOverTimeChart({ category }: { category: string }) {
  const { seriesData, vendors } = useMemo(() => {
    const devices = getDevicesByCategory(category as any)
    const filtered = devices.filter(d => d.metrics.effectiveInt8Tops > 0 && d.device.launchDate)

    const vendorData: Record<string, Map<string, { max: number; count: number }>> = {}

    for (const d of filtered) {
      const vId = d.vendor.vendorId
      const year = d.device.launchDate.slice(0, 4)
      if (!vendorData[vId]) vendorData[vId] = new Map()
      const entry = vendorData[vId].get(year)
      if (entry) {
        entry.max = Math.max(entry.max, d.metrics.effectiveInt8Tops)
        entry.count++
      } else {
        vendorData[vId].set(year, { max: d.metrics.effectiveInt8Tops, count: 1 })
      }
    }

    const years = [...new Set(filtered.map(d => d.device.launchDate.slice(0, 4)))].sort()
    const activeVendorIds = Object.keys(vendorData)
      .filter(vId => vendorData[vId].size >= 1)
      .sort((a, b) => {
        const aMax = Math.max(...[...vendorData[a].values()].map(e => e.max))
        const bMax = Math.max(...[...vendorData[b].values()].map(e => e.max))
        return bMax - aMax
      })
      .slice(0, 6)

    const seriesData = years.map(year => {
      const point: Record<string, string | number> = { year }
      for (const vId of activeVendorIds) {
        const entry = vendorData[vId].get(year)
        point[vId] = entry ? Math.round(entry.max) : null
      }
      return point
    })

    return { seriesData, vendors: activeVendorIds }
  }, [category])

  if (seriesData.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">No TOPS trend data for {category}</div>
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={seriesData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
        <XAxis
          dataKey="year"
          tick={{ fill: CHART_STYLES.axisTick, fontSize: 12 }}
          label={{ value: 'Launch Year', position: 'insideBottom', offset: -10, fill: CHART_STYLES.axisTick, fontSize: 12 }}
        />
        <YAxis
          tick={{ fill: CHART_STYLES.axisTick, fontSize: 12 }}
          label={{ value: 'Max INT8 TOPS', angle: -90, position: 'insideLeft', fill: CHART_STYLES.axisTick, fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
        />
        <Legend />
        {vendors.map(vId => (
          <Line
            key={vId}
            type="monotone"
            dataKey={vId}
            stroke={getVendorColor(vId)}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
            name={vId}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
