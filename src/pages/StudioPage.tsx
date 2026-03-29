import { useState, useMemo, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell, CartesianGrid, Line, ComposedChart } from 'recharts'
import { getDeviceMetricsTable } from '@/lib/api'
import { downloadCSV, downloadJSON } from '@/lib/export'
import { getItem, setItem } from '@/lib/storage'
import type { DeviceMetricsRow } from '@/lib/api'
import { getVendorColor, CHART_STYLES, formatNumber, linearRegression } from '@/components/charts/chartUtils'

const STORAGE_KEY = 'siliconrank:studio'
const SAVED_VIEWS_KEY = 'siliconrank:studio-views'

interface SavedView {
  name: string
  columnVisibility: Record<string, boolean>
  globalFilter: string
  activePanel: string
  timestamp: number
}

const ALL_CATEGORIES = ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'Memory', 'Storage']

interface StudioState {
  columnVisibility: Record<string, boolean>
  globalFilter: string
  activePanel: 'none' | 'distribution' | 'scatter' | 'ranking' | 'quality' | 'correlation'
}

const DEFAULT_VISIBILITY: Record<string, boolean> = {
  deviceId: false,
  topBenchmarkType: false,
  vendorId: false,
  categoryName: false,
  familyName: false,
  status: false,
  formFactor: false,
  tmus: false,
  rops: false,
  tensorCores: false,
  rtCores: false,
  baseClockMhz: false,
  boostClockMhz: false,
  memoryBusWidth: false,
  fp4Tflops: false,
  fp8Tflops: false,
}

const PRESET_VIEWS: Record<string, Record<string, boolean>> = {
  Essential: {
    deviceId: false, modelName: true, vendorName: true, categoryName: true,
    architecture: true, launchDate: true, latestPrice: true, tdpWatts: true,
    effectiveInt8Tops: false, topsPerDollar: false, topsPerWatt: false,
    perfPerDollar: false, perfPerWatt: false, fp16Tflops: false, fp32Tflops: false,
    fp4Tflops: false, fp8Tflops: false,
    dataCompleteness: true, processNm: false, cores: false, threads: false,
    memoryCapacityGB: false, memoryType: false, memoryBandwidthGBps: false,
    formFactor: false, status: false, topBenchmarkScore: false, topBenchmarkType: false,
    vendorId: false, familyName: false,
    tmus: false, rops: false, tensorCores: false, rtCores: false,
    baseClockMhz: false, boostClockMhz: false, memoryBusWidth: false,
  },
  Compute: {
    deviceId: false, modelName: true, vendorName: true, categoryName: true,
    architecture: true, launchDate: true, latestPrice: true, tdpWatts: true,
    effectiveInt8Tops: true, topsPerDollar: true, topsPerWatt: true,
    perfPerDollar: true, perfPerWatt: true, fp16Tflops: true, fp32Tflops: true,
    fp4Tflops: true, fp8Tflops: true,
    dataCompleteness: true, processNm: true, cores: true, threads: true,
    memoryCapacityGB: true, memoryType: true, memoryBandwidthGBps: true,
    formFactor: false, status: false, topBenchmarkScore: true, topBenchmarkType: false,
    vendorId: false, familyName: true,
    tmus: true, rops: true, tensorCores: true, rtCores: true,
    baseClockMhz: true, boostClockMhz: true, memoryBusWidth: true,
  },
  Value: {
    deviceId: false, modelName: true, vendorName: true, categoryName: true,
    architecture: false, launchDate: true, latestPrice: true, tdpWatts: true,
    effectiveInt8Tops: true, topsPerDollar: true, topsPerWatt: true,
    perfPerDollar: true, perfPerWatt: true, fp16Tflops: false, fp32Tflops: false,
    fp4Tflops: false, fp8Tflops: false,
    dataCompleteness: true, processNm: false, cores: false, threads: false,
    memoryCapacityGB: false, memoryType: false, memoryBandwidthGBps: false,
    formFactor: false, status: false, topBenchmarkScore: false, topBenchmarkType: false,
    vendorId: false, familyName: false,
    tmus: false, rops: false, tensorCores: false, rtCores: false,
    baseClockMhz: false, boostClockMhz: false, memoryBusWidth: false,
  },
  Full: {
    deviceId: true, modelName: true, vendorName: true, categoryName: true,
    architecture: true, launchDate: true, latestPrice: true, tdpWatts: true,
    effectiveInt8Tops: true, topsPerDollar: true, topsPerWatt: true,
    perfPerDollar: true, perfPerWatt: true, fp16Tflops: true, fp32Tflops: true,
    fp4Tflops: true, fp8Tflops: true,
    dataCompleteness: true, processNm: true, cores: true, threads: true,
    memoryCapacityGB: true, memoryType: true, memoryBandwidthGBps: true,
    formFactor: true, status: true, topBenchmarkScore: true, topBenchmarkType: true,
    vendorId: true, familyName: true,
    tmus: true, rops: true, tensorCores: true, rtCores: true,
    baseClockMhz: true, boostClockMhz: true, memoryBusWidth: true,
  },
}

function fmtNum(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '-'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  if (Number.isInteger(n)) return n.toLocaleString()
  return n.toFixed(decimals)
}

const PANELS = [
  { id: 'none' as const, label: 'Table Only' },
  { id: 'ranking' as const, label: 'Rankings' },
  { id: 'distribution' as const, label: 'Distributions' },
  { id: 'scatter' as const, label: 'Scatter' },
  { id: 'quality' as const, label: 'Data Quality' },
  { id: 'correlation' as const, label: 'Correlation' },
]

// ─── Distribution Panel ─────────────────────────────
function DistributionPanel({ data }: { data: DeviceMetricsRow[] }) {
  const filtered = useMemo(() => data.filter(d => d.effectiveInt8Tops > 0), [data])

  const topDistribution = useMemo(() => {
    const buckets = [
      { range: '0-1', min: 0, max: 1 },
      { range: '1-10', min: 1, max: 10 },
      { range: '10-50', min: 10, max: 50 },
      { range: '50-100', min: 50, max: 100 },
      { range: '100-500', min: 100, max: 500 },
      { range: '500-1000', min: 500, max: 1000 },
      { range: '1000+', min: 1000, max: Infinity },
    ]
    return buckets.map(b => ({
      range: b.range,
      count: filtered.filter(d => d.effectiveInt8Tops >= b.min && d.effectiveInt8Tops < b.max).length,
    }))
  }, [filtered])

  const tdpDistribution = useMemo(() => {
    const buckets = [
      { range: '0-50W', min: 0, max: 50 },
      { range: '50-100W', min: 50, max: 100 },
      { range: '100-200W', min: 100, max: 200 },
      { range: '200-350W', min: 200, max: 350 },
      { range: '350W+', min: 350, max: Infinity },
    ]
    return buckets.map(b => ({
      range: b.range,
      count: data.filter(d => d.tdpWatts != null && d.tdpWatts >= b.min && d.tdpWatts < b.max).length,
    }))
  }, [data])

  const priceDistribution = useMemo(() => {
    const buckets = [
      { range: '0-100', min: 0, max: 100 },
      { range: '100-300', min: 100, max: 300 },
      { range: '300-500', min: 300, max: 500 },
      { range: '500-1000', min: 500, max: 1000 },
      { range: '1000+', min: 1000, max: Infinity },
    ]
    return buckets.map(b => ({
      range: b.range,
      count: data.filter(d => d.latestPrice != null && d.latestPrice >= b.min && d.latestPrice < b.max).length,
    }))
  }, [data])

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">INT8 TOPS Distribution</h4>
      <MiniBar data={topDistribution} color="#3b82f6" />
      <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mt-3">TDP Distribution</h4>
      <MiniBar data={tdpDistribution} color="#ef4444" />
      <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mt-3">Price Distribution</h4>
      <MiniBar data={priceDistribution} color="#22c55e" />
      <div className="text-xs text-text-muted mt-4">
        Showing {filtered.length} devices with TOPS data, {data.length} total
      </div>
    </div>
  )
}

// ─── Scatter Panel ─────────────────────────────────
function ScatterPanel({ data }: { data: DeviceMetricsRow[] }) {
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

// ─── Ranking Panel ─────────────────────────────────
function RankingPanel({ data }: { data: DeviceMetricsRow[] }) {
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

// ─── Data Quality Panel ─────────────────────────────
function DataQualityPanel({ data }: { data: DeviceMetricsRow[] }) {
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

// ─── Correlation Panel ─────────────────────────────
function CorrelationPanel({ data }: { data: DeviceMetricsRow[] }) {
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

// ─── Mini Bar (for distributions) ────────────────────
function MiniBar({ data, color }: { data: { range: string; count: number }[]; color: string }) {
  const _max = Math.max(...data.map(d => d.count), 1)
  void _max
  return (
    <ResponsiveContainer width="100%" height={data.length * 22}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 55 }}>
        <XAxis type="number" hide tick={false} />
        <YAxis type="category" dataKey="range" tick={{ fill: CHART_STYLES.axisTick, fontSize: 10 }} width={50} />
        <Tooltip contentStyle={{ backgroundColor: CHART_STYLES.tooltipBg, border: `1px solid ${CHART_STYLES.tooltipBorder}`, borderRadius: '8px', color: CHART_STYLES.tooltipText, fontSize: 12 }} />
        <Bar dataKey="count" fill={color} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Stat Card ───────────────────────────────────────
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-tertiary/30 rounded-lg p-2 text-center">
      <div className="text-[10px] text-text-muted uppercase">{label}</div>
      <div className="text-sm font-bold text-text-primary">{value}</div>
    </div>
  )
}

// ─── Main Studio Page ───────────────────────────────
export function StudioPage() {
  const [savedState, setSavedState] = useState<StudioState>(() => {
    const saved = getItem<StudioState>(STORAGE_KEY, { columnVisibility: DEFAULT_VISIBILITY, globalFilter: '', activePanel: 'none' })
    return {
      ...saved,
      columnVisibility: { ...DEFAULT_VISIBILITY, ...saved.columnVisibility },
    }
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    getItem<Record<string, string>>('siliconrank:studio-notes', {})
  )
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [rowExpanded, setRowExpanded] = useState<Set<string>>(new Set())
  const [savedViews, setSavedViews] = useState<SavedView[]>(() =>
    getItem<SavedView[]>(SAVED_VIEWS_KEY, [])
  )
  const [showFilters, setShowFilters] = useState(false)
  const [advFilters, setAdvFilters] = useState({
    categories: new Set<string>(),
    vendors: new Set<string>(),
    tdpMin: '', tdpMax: '',
    priceMin: '', priceMax: '',
    topsMin: '', topsMax: '',
  })

  const data = useMemo(() => getDeviceMetricsTable(), [])

  const topVendors = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of data) {
      const v = d.vendorName ?? ''
      if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name]) => name)
  }, [data])

  const columns = useMemo<ColumnDef<DeviceMetricsRow, unknown>[]>(() => [
    { accessorKey: 'modelName', header: 'Device', size: 180 },
    { accessorKey: 'vendorName', header: 'Vendor', size: 100 },
    { accessorKey: 'categoryName', header: 'Category', size: 80 },
    { accessorKey: 'architecture', header: 'Architecture', size: 120 },
    { accessorKey: 'launchDate', header: 'Launch', size: 100 },
    { accessorKey: 'processNm', header: 'Process (nm)', size: 80, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'cores', header: 'Cores', size: 70, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'threads', header: 'Threads', size: 70, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'memoryCapacityGB', header: 'Memory (GB)', size: 90, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'memoryType', header: 'Mem Type', size: 70, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'memoryBandwidthGBps', header: 'Mem BW (GB/s)', size: 100, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'memoryBusWidth', header: 'Bus Width', size: 80, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'tmus', header: 'TMUs', size: 70, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'rops', header: 'ROPs', size: 70, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'tensorCores', header: 'Tensor Cores', size: 90, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'rtCores', header: 'RT Cores', size: 80, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'baseClockMhz', header: 'Base Clock', size: 80, cell: info => { const v = info.getValue(); return v != null ? `${v} MHz` : '-' } },
    { accessorKey: 'boostClockMhz', header: 'Boost Clock', size: 80, cell: info => { const v = info.getValue(); return v != null ? `${v} MHz` : '-' } },
    { accessorKey: 'tdpWatts', header: 'TDP (W)', size: 80, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'latestPrice', header: 'Price ($)', size: 90, cell: info => { const v = info.getValue() as number | null; return v != null ? `$${v.toLocaleString()}` : '-' } },
    { accessorKey: 'effectiveInt8Tops', header: 'INT8 TOPS', size: 100, cell: info => { const v = info.getValue() as number; return v > 0 ? fmtNum(v) : '-' } },
    { accessorKey: 'topsPerDollar', header: 'TOPS/$', size: 90, cell: info => { const v = info.getValue() as number | null; return v != null && v > 0 ? fmtNum(v) : '-' } },
    { accessorKey: 'topsPerWatt', header: 'TOPS/W', size: 90, cell: info => { const v = info.getValue() as number | null; return v != null && v > 0 ? fmtNum(v) : '-' } },
    { accessorKey: 'perfPerDollar', header: 'Perf/$', size: 90, cell: info => { const v = info.getValue() as number | null; return v != null && v > 0 ? fmtNum(v, 0) : '-' } },
    { accessorKey: 'perfPerWatt', header: 'Perf/W', size: 90, cell: info => { const v = info.getValue() as number | null; return v != null && v > 0 ? fmtNum(v, 0) : '-' } },
    { accessorKey: 'fp16Tflops', header: 'FP16 TFLOPS', size: 100, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'fp32Tflops', header: 'FP32 TFLOPS', size: 100, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'fp4Tflops', header: 'FP4 TOPS', size: 90, cell: info => { const v = info.getValue() as number | null; return v != null && v > 0 ? fmtNum(v) : '-' } },
    { accessorKey: 'fp8Tflops', header: 'FP8 TOPS', size: 90, cell: info => { const v = info.getValue() as number | null; return v != null && v > 0 ? fmtNum(v) : '-' } },
    { accessorKey: 'topBenchmarkScore', header: 'Top Benchmark', size: 110, cell: info => { const v = info.getValue(); return v != null ? Number(v).toLocaleString() : '-' } },
    { accessorKey: 'dataCompleteness', header: 'Data Quality', size: 100, cell: info => {
      const v = info.getValue() as number
      const pct = Math.round(v * 100)
      const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
      return (
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-text-muted">{pct}%</span>
        </div>
      )
    }},
    { accessorKey: 'familyName', header: 'Family', size: 120 },
    { accessorKey: 'status', header: 'Status', size: 70 },
    { accessorKey: 'formFactor', header: 'Form Factor', size: 100, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'vendorId', header: 'Vendor ID', size: 100 },
    { accessorKey: 'deviceId', header: 'Device ID', size: 140 },
    { accessorKey: 'topBenchmarkType', header: 'Benchmark Type', size: 130, cell: info => info.getValue() ?? '-' },
  ], [])

  const filteredByAdvData = useMemo(() => {
    let result = data
    if (advFilters.categories.size > 0) {
      result = result.filter(d => advFilters.categories.has(d.categoryName))
    }
    if (advFilters.vendors.size > 0) {
      result = result.filter(d => advFilters.vendors.has(d.vendorName))
    }
    if (advFilters.tdpMin !== '') result = result.filter(d => d.tdpWatts != null && d.tdpWatts >= Number(advFilters.tdpMin))
    if (advFilters.tdpMax !== '') result = result.filter(d => d.tdpWatts != null && d.tdpWatts <= Number(advFilters.tdpMax))
    if (advFilters.priceMin !== '') result = result.filter(d => d.latestPrice != null && d.latestPrice >= Number(advFilters.priceMin))
    if (advFilters.priceMax !== '') result = result.filter(d => d.latestPrice != null && d.latestPrice <= Number(advFilters.priceMax))
    if (advFilters.topsMin !== '') result = result.filter(d => d.effectiveInt8Tops >= Number(advFilters.topsMin))
    if (advFilters.topsMax !== '') result = result.filter(d => d.effectiveInt8Tops <= Number(advFilters.topsMax))
    return result
  }, [data, advFilters])

  const table = useReactTable({
    data: filteredByAdvData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility: savedState.columnVisibility,
      globalFilter: savedState.globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: (updater) => {
      const newVisibility = typeof updater === 'function' ? updater(savedState.columnVisibility) : updater
      const newState = { ...savedState, columnVisibility: newVisibility }
      setSavedState(newState)
      setItem(STORAGE_KEY, newState)
    },
    onGlobalFilterChange: (filter) => {
      const newState = { ...savedState, globalFilter: String(filter ?? '') }
      setSavedState(newState)
      setItem(STORAGE_KEY, newState)
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  })

  const visibleColumns = table.getAllLeafColumns()

  const toggleRow = useCallback((deviceId: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev)
      if (next.has(deviceId)) next.delete(deviceId)
      else next.add(deviceId)
      return next
    })
  }, [])

  const toggleAllRows = useCallback(() => {
    if (selectedRows.size === table.getFilteredRowModel().rows.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(table.getFilteredRowModel().rows.map(r => r.original.deviceId)))
    }
  }, [selectedRows.size, table])

  const saveNote = useCallback((deviceId: string, note: string) => {
    const newNotes = { ...notes, [deviceId]: note }
    setNotes(newNotes)
    setItem('siliconrank:studio-notes', newNotes)
    setEditingNote(null)
  }, [notes])

  const handleExportCSV = () => {
    const rows = table.getFilteredRowModel().rows.map(r => r.original)
    downloadCSV(`siliconrank-studio-${Date.now()}.csv`, rows as unknown as Record<string, unknown>[])
  }

  const handleExportJSON = () => {
    const rows = table.getFilteredRowModel().rows.map(r => r.original)
    downloadJSON(`siliconrank-studio-${Date.now()}.json`, rows)
  }

  const saveView = useCallback(() => {
    const name = window.prompt('View name:')
    if (!name?.trim()) return
    const view: SavedView = {
      name: name.trim(),
      columnVisibility: savedState.columnVisibility,
      globalFilter: savedState.globalFilter,
      activePanel: savedState.activePanel,
      timestamp: Date.now(),
    }
    const updated = [...savedViews.filter(v => v.name !== view.name), view]
    setSavedViews(updated)
    setItem(SAVED_VIEWS_KEY, updated)
  }, [savedState, savedViews])

  const loadView = useCallback((view: SavedView) => {
    const newState = {
      ...savedState,
      columnVisibility: { ...DEFAULT_VISIBILITY, ...view.columnVisibility },
      globalFilter: view.globalFilter,
      activePanel: view.activePanel as StudioState['activePanel'],
    }
    setSavedState(newState)
    setItem(STORAGE_KEY, newState)
  }, [savedState])

  const deleteView = useCallback((name: string) => {
    const updated = savedViews.filter(v => v.name !== name)
    setSavedViews(updated)
    setItem(SAVED_VIEWS_KEY, updated)
  }, [savedViews])

  const hasActiveFilters = advFilters.categories.size > 0 || advFilters.vendors.size > 0 ||
    advFilters.tdpMin !== '' || advFilters.tdpMax !== '' ||
    advFilters.priceMin !== '' || advFilters.priceMax !== '' ||
    advFilters.topsMin !== '' || advFilters.topsMax !== ''

  const clearAdvFilters = useCallback(() => {
    setAdvFilters({
      categories: new Set(),
      vendors: new Set(),
      tdpMin: '', tdpMax: '',
      priceMin: '', priceMax: '',
      topsMin: '', topsMax: '',
    })
  }, [])

  // Analysis stats for selected rows
  const analysisStats = useMemo(() => {
    if (selectedRows.size === 0) return null
    const selected = data.filter(d => selectedRows.has(d.deviceId))
    if (selected.length === 0) return null

    const avg = (arr: (number | null)[]) => {
      const vals = arr.filter((v): v is number => v != null)
      return vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : null
    }
    const median = (arr: number[]) => {
      if (arr.length === 0) return null
      const sorted = [...arr].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
    }
    const stddev = (arr: number[]) => {
      if (arr.length < 2) return null
      const m = avg(arr)!
      return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length)
    }

    const prices = selected.map(d => d.latestPrice).filter((v): v is number => v != null)
    const tops = selected.map(d => d.effectiveInt8Tops).filter(v => v > 0)
    const topsPerDollar = selected.map(d => d.topsPerDollar).filter((v): v is number => v != null && v > 0)
    const topsPerWatt = selected.map(d => d.topsPerWatt).filter((v): v is number => v != null && v > 0)
    const tdp = selected.map(d => d.tdpWatts).filter((v): v is number => v != null)

    return {
      count: selected.length,
      avgPrice: avg(prices),
      medianPrice: median(prices),
      avgTops: avg(tops),
      maxTops: tops.length > 0 ? Math.max(...tops) : null,
      avgTopsPerDollar: avg(topsPerDollar),
      bestTopsPerDollar: topsPerDollar.length > 0 ? Math.max(...topsPerDollar) : null,
      avgTopsPerWatt: avg(topsPerWatt),
      bestTopsPerWatt: topsPerWatt.length > 0 ? Math.max(...topsPerWatt) : null,
      avgTdp: avg(tdp),
      priceStddev: stddev(prices),
    }
  }, [selectedRows, data])

  const filteredData = useMemo(() => table.getFilteredRowModel().rows.map(r => r.original), [table])

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fade-in flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Header — fixed */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Studio</h1>
          <p className="text-sm text-text-secondary">{table.getFilteredRowModel().rows.length} devices &middot; {selectedRows.size} selected</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-text-primary text-sm font-medium rounded-lg transition-colors">
            Export CSV
          </button>
          <button onClick={handleExportJSON} className="px-3 py-1.5 bg-bg-secondary hover:bg-bg-tertiary text-text-secondary text-sm rounded-lg transition-colors border border-border-subtle">
            Export JSON
          </button>
        </div>
      </div>

      {/* Controls — fixed */}
      <div className="mb-3 space-y-2 shrink-0">
        {/* Search */}
        <input
          type="text"
          placeholder="Filter devices..."
          value={savedState.globalFilter}
          onChange={e => table.setGlobalFilter(e.target.value)}
          className="w-full px-4 py-2.5 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-bg-secondary/50 border border-border-subtle rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Advanced Filters</span>
              {hasActiveFilters && (
                <button onClick={clearAdvFilters} className="text-xs text-red-400 hover:text-red-300">Clear all</button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Categories */}
              <div>
                <div className="text-[10px] text-text-muted uppercase mb-1">Category</div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {ALL_CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-1 text-xs text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={advFilters.categories.has(cat)}
                        onChange={e => {
                          setAdvFilters(prev => {
                            const next = new Set(prev.categories)
                            if (e.target.checked) next.add(cat)
                            else next.delete(cat)
                            return { ...prev, categories: next }
                          })
                        }}
                        className="rounded"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>
              {/* Vendors */}
              <div>
                <div className="text-[10px] text-text-muted uppercase mb-1">Vendor</div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {topVendors.map(v => (
                    <label key={v} className="flex items-center gap-1 text-xs text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={advFilters.vendors.has(v)}
                        onChange={e => {
                          setAdvFilters(prev => {
                            const next = new Set(prev.vendors)
                            if (e.target.checked) next.add(v)
                            else next.delete(v)
                            return { ...prev, vendors: next }
                          })
                        }}
                        className="rounded"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
              {/* TDP Range */}
              <div>
                <div className="text-[10px] text-text-muted uppercase mb-1">TDP (W)</div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={advFilters.tdpMin}
                    onChange={e => setAdvFilters(prev => ({ ...prev, tdpMin: e.target.value }))}
                    className="w-full px-2 py-1 bg-bg-tertiary/50 border border-border-subtle rounded text-xs text-text-primary"
                  />
                  <span className="text-text-muted text-xs">&ndash;</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={advFilters.tdpMax}
                    onChange={e => setAdvFilters(prev => ({ ...prev, tdpMax: e.target.value }))}
                    className="w-full px-2 py-1 bg-bg-tertiary/50 border border-border-subtle rounded text-xs text-text-primary"
                  />
                </div>
              </div>
              {/* Price Range */}
              <div>
                <div className="text-[10px] text-text-muted uppercase mb-1">Price ($)</div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={advFilters.priceMin}
                    onChange={e => setAdvFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                    className="w-full px-2 py-1 bg-bg-tertiary/50 border border-border-subtle rounded text-xs text-text-primary"
                  />
                  <span className="text-text-muted text-xs">&ndash;</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={advFilters.priceMax}
                    onChange={e => setAdvFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                    className="w-full px-2 py-1 bg-bg-tertiary/50 border border-border-subtle rounded text-xs text-text-primary"
                  />
                </div>
              </div>
            </div>
            {/* TOPS Range — full width */}
            <div className="max-w-xs">
              <div className="text-[10px] text-text-muted uppercase mb-1">INT8 TOPS</div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={advFilters.topsMin}
                  onChange={e => setAdvFilters(prev => ({ ...prev, topsMin: e.target.value }))}
                  className="w-full px-2 py-1 bg-bg-tertiary/50 border border-border-subtle rounded text-xs text-text-primary"
                />
                <span className="text-text-muted text-xs">&ndash;</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={advFilters.topsMax}
                  onChange={e => setAdvFilters(prev => ({ ...prev, topsMax: e.target.value }))}
                  className="w-full px-2 py-1 bg-bg-tertiary/50 border border-border-subtle rounded text-xs text-text-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Preset Views + Column Toggle + Panel Toggle */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-text-muted font-medium">Views:</span>
          {Object.entries(PRESET_VIEWS).map(([name, vis]) => (
            <button
              key={name}
              onClick={() => {
                const newState = { ...savedState, columnVisibility: vis }
                setSavedState(newState)
                setItem(STORAGE_KEY, newState)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                JSON.stringify(savedState.columnVisibility) === JSON.stringify(vis)
                  ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {name}
            </button>
          ))}

          <span className="text-xs text-text-muted font-medium ml-2">Panel:</span>
          <button
            onClick={saveView}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle"
          >
            Save View
          </button>
          {savedViews.map(view => (
            <div key={view.name} className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium bg-brand-600/10 text-brand-300 border border-brand-500/20">
              <button onClick={() => loadView(view)} className="hover:text-brand-200">{view.name}</button>
              <button onClick={() => deleteView(view.name)} className="ml-1 text-text-muted hover:text-red-400">&times;</button>
            </div>
          ))}

          <button
            onClick={() => setShowFilters(prev => !prev)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
              showFilters || hasActiveFilters
                ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary border-border-subtle'
            }`}
          >
            Filters{hasActiveFilters ? ' *' : ''}
          </button>
          {PANELS.map(panel => (
            <button
              key={panel.id}
              onClick={() => {
                const newState = { ...savedState, activePanel: panel.id }
                setSavedState(newState)
                setItem(STORAGE_KEY, newState)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                savedState.activePanel === panel.id
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {panel.label}
            </button>
          ))}

          <span className="text-xs text-text-muted font-medium ml-2">Columns:</span>
          <div className="relative">
            <button
              onClick={(e) => {
                const menu = e.currentTarget.nextElementSibling
                menu?.classList.toggle('hidden')
              }}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle"
            >
              Toggle ({visibleColumns.length}/{table.getAllLeafColumns().length})
            </button>
            <div className="hidden absolute top-full mt-1 left-0 z-50 bg-bg-secondary border border-border-subtle rounded-lg shadow-xl max-h-80 overflow-y-auto w-56 py-2">
              {table.getAllLeafColumns().map(col => (
                <label key={col.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-bg-tertiary cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={() => col.toggleVisibility()}
                    className="rounded"
                  />
                  <span className="text-text-primary">{col.columnDef.header as string}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Panel — fixed when visible */}
      {analysisStats && (
        <div className="mb-3 bg-bg-card/30 border border-border-subtle/50 rounded-xl p-3 shrink-0">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Analysis — {analysisStats.count} selected devices
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <StatCard label="Avg Price" value={analysisStats.avgPrice ? `$${Math.round(analysisStats.avgPrice).toLocaleString()}` : '-'} />
            <StatCard label="Median Price" value={analysisStats.medianPrice ? `$${Math.round(analysisStats.medianPrice).toLocaleString()}` : '-'} />
            <StatCard label="Avg TOPS" value={analysisStats.avgTops ? fmtNum(analysisStats.avgTops) : '-'} />
            <StatCard label="Max TOPS" value={analysisStats.maxTops ? fmtNum(analysisStats.maxTops) : '-'} />
            <StatCard label="Best TOPS/$" value={analysisStats.bestTopsPerDollar ? fmtNum(analysisStats.bestTopsPerDollar) : '-'} />
            <StatCard label="Best TOPS/W" value={analysisStats.bestTopsPerWatt ? fmtNum(analysisStats.bestTopsPerWatt) : '-'} />
            <StatCard label="Avg TDP" value={analysisStats.avgTdp ? `${Math.round(analysisStats.avgTdp)}W` : '-'} />
          </div>
        </div>
      )}

      {/* Main Content: Table + Side Panel — scrollable */}
      <div className="flex gap-6 min-h-0 flex-1">
        {/* Table */}
        <div className={`bg-bg-card/30 border border-border-subtle/50 rounded-xl overflow-hidden flex flex-col min-w-0 ${savedState.activePanel !== 'none' ? 'flex-1' : 'w-full'}`}>
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border-subtle/50 bg-bg-secondary">
                  <th className="px-3 py-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === table.getFilteredRowModel().rows.length && selectedRows.size > 0}
                      onChange={toggleAllRows}
                      className="rounded"
                    />
                  </th>
                  <th className="px-1 py-2.5 w-8" />
                  {table.getLeafHeaders().map(header => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider text-left cursor-pointer select-none hover:text-text-primary whitespace-nowrap"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase w-16">Notes</th>
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => {
                  const isExpanded = rowExpanded.has(row.original.deviceId)
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-border-subtle/30 hover:bg-bg-tertiary/30 transition-colors ${selectedRows.has(row.original.deviceId) ? 'bg-brand-600/5' : ''}`}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.original.deviceId)}
                          onChange={() => toggleRow(row.original.deviceId)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-1 py-2">
                        <button
                          onClick={() => {
                            setRowExpanded(prev => {
                              const next = new Set(prev)
                              if (next.has(row.original.deviceId)) next.delete(row.original.deviceId)
                              else next.add(row.original.deviceId)
                              return next
                            })
                          }}
                          className="text-xs text-text-muted hover:text-text-primary"
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      </td>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-3 py-2 text-text-primary whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        {editingNote === row.original.deviceId ? (
                          <input
                            autoFocus
                            defaultValue={notes[row.original.deviceId] ?? ''}
                            onBlur={e => saveNote(row.original.deviceId, e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveNote(row.original.deviceId, e.currentTarget.value); if (e.key === 'Escape') setEditingNote(null) }}
                            className="w-20 px-1 py-0.5 bg-bg-secondary border border-border-subtle rounded text-xs text-text-primary"
                          />
                        ) : (
                          <button
                            onClick={() => setEditingNote(row.original.deviceId)}
                            className={`text-xs ${notes[row.original.deviceId] ? 'text-yellow-400' : 'text-text-muted hover:text-text-primary'}`}
                            title={notes[row.original.deviceId] ?? 'Add note'}
                          >
                            {notes[row.original.deviceId] ? '✎' : '○'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {table.getRowModel().rows.length === 0 && (
            <div className="px-4 py-12 text-center text-text-muted">No devices match your filter.</div>
          )}
          <div className="px-4 py-2 border-t border-border-subtle/30 text-xs text-text-muted shrink-0">
            {table.getFilteredRowModel().rows.length} of {data.length} devices
            {selectedRows.size > 0 && ` · ${selectedRows.size} selected`}
          </div>
        </div>

        {/* Side Panel */}
        {savedState.activePanel !== 'none' && (
          <div className="w-80 shrink-0 bg-bg-card/30 border border-border-subtle/50 rounded-xl p-4 overflow-y-auto">
            {savedState.activePanel === 'ranking' && <RankingPanel data={filteredData} />}
            {savedState.activePanel === 'distribution' && <DistributionPanel data={filteredData} />}
            {savedState.activePanel === 'scatter' && <ScatterPanel data={filteredData} />}
            {savedState.activePanel === 'quality' && <DataQualityPanel data={filteredData} />}
            {savedState.activePanel === 'correlation' && <CorrelationPanel data={filteredData} />}
          </div>
        )}
      </div>
    </div>
  )
}
