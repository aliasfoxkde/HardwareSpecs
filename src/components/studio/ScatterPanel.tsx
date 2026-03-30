import { useMemo } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { getVendorColor, CHART_STYLES, formatNumber } from '@/components/charts/chartUtils'
import type { DeviceMetricsRow } from '@/lib/api'

export function ScatterPanel({ data }: { data: DeviceMetricsRow[] }) {
  const scatterData = useMemo(() => {
    return data
      .filter(d => d.latestPrice != null && d.effectiveInt8Tops > 0)
      .map(d => ({
        name: d.modelName,
        vendorId: d.vendorId,
        price: d.latestPrice!,
        tops: d.effectiveInt8Tops,
        fill: getVendorColor(d.vendorId),
      }))
      .sort((a, b) => b.tops - a.tops)
      .slice(0, 100)
  }, [data])

  if (scatterData.length === 0) {
    return <div className="flex items-center justify-center h-48 text-text-muted text-sm">No price + TOPS data</div>
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">TOPS vs Price</h4>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
          <XAxis type="number" dataKey="price" tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} name="Price ($)" />
          <YAxis type="number" dataKey="tops" tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} name="INT8 TOPS" />
          <Tooltip
            contentStyle={{ backgroundColor: CHART_STYLES.tooltipBg, border: `1px solid ${CHART_STYLES.tooltipBorder}`, borderRadius: '8px', color: CHART_STYLES.tooltipText, fontSize: 12 }}
            formatter={(value, name) => name === 'price' ? [`$${Math.round(Number(value ?? 0)).toLocaleString()}`, 'Price'] : [formatNumber(Number(value ?? 0)), 'TOPS']}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''}
          />
          <Scatter data={scatterData}>
            {scatterData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
