import { useMemo } from 'react'
import type { DeviceMetricsRow } from '@/lib/api'
import { fmtNum } from './studioUtils'

export function RankingPanel({ data }: { data: DeviceMetricsRow[] }) {
  const topByTops = useMemo(() => {
    return data.filter(d => d.effectiveInt8Tops > 0).sort((a, b) => b.effectiveInt8Tops - a.effectiveInt8Tops).slice(0, 10)
  }, [data])

  const topByValue = useMemo(() => {
    return data.filter(d => d.topsPerDollar != null && d.topsPerDollar > 0).sort((a, b) => (b.topsPerDollar ?? 0) - (a.topsPerDollar ?? 0)).slice(0, 10)
  }, [data])

  const topByEfficiency = useMemo(() => {
    return data.filter(d => d.topsPerWatt != null && d.topsPerWatt > 0).sort((a, b) => (b.topsPerWatt ?? 0) - (a.topsPerWatt ?? 0)).slice(0, 10)
  }, [data])

  const topByFp16 = useMemo(() => {
    return data.filter(d => d.fp16Tflops != null && d.fp16Tflops > 0).sort((a, b) => b.fp16Tflops! - a.fp16Tflops!).slice(0, 10)
  }, [data])

  const topByFp32 = useMemo(() => {
    return data.filter(d => d.fp32Tflops != null && d.fp32Tflops > 0).sort((a, b) => b.fp32Tflops! - a.fp32Tflops!).slice(0, 10)
  }, [data])

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Top 10 by TOPS</h4>
        {topByTops.map((d, i) => (
          <div key={d.deviceId} className="flex items-center gap-2 py-1">
            <span className="text-xs text-text-muted w-5">{i + 1}</span>
            <div className="flex-1 bg-bg-tertiary/50 h-4 rounded overflow-hidden">
              <div className="h-full bg-brand-500/60 rounded" style={{ width: `${(d.effectiveInt8Tops / topByTops[0].effectiveInt8Tops) * 100}%` }} />
            </div>
            <span className="text-xs text-text-primary w-20 truncate">{d.modelName.replace(/^(NVIDIA GeForce |NVIDIA |AMD Radeon |AMD |Intel Arc |Intel )/, '')}</span>
            <span className="text-xs text-brand-400 font-medium w-16 text-right">{fmtNum(d.effectiveInt8Tops, 0)}</span>
          </div>
        ))}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Top 10 by TOPS/$</h4>
        {topByValue.map((d, i) => (
          <div key={d.deviceId} className="flex items-center gap-2 py-1">
            <span className="text-xs text-text-muted w-5">{i + 1}</span>
            <div className="flex-1 bg-bg-tertiary/50 h-4 rounded overflow-hidden">
              <div className="h-full bg-green-500/60 rounded" style={{ width: `${(d.topsPerDollar ?? 0) / (topByValue[0].topsPerDollar ?? 1) * 100}%` }} />
            </div>
            <span className="text-xs text-text-primary w-20 truncate">{d.modelName.replace(/^(NVIDIA GeForce |NVIDIA |AMD Radeon |AMD |Intel Arc |Intel )/, '')}</span>
            <span className="text-xs text-green-400 font-medium w-16 text-right">{fmtNum(d.topsPerDollar)}</span>
          </div>
        ))}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Top 10 by TOPS/W</h4>
        {topByEfficiency.map((d, i) => (
          <div key={d.deviceId} className="flex items-center gap-2 py-1">
            <span className="text-xs text-text-muted w-5">{i + 1}</span>
            <div className="flex-1 bg-bg-tertiary/50 h-4 rounded overflow-hidden">
              <div className="h-full bg-blue-500/60 rounded" style={{ width: `${(d.topsPerWatt ?? 0) / (topByEfficiency[0].topsPerWatt ?? 1) * 100}%` }} />
            </div>
            <span className="text-xs text-text-primary w-20 truncate">{d.modelName.replace(/^(NVIDIA GeForce |NVIDIA |AMD Radeon |AMD |Intel Arc |Intel )/, '')}</span>
            <span className="text-xs text-blue-400 font-medium w-16 text-right">{fmtNum(d.topsPerWatt)}</span>
          </div>
        ))}
      </div>
      {topByFp16.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Top 10 by FP16 TFLOPS</h4>
          {topByFp16.map((d, i) => (
            <div key={d.deviceId} className="flex items-center gap-2 py-1">
              <span className="text-xs text-text-muted w-5">{i + 1}</span>
              <div className="flex-1 bg-bg-tertiary/50 h-4 rounded overflow-hidden">
                <div className="h-full bg-blue-400/60 rounded" style={{ width: `${d.fp16Tflops! / topByFp16[0].fp16Tflops! * 100}%` }} />
              </div>
              <span className="text-xs text-text-primary w-20 truncate">{d.modelName.replace(/^(NVIDIA GeForce |NVIDIA |AMD Radeon |AMD |Intel Arc |Intel )/, '')}</span>
              <span className="text-xs text-blue-400 font-medium w-16 text-right">{fmtNum(d.fp16Tflops)}</span>
            </div>
          ))}
        </div>
      )}
      {topByFp32.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Top 10 by FP32 TFLOPS</h4>
          {topByFp32.map((d, i) => (
            <div key={d.deviceId} className="flex items-center gap-2 py-1">
              <span className="text-xs text-text-muted w-5">{i + 1}</span>
              <div className="flex-1 bg-bg-tertiary/50 h-4 rounded overflow-hidden">
                <div className="h-full bg-purple-400/60 rounded" style={{ width: `${d.fp32Tflops! / topByFp32[0].fp32Tflops! * 100}%` }} />
              </div>
              <span className="text-xs text-text-primary w-20 truncate">{d.modelName.replace(/^(NVIDIA GeForce |NVIDIA |AMD Radeon |AMD |Intel Arc |Intel )/, '')}</span>
              <span className="text-xs text-purple-400 font-medium w-16 text-right">{fmtNum(d.fp32Tflops)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
