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
import { getDeviceMetricsTable } from '@/lib/api'
import { downloadCSV, downloadJSON } from '@/lib/export'
import { getItem, setItem } from '@/lib/storage'
import type { DeviceMetricsRow } from '@/lib/api'

const STORAGE_KEY = 'siliconrank:studio'

interface StudioState {
  columnVisibility: Record<string, boolean>
  globalFilter: string
}

const DEFAULT_VISIBILITY: Record<string, boolean> = {
  deviceId: false,
  topBenchmarkType: false,
  vendorId: false,
  categoryName: false,
  familyName: false,
  status: false,
  formFactor: false,
}

const PRESET_VIEWS: Record<string, Record<string, boolean>> = {
  Essential: {
    deviceId: false, modelName: true, vendorName: true, categoryName: true,
    architecture: true, launchDate: true, latestPrice: true, tdpWatts: true,
    effectiveInt8Tops: false, topsPerDollar: false, topsPerWatt: false,
    perfPerDollar: false, perfPerWatt: false, fp16Tflops: false, fp32Tflops: false,
    dataCompleteness: true, processNm: false, cores: false, threads: false,
    memoryCapacityGB: false, memoryType: false, memoryBandwidthGBps: false,
    formFactor: false, status: false, topBenchmarkScore: false, topBenchmarkType: false,
    vendorId: false, familyName: false,
  },
  Compute: {
    deviceId: false, modelName: true, vendorName: true, categoryName: true,
    architecture: true, launchDate: true, latestPrice: true, tdpWatts: true,
    effectiveInt8Tops: true, topsPerDollar: true, topsPerWatt: true,
    perfPerDollar: true, perfPerWatt: true, fp16Tflops: true, fp32Tflops: true,
    dataCompleteness: true, processNm: true, cores: true, threads: true,
    memoryCapacityGB: true, memoryType: true, memoryBandwidthGBps: true,
    formFactor: false, status: false, topBenchmarkScore: true, topBenchmarkType: false,
    vendorId: false, familyName: true,
  },
  Value: {
    deviceId: false, modelName: true, vendorName: true, categoryName: true,
    architecture: false, launchDate: true, latestPrice: true, tdpWatts: true,
    effectiveInt8Tops: true, topsPerDollar: true, topsPerWatt: true,
    perfPerDollar: true, perfPerWatt: true, fp16Tflops: false, fp32Tflops: false,
    dataCompleteness: true, processNm: false, cores: false, threads: false,
    memoryCapacityGB: false, memoryType: false, memoryBandwidthGBps: false,
    formFactor: false, status: false, topBenchmarkScore: false, topBenchmarkType: false,
    vendorId: false, familyName: false,
  },
  Full: {
    deviceId: true, modelName: true, vendorName: true, categoryName: true,
    architecture: true, launchDate: true, latestPrice: true, tdpWatts: true,
    effectiveInt8Tops: true, topsPerDollar: true, topsPerWatt: true,
    perfPerDollar: true, perfPerWatt: true, fp16Tflops: true, fp32Tflops: true,
    dataCompleteness: true, processNm: true, cores: true, threads: true,
    memoryCapacityGB: true, memoryType: true, memoryBandwidthGBps: true,
    formFactor: true, status: true, topBenchmarkScore: true, topBenchmarkType: true,
    vendorId: true, familyName: true,
  },
}

function fmtNum(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '-'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  if (Number.isInteger(n)) return n.toLocaleString()
  return n.toFixed(decimals)
}

export function StudioPage() {
  const [savedState, setSavedState] = useState<StudioState>(() =>
    getItem<StudioState>(STORAGE_KEY, { columnVisibility: DEFAULT_VISIBILITY, globalFilter: '' })
  )
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    getItem<Record<string, string>>('siliconrank:studio-notes', {})
  )
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [rowExpanded, setRowExpanded] = useState<Set<string>>(new Set())

  const data = useMemo(() => getDeviceMetricsTable(), [])

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
    { accessorKey: 'tdpWatts', header: 'TDP (W)', size: 80, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'latestPrice', header: 'Price ($)', size: 90, cell: info => info.getValue() != null ? `$${Number(info.getValue()).toLocaleString()}` : '-' },
    { accessorKey: 'effectiveInt8Tops', header: 'INT8 TOPS', size: 100, cell: info => { const v = info.getValue(); return v > 0 ? fmtNum(v) : '-' } },
    { accessorKey: 'topsPerDollar', header: 'TOPS/$', size: 90, cell: info => { const v = info.getValue(); return v != null && v > 0 ? fmtNum(v) : '-' } },
    { accessorKey: 'topsPerWatt', header: 'TOPS/W', size: 90, cell: info => { const v = info.getValue(); return v != null && v > 0 ? fmtNum(v) : '-' } },
    { accessorKey: 'perfPerDollar', header: 'Perf/$', size: 90, cell: info => { const v = info.getValue(); return v != null && v > 0 ? fmtNum(v, 0) : '-' } },
    { accessorKey: 'perfPerWatt', header: 'Perf/W', size: 90, cell: info => { const v = info.getValue(); return v != null && v > 0 ? fmtNum(v, 0) : '-' } },
    { accessorKey: 'fp16Tflops', header: 'FP16 TFLOPS', size: 100, cell: info => info.getValue() ?? '-' },
    { accessorKey: 'fp32Tflops', header: 'FP32 TFLOPS', size: 100, cell: info => info.getValue() ?? '-' },
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

  const table = useReactTable({
    data,
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

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
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

      {/* Controls */}
      <div className="mb-4 space-y-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Filter devices..."
          value={savedState.globalFilter}
          onChange={e => table.setGlobalFilter(e.target.value)}
          className="w-full px-4 py-2.5 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {/* Preset Views + Column Toggle */}
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

          <span className="text-xs text-text-muted font-medium ml-4">Columns:</span>
          <div className="relative">
            <button
              onClick={(e) => {
                const menu = e.currentTarget.nextElementSibling
                menu?.classList.toggle('hidden')
              }}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle"
            >
              Toggle Columns ({visibleColumns.length}/{table.getAllLeafColumns().length})
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

      {/* Analysis Panel */}
      {analysisStats && (
        <div className="mb-4 bg-bg-card/30 border border-border-subtle/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Analysis — {analysisStats.count} selected devices
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
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

      {/* Table */}
      <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle/50 bg-bg-card/50">
                <th className="px-3 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === table.getFilteredRowModel().rows.length && selectedRows.size > 0}
                    onChange={toggleAllRows}
                    className="rounded"
                  />
                </th>
                <th className="px-1 py-2.5 w-8" />
                {visibleColumns.map(col => (
                  <th
                    key={col.id}
                    onClick={col.getToggleSortingHandler()}
                    className="px-3 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider text-left cursor-pointer select-none hover:text-text-primary whitespace-nowrap"
                  >
                    {flexRender(col.columnDef.header, col.getContext())}
                    {{ asc: ' ↑', desc: ' ↓' }[col.getIsSorted() as string] ?? ''}
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
                    {visibleColumns.map(col => (
                      <td key={col.id} className="px-3 py-2 text-text-primary whitespace-nowrap">
                        {flexRender(col.columnDef.cell, col.getContext())}
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
        <div className="px-4 py-3 border-t border-border-subtle/30 text-xs text-text-muted">
          {table.getFilteredRowModel().rows.length} of {data.length} devices
          {selectedRows.size > 0 && ` · ${selectedRows.size} selected`}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-tertiary/30 rounded-lg p-2 text-center">
      <div className="text-[10px] text-text-muted uppercase">{label}</div>
      <div className="text-sm font-bold text-text-primary">{value}</div>
    </div>
  )
}
