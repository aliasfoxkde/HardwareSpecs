import { useState, useMemo, useCallback, useEffect } from 'react'
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
import { getDeviceMetricsTable } from '@/lib/api'
import { downloadCSV, downloadJSON } from '@/lib/export'
import { getItem, setItem } from '@/lib/storage'
import type { DeviceMetricsRow } from '@/lib/api'
import { fmtNum } from '@/components/studio/studioUtils'
import { StatCard } from '@/components/studio/StatCard'
import { DistributionPanel } from '@/components/studio/DistributionPanel'
import { ScatterPanel } from '@/components/studio/ScatterPanel'
import { RankingPanel } from '@/components/studio/RankingPanel'
import { DataQualityPanel } from '@/components/studio/DataQualityPanel'
import { CorrelationPanel } from '@/components/studio/CorrelationPanel'

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

const PANELS = [
  { id: 'none' as const, label: 'Table Only' },
  { id: 'ranking' as const, label: 'Rankings' },
  { id: 'distribution' as const, label: 'Distributions' },
  { id: 'scatter' as const, label: 'Scatter' },
  { id: 'quality' as const, label: 'Data Quality' },
  { id: 'correlation' as const, label: 'Correlation' },
]

// ─── Main Studio Page ───────────────────────────────
export function StudioPage() {
  useEffect(() => { document.title = 'Analytics Studio | SiliconRank'; return () => { document.title = 'SiliconRank' } }, [])
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
