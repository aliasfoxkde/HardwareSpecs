import { useMemo } from 'react'
import { Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, Cell } from 'recharts'
import { getDevicesByCategory } from '@/lib/api'
import { getVendorColor, CHART_STYLES, formatNumber, linearRegression } from './chartUtils'
import type { DeviceCategory } from '@/types'

export function PerfVsPriceChart({ category }: { category: DeviceCategory }) {
  const { scatterData, regression } = useMemo(() => {
    const devices = getDevicesByCategory(category)
    const data = devices
      .filter(d => d.latestPrice && d.metrics.perfPerDollar != null && d.metrics.perfPerDollar > 0)
      .map(d => ({
        name: d.device.modelName,
        vendor: d.vendor.name,
        vendorId: d.vendor.vendorId,
        price: d.latestPrice!.priceUsd,
        perf: (d.metrics.perfPerDollar ?? 0) * d.latestPrice!.priceUsd,
        fill: getVendorColor(d.vendor.vendorId),
      }))

    const reg = linearRegression(data.map(d => ({ x: d.price, y: d.perf })))
    const minPrice = Math.min(...data.map(d => d.price))
    const maxPrice = Math.max(...data.map(d => d.price))
    const lineData = [
      { x: minPrice, y: reg.slope * minPrice + reg.intercept },
      { x: maxPrice, y: reg.slope * maxPrice + reg.intercept },
    ]

    return { scatterData: data, regression: { lineData, r2: reg.r2 } }
  }, [category])

  if (scatterData.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">No price+performance data for {category}</div>
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart aria-label="Performance score vs price scatter plot" margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
        <XAxis
          type="number"
          dataKey="price"
          tick={{ fill: CHART_STYLES.axisTick, fontSize: 12 }}
          label={{ value: 'Price (USD)', position: 'insideBottom', offset: -10, fill: CHART_STYLES.axisTick, fontSize: 12 }}
        />
        <YAxis
          type="number"
          dataKey="perf"
          tick={{ fill: CHART_STYLES.axisTick, fontSize: 12 }}
          label={{ value: 'Performance Score', angle: -90, position: 'insideLeft', fill: CHART_STYLES.axisTick, fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
          labelFormatter={(_, payload) => {
            if (payload?.length > 0) {
              const d = payload[0].payload
              return `${d.name} (${d.vendor})`
            }
            return ''
          }}
          formatter={(value, name) => {
            if (name === 'price') return [formatNumber(Number(value ?? 0), 0), 'Price']
            return [formatNumber(Number(value ?? 0), 0), 'Score']
          }}
        />
        <Scatter data={scatterData}>
          {scatterData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Scatter>
        {regression.r2 > 0.1 && (
          <Line
            data={regression.lineData}
            dataKey="y"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            name={`Trend (R²=${regression.r2.toFixed(2)})`}
            type="linear"
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function TopsVsPriceChart({ category }: { category: DeviceCategory }) {
  const { scatterData, regression } = useMemo(() => {
    const devices = getDevicesByCategory(category)
    const data = devices
      .filter(d => d.latestPrice && d.metrics.effectiveInt8Tops > 0)
      .map(d => ({
        name: d.device.modelName,
        vendor: d.vendor.name,
        vendorId: d.vendor.vendorId,
        price: d.latestPrice!.priceUsd,
        tops: d.metrics.effectiveInt8Tops,
        fill: getVendorColor(d.vendor.vendorId),
      }))

    const reg = linearRegression(data.map(d => ({ x: d.price, y: d.tops })))
    const minPrice = Math.min(...data.map(d => d.price))
    const maxPrice = Math.max(...data.map(d => d.price))
    const lineData = [
      { x: minPrice, y: reg.slope * minPrice + reg.intercept },
      { x: maxPrice, y: reg.slope * maxPrice + reg.intercept },
    ]

    return { scatterData: data, regression: { lineData, r2: reg.r2 } }
  }, [category])

  if (scatterData.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">No TOPS+price data for {category}</div>
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart aria-label="INT8 TOPS vs price scatter plot" margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
        <XAxis
          type="number"
          dataKey="price"
          tick={{ fill: CHART_STYLES.axisTick, fontSize: 12 }}
          label={{ value: 'Price (USD)', position: 'insideBottom', offset: -10, fill: CHART_STYLES.axisTick, fontSize: 12 }}
        />
        <YAxis
          type="number"
          dataKey="tops"
          tick={{ fill: CHART_STYLES.axisTick, fontSize: 12 }}
          label={{ value: 'INT8 TOPS', angle: -90, position: 'insideLeft', fill: CHART_STYLES.axisTick, fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
          labelFormatter={(_, payload) => {
            if (payload?.length > 0) {
              const d = payload[0].payload
              return `${d.name} (${d.vendor})`
            }
            return ''
          }}
          formatter={(value, name) => {
            if (name === 'price') return [formatNumber(Number(value ?? 0), 0), 'Price']
            return [formatNumber(Number(value ?? 0)), 'INT8 TOPS']
          }}
        />
        <Scatter data={scatterData}>
          {scatterData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Scatter>
        {regression.r2 > 0.1 && (
          <Line
            data={regression.lineData}
            dataKey="y"
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            name={`Trend (R²=${regression.r2.toFixed(2)})`}
            type="linear"
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
