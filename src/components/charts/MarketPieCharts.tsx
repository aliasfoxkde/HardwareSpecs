import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getDevicesByCategory, getVendors, getFamilies } from '@/lib/api'
import { getVendorColor, CHART_STYLES } from './chartUtils'

export function VendorDistributionPie({ category }: { category: string }) {
  const data = useMemo(() => {
    const devices = getDevicesByCategory(category as any)
    const counts: Record<string, number> = {}
    for (const d of devices) {
      counts[d.vendor.vendorId] = (counts[d.vendor.vendorId] || 0) + 1
    }
    return Object.entries(counts)
      .map(([vendorId, count]) => ({
        name: getVendors().find(v => v.vendorId === vendorId)?.name ?? vendorId,
        value: count,
        vendorId,
      }))
      .sort((a, b) => b.value - a.value)
  }, [category])

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map(entry => (
            <Cell key={entry.vendorId} fill={getVendorColor(entry.vendorId)} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function CategoryDistributionPie() {
  const data = useMemo(() => {
    const families = getFamilies()
    const counts: Record<string, number> = {}
    for (const f of families) {
      counts[f.category] = (counts[f.category] || 0) + 1
    }
    return Object.entries(counts)
      .map(([category, count]) => ({ name: category, value: count }))
      .sort((a, b) => b.value - a.value)
  }, [])

  const COLORS = ['#3b82f6', '#76b900', '#ed1c24', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function PriceBandPie({ category }: { category: string }) {
  const data = useMemo(() => {
    const devices = getDevicesByCategory(category as any)
    const bands = [
      { name: 'Under $100', min: 0, max: 100 },
      { name: '$100-$300', min: 100, max: 300 },
      { name: '$300-$500', min: 300, max: 500 },
      { name: '$500-$1000', min: 500, max: 1000 },
      { name: '$1000-$2000', min: 1000, max: 2000 },
      { name: 'Over $2000', min: 2000, max: Infinity },
    ]
    return bands.map(band => ({
      name: band.name,
      value: devices.filter(d => {
        const p = d.latestPrice?.priceUsd
        return p != null && p >= band.min && p < band.max
      }).length,
    })).filter(b => b.value > 0)
  }, [category])

  if (data.length === 0) return null

  const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#dc2626']

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
