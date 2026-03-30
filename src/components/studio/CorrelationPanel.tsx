import { useMemo } from 'react'
import { ComposedChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Line } from 'recharts'
import { getVendorColor, CHART_STYLES, formatNumber, linearRegression } from '@/components/charts/chartUtils'
import type { DeviceMetricsRow } from '@/lib/api'

export function CorrelationPanel({ data }: { data: DeviceMetricsRow[] }) {
  const topsPrice = useMemo(() => {
    const pts = data.filter(d => d.latestPrice != null && d.effectiveInt8Tops > 0)
      .map(d => ({ x: d.latestPrice!, y: d.effectiveInt8Tops, name: d.modelName, vendorId: d.vendorId }))
      .slice(0, 150)
    if (pts.length < 2) return null
    const reg = linearRegression(pts)
    const xMin = Math.min(...pts.map(p => p.x))
    const xMax = Math.max(...pts.map(p => p.x))
    return {
      points: pts.map(p => ({ ...p, fill: getVendorColor(p.vendorId) })),
      regLine: [
        { x: xMin, y: reg.slope * xMin + reg.intercept },
        { x: xMax, y: reg.slope * xMax + reg.intercept },
      ],
      r2: reg.r2,
      slope: reg.slope,
      intercept: reg.intercept,
    }
  }, [data])

  const efficiencyData = useMemo(() => {
    const pts = data.filter(d => d.tdpWatts != null && d.tdpWatts > 0 && d.effectiveInt8Tops > 0)
      .map(d => ({ x: d.tdpWatts!, y: d.effectiveInt8Tops / d.tdpWatts!, name: d.modelName, vendorId: d.vendorId }))
      .slice(0, 150)
    if (pts.length < 2) return null
    const reg = linearRegression(pts)
    const xMin = Math.min(...pts.map(p => p.x))
    const xMax = Math.max(...pts.map(p => p.x))
    return {
      points: pts.map(p => ({ ...p, fill: getVendorColor(p.vendorId) })),
      regLine: [
        { x: xMin, y: reg.slope * xMin + reg.intercept },
        { x: xMax, y: reg.slope * xMax + reg.intercept },
      ],
      r2: reg.r2,
      slope: reg.slope,
      intercept: reg.intercept,
    }
  }, [data])

  const tooltipStyle = {
    backgroundColor: CHART_STYLES.tooltipBg,
    border: `1px solid ${CHART_STYLES.tooltipBorder}`,
    borderRadius: '8px',
    color: CHART_STYLES.tooltipText,
    fontSize: 12,
  }

  if (!topsPrice && !efficiencyData) {
    return <div className="flex items-center justify-center h-48 text-text-muted text-sm">Insufficient data for correlation</div>
  }

  return (
    <div className="space-y-5">
      {topsPrice && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">TOPS vs Price</h4>
            <span className="text-xs text-text-muted">R&sup2; = {topsPrice.r2.toFixed(3)}</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
              <XAxis type="number" dataKey="x" tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} name="Price ($)" />
              <YAxis type="number" dataKey="y" tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} name="TOPS" />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  const num = Number(value ?? 0)
                  if (name === 'x') return [`$${Math.round(num).toLocaleString()}`, 'Price']
                  return [formatNumber(num), 'TOPS']
                }}
                labelFormatter={(_, payload) => {
                  const pt = payload?.[0]?.payload
                  return pt?.name ?? ''
                }}
              />
              <Scatter data={topsPrice.points} dataKey="y">
                {topsPrice.points.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Scatter>
              <Line
                type="linear"
                data={topsPrice.regLine}
                dataKey="y"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                isAnimationActive={false}
                name="Regression"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
      {efficiencyData && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">TDP vs TOPS/W</h4>
            <span className="text-xs text-text-muted">R&sup2; = {efficiencyData.r2.toFixed(3)}</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
              <XAxis type="number" dataKey="x" tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} name="TDP (W)" />
              <YAxis type="number" dataKey="y" tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} name="TOPS/W" />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  const num = Number(value ?? 0)
                  if (name === 'x') return [`${Math.round(num)}W`, 'TDP']
                  return [formatNumber(num), 'TOPS/W']
                }}
                labelFormatter={(_, payload) => {
                  const pt = payload?.[0]?.payload
                  return pt?.name ?? ''
                }}
              />
              <Scatter data={efficiencyData.points} dataKey="y">
                {efficiencyData.points.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Scatter>
              <Line
                type="linear"
                data={efficiencyData.regLine}
                dataKey="y"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                isAnimationActive={false}
                name="Regression"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
