import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter } from 'recharts'
import { getDeviceMetricsTable } from '@/lib/api'

export function PriceAnalysisReport() {
  const table = useMemo(() => getDeviceMetricsTable(), [])

  const withPrice = useMemo(() => table.filter(r => r.latestPrice != null && r.latestPrice! > 0), [table])

  const priceByCategory = useMemo(() => {
    const grouped = new Map<string, number[]>()
    withPrice.forEach(r => {
      const arr = grouped.get(r.categoryName) ?? []
      arr.push(r.latestPrice!)
      grouped.set(r.categoryName, arr)
    })
    return [...grouped.entries()]
      .map(([cat, prices]) => {
        const sorted = [...prices].sort((a, b) => a - b)
        const avg = prices.reduce((s, p) => s + p, 0) / prices.length
        const mid = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)]
        return { category: cat, avg: avg.toFixed(0), median: mid.toFixed(0), min: sorted[0].toFixed(0), max: sorted[sorted.length - 1].toFixed(0), count: prices.length }
      })
      .sort((a, b) => Number(b.avg) - Number(a.avg))
  }, [withPrice])

  const priceBands = useMemo(() => {
    const bands = [
      { range: '$0-200', min: 0, max: 200, fill: '#10b981' },
      { range: '$200-500', min: 200, max: 500, fill: '#3b82f6' },
      { range: '$500-1000', min: 500, max: 1000, fill: '#f59e0b' },
      { range: '$1000-2000', min: 1000, max: 2000, fill: '#f97316' },
      { range: '$2000+', min: 2000, max: Infinity, fill: '#ef4444' },
    ]
    return bands.map(b => ({ ...b, count: withPrice.filter(r => r.latestPrice! >= b.min && r.latestPrice! < b.max).length }))
  }, [withPrice])

  const scatterData = useMemo(() => {
    return table
      .filter(r => r.latestPrice != null && r.latestPrice! > 0 && r.effectiveInt8Tops > 0)
      .sort((a, b) => b.effectiveInt8Tops - a.effectiveInt8Tops)
      .slice(0, 50)
      .map(r => ({ name: r.modelName, price: r.latestPrice!, tops: r.effectiveInt8Tops, category: r.categoryName }))
  }, [table])

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-text-primary">Price Analysis</h3>

      {/* Price by category table */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-2">Price Stats by Category (USD)</h4>
        <div className="overflow-auto max-h-60">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-bg-secondary">
              <tr>
                <th className="px-3 py-2 text-left text-xs text-text-secondary">Category</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">Count</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">Avg</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">Median</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">Min</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">Max</th>
              </tr>
            </thead>
            <tbody>
              {priceByCategory.map(r => (
                <tr key={r.category} className="border-b border-border-subtle/20">
                  <td className="px-3 py-1.5 text-text-primary font-medium">{r.category}</td>
                  <td className="px-3 py-1.5 text-right text-text-muted">{r.count}</td>
                  <td className="px-3 py-1.5 text-right text-text-primary">${r.avg}</td>
                  <td className="px-3 py-1.5 text-right text-text-secondary">${r.median}</td>
                  <td className="px-3 py-1.5 text-right text-text-muted">${r.min}</td>
                  <td className="px-3 py-1.5 text-right text-text-muted">${r.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price bands */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-2">Price Band Distribution ({withPrice.length} devices with price)</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={priceBands}>
            <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {priceBands.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Price vs TOPS scatter */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-2">Price vs INT8 TOPS (Top 50)</h4>
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart>
            <XAxis type="number" dataKey="price" name="Price" tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'Price ($)', position: 'insideBottom', offset: -5, style: { fill: '#64748b', fontSize: 11 } }} />
            <YAxis type="number" dataKey="tops" name="TOPS" tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'INT8 TOPS', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 11 } }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} labelStyle={{ color: '#f1f5f9' }} formatter={(value, name) => [name === 'price' ? `$${Number(value ?? 0).toLocaleString()}` : Number(value ?? 0).toLocaleString(), name === 'price' ? 'Price' : 'INT8 TOPS']} />
            <Scatter data={scatterData} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
