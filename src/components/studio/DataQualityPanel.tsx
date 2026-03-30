import { useMemo } from 'react'
import type { DeviceMetricsRow } from '@/lib/api'

export function DataQualityPanel({ data }: { data: DeviceMetricsRow[] }) {
  const stats = useMemo(() => {
    const total = data.length
    const hasTops = data.filter(d => d.effectiveInt8Tops > 0).length
    const hasPrice = data.filter(d => d.latestPrice != null).length
    const hasTdp = data.filter(d => d.tdpWatts != null).length
    const hasBench = data.filter(d => d.topBenchmarkScore != null).length
    const hasSpecs = data.filter(d => d.fp32Tflops != null || d.fp16Tflops != null).length
    const hasMemory = data.filter(d => d.memoryCapacityGB != null).length
    const hasCores = data.filter(d => d.cores != null).length
    const hasProcess = data.filter(d => d.processNm != null).length

    const fields = [
      { label: 'INT8 TOPS', count: hasTops, pct: Math.round(hasTops / total * 100), color: 'bg-brand-500' },
      { label: 'Price', count: hasPrice, pct: Math.round(hasPrice / total * 100), color: 'bg-green-500' },
      { label: 'TDP', count: hasTdp, pct: Math.round(hasTdp / total * 100), color: 'bg-red-500' },
      { label: 'Benchmarks', count: hasBench, pct: Math.round(hasBench / total * 100), color: 'bg-purple-500' },
      { label: 'FP16/FP32', count: hasSpecs, pct: Math.round(hasSpecs / total * 100), color: 'bg-yellow-500' },
      { label: 'Memory', count: hasMemory, pct: Math.round(hasMemory / total * 100), color: 'bg-cyan-500' },
      { label: 'Cores', count: hasCores, pct: Math.round(hasCores / total * 100), color: 'bg-orange-500' },
      { label: 'Process', count: hasProcess, pct: Math.round(hasProcess / total * 100), color: 'bg-pink-500' },
    ]

    const avgCompleteness = data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.dataCompleteness, 0) / data.length * 100)
      : 0

    const highQuality = data.filter(d => d.dataCompleteness >= 0.7).length
    const mediumQuality = data.filter(d => d.dataCompleteness >= 0.4 && d.dataCompleteness < 0.7).length
    const lowQuality = data.filter(d => d.dataCompleteness < 0.4).length

    return { total, fields, avgCompleteness, highQuality, mediumQuality, lowQuality }
  }, [data])

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Overall</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-bg-tertiary/30 rounded-lg p-2">
            <div className="text-lg font-bold text-green-400">{stats.highQuality}</div>
            <div className="text-[10px] text-text-muted">High (&ge;70%)</div>
          </div>
          <div className="bg-bg-tertiary/30 rounded-lg p-2">
            <div className="text-lg font-bold text-yellow-400">{stats.mediumQuality}</div>
            <div className="text-[10px] text-text-muted">Medium (40-70%)</div>
          </div>
          <div className="bg-bg-tertiary/30 rounded-lg p-2">
            <div className="text-lg font-bold text-red-400">{stats.lowQuality}</div>
            <div className="text-[10px] text-text-muted">Low (&lt;40%)</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-text-muted">Average completeness: <span className="text-text-primary font-medium">{stats.avgCompleteness}%</span></div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Field Coverage</h4>
        <div className="space-y-1.5">
          {stats.fields.map(f => (
            <div key={f.label} className="flex items-center gap-2">
              <span className="text-xs text-text-secondary w-20">{f.label}</span>
              <div className="flex-1 h-2 bg-bg-tertiary/50 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${f.color}`} style={{ width: `${f.pct}%` }} />
              </div>
              <span className="text-xs text-text-muted w-12 text-right">{f.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
