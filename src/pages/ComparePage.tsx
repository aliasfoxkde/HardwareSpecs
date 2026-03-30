import { useState, useMemo, useEffect, useRef, memo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { compareDevices, searchDevices, getDeviceMetrics } from '@/lib/api'
import { downloadCSV } from '@/lib/export'

function fmtNum(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '-'
  if (n >= 1000) return `${(n / 1000).toFixed(decimals)}k`
  if (Number.isInteger(n)) return n.toLocaleString()
  return n.toFixed(decimals)
}

const BestBadge = memo(function BestBadge() {
  return <span className="ml-1 inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-green-500/20 text-green-400 uppercase">Best</span>
})

export function ComparePage() {
  useEffect(() => { document.title = 'Compare Devices | SiliconRank'; return () => { document.title = 'SiliconRank' } }, [])
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const param = searchParams.get('devices')
    return param ? param.split(',').filter(Boolean) : []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const addDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on Escape
  useEffect(() => {
    if (!showAdd) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAdd(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showAdd])

  // Sync selectedIds to URL
  useEffect(() => {
    if (selectedIds.length > 0) {
      setSearchParams({ devices: selectedIds.join(',') }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [selectedIds, setSearchParams])

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return []
    return searchDevices(searchQuery, 10)
  }, [searchQuery])

  const devices = useMemo(() => compareDevices(selectedIds), [selectedIds])
  const metricsMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getDeviceMetrics>>()
    for (const id of selectedIds) {
      map.set(id, getDeviceMetrics(id))
    }
    return map
  }, [selectedIds])

  // Pre-compute best values for highlighting
  const bestValues = useMemo(() => {
    const topsPerDollars = selectedIds.map(id => metricsMap.get(id)?.topsPerDollar ?? null)
    const topsPerWatts = selectedIds.map(id => metricsMap.get(id)?.topsPerWatt ?? null)
    const perfPerDollars = selectedIds.map(id => metricsMap.get(id)?.perfPerDollar ?? null)
    const perfPerWatts = selectedIds.map(id => metricsMap.get(id)?.perfPerWatt ?? null)
    const topsValues = selectedIds.map(id => metricsMap.get(id)?.effectiveInt8Tops ?? 0)

    return {
      topsPerDollar: Math.max(...topsPerDollars.filter((v): v is number => v != null)),
      topsPerWatt: Math.max(...topsPerWatts.filter((v): v is number => v != null)),
      perfPerDollar: Math.max(...perfPerDollars.filter((v): v is number => v != null)),
      perfPerWatt: Math.max(...perfPerWatts.filter((v): v is number => v != null)),
      tops: Math.max(...topsValues),
    }
  }, [selectedIds, metricsMap])

  const addDevice = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length < 6) {
      setSelectedIds([...selectedIds, id])
    }
    setShowAdd(false)
    setSearchQuery('')
  }

  const removeDevice = (id: string) => {
    setSelectedIds(selectedIds.filter(d => d !== id))
  }

  const handleExportCSV = () => {
    const rows = devices.map(d => {
      const price = d.prices.sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime())[0]
      const m = metricsMap.get(d.device.deviceId)
      return {
        Device: d.device.modelName,
        Vendor: d.vendor.name,
        Category: d.family.category,
        Architecture: d.family.architecture,
        Launch: d.device.launchDate,
        'Cores/Threads': d.device.cores && d.device.threads ? `${d.device.cores}C/${d.device.threads}T` : '',
        TDP: d.device.tdpWatts ? `${d.device.tdpWatts}W` : '',
        Memory: d.device.memoryCapacityGB ? `${d.device.memoryCapacityGB}GB ${d.device.memoryType ?? ''}`.trim() : '',
        Price: price ? `$${price.priceUsd}` : '',
        'INT8 TOPS': m?.effectiveInt8Tops ?? '',
        'TOPS/$': m?.topsPerDollar ?? '',
        'TOPS/W': m?.topsPerWatt ?? '',
        'Perf/$': m?.perfPerDollar ?? '',
        'Perf/W': m?.perfPerWatt ?? '',
      }
    })
    downloadCSV('siliconrank-comparison.csv', rows)
  }

  if (devices.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Compare Devices</h1>
        <p className="text-text-secondary mb-8">Select devices to compare specifications, benchmarks, and efficiency metrics side by side.</p>
        <div className="max-w-md mx-auto">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for a device to compare..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search devices to compare"
              className="w-full pl-10 pr-4 py-3 bg-bg-secondary border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden" role="listbox" aria-label="Search results">
              {searchResults.map(result => (
                <button
                  key={result.device.deviceId}
                  onClick={() => addDevice(result.device.deviceId)}
                  className="w-full px-4 py-3 text-left hover:bg-bg-tertiary transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-medium text-text-primary">{result.device.modelName}</div>
                    <div className="text-xs text-text-secondary">{result.vendor.name} &middot; {result.family.category}</div>
                  </div>
                  <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Compare Devices</h1>
          <p className="text-sm text-text-secondary" role="status" aria-live="polite">{devices.length} device{devices.length !== 1 ? 's' : ''} selected</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length < 6 && (
            <div className="relative">
              <button
                onClick={() => setShowAdd(!showAdd)}
                aria-expanded={showAdd}
                aria-haspopup="listbox"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-text-primary text-sm font-medium rounded-lg transition-colors"
              >
                + Add Device
              </button>
              {showAdd && (
                <div ref={addDropdownRef} className="absolute right-0 top-full mt-2 w-72 bg-bg-secondary border border-border-subtle rounded-xl shadow-xl z-50 overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                    aria-label="Search devices to add"
                    className="w-full px-4 py-2.5 bg-bg-secondary text-sm text-text-primary placeholder-text-muted focus:outline-none border-b border-border-subtle"
                  />
                  <div className="max-h-64 overflow-y-auto" role="listbox" aria-label="Available devices">
                    {searchResults
                      .filter(r => !selectedIds.includes(r.device.deviceId))
                      .map(result => (
                        <button
                          key={result.device.deviceId}
                          onClick={() => addDevice(result.device.deviceId)}
                          role="option"
                          aria-selected={false}
                          className="w-full px-4 py-2.5 text-left hover:bg-bg-tertiary text-sm text-text-primary"
                        >
                          {result.device.modelName} <span className="text-text-secondary">- {result.vendor.name}</span>
                        </button>
                      ))}
                    {searchResults.filter(r => !selectedIds.includes(r.device.deviceId)).length === 0 && (
                      <div className="px-4 py-3 text-sm text-text-muted">No matching devices</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setSelectedIds([])}
            aria-label="Clear all devices"
            className="px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary text-text-secondary text-sm rounded-lg transition-colors border border-border-subtle"
          >
            Clear
          </button>
          <button
            onClick={handleExportCSV}
            aria-label="Export comparison as CSV"
            className="px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary text-text-secondary text-sm rounded-lg transition-colors border border-border-subtle"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto bg-bg-card/30 border border-border-subtle/50 rounded-xl">
        <table className="w-full" aria-label="Device comparison">
          <thead>
            <tr className="border-b border-border-subtle/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase w-40">Spec</th>
              {devices.map(d => (
                <th key={d.device.deviceId} className="px-4 py-3 text-center min-w-[180px]">
                  <Link to={`/device/${d.device.deviceId}`} className="text-sm font-medium text-brand-400 hover:text-brand-300">
                    {d.device.modelName}
                  </Link>
                  <button
                    onClick={() => removeDevice(d.device.deviceId)}
                    aria-label={`Remove ${d.device.modelName}`}
                    className="block mx-auto mt-1 text-xs text-text-muted hover:text-red-400"
                  >
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Basic Info */}
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">Vendor</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-text-primary text-center">{d.vendor.name}</td>
              ))}
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">Category</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-center">
                  <span className="px-2 py-0.5 bg-bg-tertiary rounded text-xs">{d.family.category}</span>
                </td>
              ))}
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">Architecture</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-text-primary text-center">{d.family.architecture}</td>
              ))}
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">Launch</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-text-primary text-center">{d.device.launchDate}</td>
              ))}
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">Cores / Threads</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-text-primary text-center">
                  {d.device.cores && d.device.threads ? `${d.device.cores}C / ${d.device.threads}T` : '-'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">TDP</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-text-primary text-center">
                  {d.device.tdpWatts ? `${d.device.tdpWatts}W` : '-'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">Memory</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-text-primary text-center">
                  {d.device.memoryCapacityGB ? `${d.device.memoryCapacityGB}GB ${d.device.memoryType ?? ''}`.trim() : '-'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">Price (USD)</td>
              {devices.map(d => {
                const price = d.prices.sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime())[0]
                return (
                  <td key={d.device.deviceId} className="px-4 py-3 text-sm text-text-primary text-center font-medium">
                    {price ? `$${price.priceUsd.toLocaleString()}` : '-'}
                  </td>
                )
              })}
            </tr>

            {/* Compute Specs */}
            <tr className="border-b border-border-subtle/50">
              <td colSpan={devices.length + 1} className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase bg-bg-card/50">
                Compute Performance
              </td>
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">INT8 TOPS</td>
              {devices.map(d => {
                const spec = d.specs.find(s => s.int8Tops !== undefined)
                const m = metricsMap.get(d.device.deviceId)
                const effective = m?.effectiveInt8Tops ?? 0
                const isBest = effective > 0 && effective === bestValues.tops
                return (
                  <td key={d.device.deviceId} className="px-4 py-3 text-sm text-brand-400 text-center font-bold">
                    {effective > 0 ? fmtNum(effective) : (spec?.int8Tops ?? '-')}
                    {isBest && <BestBadge />}
                  </td>
                )
              })}
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">FP16 TFLOPS</td>
              {devices.map(d => {
                const spec = d.specs.find(s => s.fp16Tflops !== undefined)
                return (
                  <td key={d.device.deviceId} className="px-4 py-3 text-sm text-text-primary text-center">
                    {spec?.fp16Tflops ?? '-'}
                  </td>
                )
              })}
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">FP32 TFLOPS</td>
              {devices.map(d => {
                const spec = d.specs.find(s => s.fp32Tflops !== undefined)
                return (
                  <td key={d.device.deviceId} className="px-4 py-3 text-sm text-text-primary text-center">
                    {spec?.fp32Tflops ?? '-'}
                  </td>
                )
              })}
            </tr>

            {/* Efficiency Metrics */}
            <tr className="border-b border-border-subtle/50">
              <td colSpan={devices.length + 1} className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase bg-bg-card/50">
                Efficiency Metrics
              </td>
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">TOPS/$</td>
              {devices.map(d => {
                const m = metricsMap.get(d.device.deviceId)
                const val = m?.topsPerDollar
                const isBest = val != null && val === bestValues.topsPerDollar
                return (
                  <td key={d.device.deviceId} className="px-4 py-3 text-sm text-center font-medium">
                    {val != null && val > 0 ? (
                      <span className="text-green-400">{fmtNum(val)}{isBest && <BestBadge />}</span>
                    ) : '-'}
                  </td>
                )
              })}
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">TOPS/W</td>
              {devices.map(d => {
                const m = metricsMap.get(d.device.deviceId)
                const val = m?.topsPerWatt
                const isBest = val != null && val === bestValues.topsPerWatt
                return (
                  <td key={d.device.deviceId} className="px-4 py-3 text-sm text-center font-medium">
                    {val != null && val > 0 ? (
                      <span className="text-blue-400">{fmtNum(val)}{isBest && <BestBadge />}</span>
                    ) : '-'}
                  </td>
                )
              })}
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">Perf/$</td>
              {devices.map(d => {
                const m = metricsMap.get(d.device.deviceId)
                const val = m?.perfPerDollar
                const isBest = val != null && val === bestValues.perfPerDollar
                return (
                  <td key={d.device.deviceId} className="px-4 py-3 text-sm text-center font-medium">
                    {val != null && val > 0 ? (
                      <span className="text-text-primary">{fmtNum(val, 0)}{isBest && <BestBadge />}</span>
                    ) : '-'}
                  </td>
                )
              })}
            </tr>
            <tr className="border-b border-border-subtle/30">
              <td className="px-4 py-3 text-sm text-text-secondary">Perf/W</td>
              {devices.map(d => {
                const m = metricsMap.get(d.device.deviceId)
                const val = m?.perfPerWatt
                const isBest = val != null && val === bestValues.perfPerWatt
                return (
                  <td key={d.device.deviceId} className="px-4 py-3 text-sm text-center font-medium">
                    {val != null && val > 0 ? (
                      <span className="text-purple-400">{fmtNum(val, 0)}{isBest && <BestBadge />}</span>
                    ) : '-'}
                  </td>
                )
              })}
            </tr>

            {/* Benchmarks */}
            {devices.some(d => d.benchmarks.length > 0) && (
              <>
                <tr className="border-b border-border-subtle/50">
                  <td colSpan={devices.length + 1} className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase bg-bg-card/50">
                    Benchmarks
                  </td>
                </tr>
                {[...new Set(devices.flatMap(d => d.benchmarks.map(b => b.benchmarkTypeId)))].map(bmId => (
                  <tr key={bmId} className="border-b border-border-subtle/30">
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {bmId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    {devices.map(d => {
                      const bm = d.benchmarks.find(b => b.benchmarkTypeId === bmId)
                      return (
                        <td key={d.device.deviceId} className="px-4 py-3 text-sm text-text-primary text-center">
                          {bm ? bm.rawScore.toLocaleString() : '-'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
