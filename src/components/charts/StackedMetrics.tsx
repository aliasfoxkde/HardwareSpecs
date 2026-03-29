import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getDevicesByCategory } from '@/lib/api'
import { CHART_STYLES, formatNumber } from './chartUtils'

export function MultiMetricComparison({ category }: { category: string }) {
  const data = useMemo(() => {
    const devices = getDevicesByCategory(category as any)
    return devices
      .filter(d => d.metrics.effectiveInt8Tops > 0 || d.metrics.fp16Tflops != null || d.metrics.fp32Tflops != null)
      .sort((a, b) => b.metrics.effectiveInt8Tops - a.metrics.effectiveInt8Tops)
      .slice(0, 15)
      .map(d => ({
        name: d.device.modelName.length > 18 ? d.device.modelName.slice(0, 16) + '..' : d.device.modelName,
        fullName: d.device.modelName,
        int8Tops: d.metrics.effectiveInt8Tops,
        fp16Tflops: d.metrics.fp16Tflops ?? 0,
        fp32Tflops: d.metrics.fp32Tflops ?? 0,
      }))
  }, [category])

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">No compute data for {category}</div>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 32)}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, bottom: 20, left: 90 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
        <XAxis type="number" tick={{ fill: CHART_STYLES.axisTick, fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} width={85} />
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
    const devices = getDevicesByCategory(category as any)
    return devices
      .filter(d => d.latestPrice && (d.metrics.topsPerDollar != null || d.metrics.perfPerDollar != null))
      .sort((a, b) => (b.metrics.topsPerDollar ?? 0) - (a.metrics.topsPerDollar ?? 0))
      .slice(0, 15)
      .map(d => ({
        name: d.device.modelName.length > 18 ? d.device.modelName.slice(0, 16) + '..' : d.device.modelName,
        fullName: d.device.modelName,
        topsPerDollar: d.metrics.topsPerDollar ?? 0,
        perfPerDollar: d.metrics.perfPerDollar ?? 0,
        price: d.latestPrice!.priceUsd,
      }))
  }, [category])

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-muted">No value data for {category}</div>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 32)}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, bottom: 20, left: 90 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.gridStroke} />
        <XAxis type="number" tick={{ fill: CHART_STYLES.axisTick, fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} width={85} />
        <Tooltip
          contentStyle={{
            backgroundColor: CHART_STYLES.tooltipBg,
            border: `1px solid ${CHART_STYLES.tooltipBorder}`,
            borderRadius: '8px',
            color: CHART_STYLES.tooltipText,
          }}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
          formatter={(value: number, name: string) => {
            if (name === 'price') return [formatNumber(value, 0), 'Price']
            return [formatNumber(value), name]
          }}
        />
        <Legend />
        <Bar dataKey="topsPerDollar" name="TOPS/$" fill="#22c55e" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
