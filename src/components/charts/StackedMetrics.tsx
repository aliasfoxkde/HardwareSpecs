import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getDeviceMetricsTable } from '@/lib/api'
import { CHART_STYLES, formatNumber } from './chartUtils'

export function MultiMetricComparison({ category }: { category: string }) {
  const data = useMemo(() => {
    const table = getDeviceMetricsTable().filter(m => m.categoryName === category)
    return table
      .filter(m => m.effectiveInt8Tops > 0 || m.fp16Tflops != null || m.fp32Tflops != null)
      .sort((a, b) => b.effectiveInt8Tops - a.effectiveInt8Tops)
      .slice(0, 15)
      .map(m => ({
        name: m.modelName.replace(/^(NVIDIA GeForce |NVIDIA |AMD Radeon |AMD |Intel Arc |Intel )/, ''),
        fullName: m.modelName,
        int8Tops: m.effectiveInt8Tops,
        fp16Tflops: m.fp16Tflops ?? 0,
        fp32Tflops: m.fp32Tflops ?? 0,
      }))
  }, [category])

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">No compute data for {category}</div>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 32)}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, bottom: 20, left: 140 }}>
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
        />
        <Legend />
        <Bar dataKey="fp32Tflops" name="FP32 TFLOPS" stackId="compute" fill="#3b82f6" />
        <Bar dataKey="fp16Tflops" name="FP16 TFLOPS" stackId="compute" fill="#a855f7" />
        <Bar dataKey="int8Tops" name="INT8 TOPS" stackId="compute" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PricePerfStacked({ category }: { category: string }) {
  const data = useMemo(() => {
    const table = getDeviceMetricsTable().filter(m => m.categoryName === category)
    return table
      .filter(m => m.latestPrice != null && (m.topsPerDollar != null || m.perfPerDollar != null))
      .sort((a, b) => (b.topsPerDollar ?? 0) - (a.topsPerDollar ?? 0))
      .slice(0, 15)
      .map(m => ({
        name: m.modelName.replace(/^(NVIDIA GeForce |NVIDIA |AMD Radeon |AMD |Intel Arc |Intel )/, ''),
        fullName: m.modelName,
        topsPerDollar: m.topsPerDollar ?? 0,
        perfPerDollar: m.perfPerDollar ?? 0,
        price: m.latestPrice!,
      }))
  }, [category])

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">No value data for {category}</div>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 32)}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, bottom: 20, left: 140 }}>
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
          formatter={(value, name) => {
            if (name === 'price') return [formatNumber(Number(value ?? 0), 0), 'Price']
            return [formatNumber(Number(value ?? 0)), name]
          }}
        />
        <Legend />
        <Bar dataKey="topsPerDollar" name="TOPS/$" fill="#22c55e" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
