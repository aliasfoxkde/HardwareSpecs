import { useState, useMemo } from 'react'
import { getVendors, getFamilies, getDevices, getDevice, getDevicesByCategory, searchDevices, getStats, compareDevices, getBenchmarkTypes, getSources } from '@/lib/api'
import type { DeviceMetrics, DeviceMetricsRow } from '@/lib/api'

const apiFunctions = [
  { name: 'getVendors', desc: 'Get all hardware vendors', fn: getVendors as () => unknown, params: [] },
  { name: 'getFamilies', desc: 'Get device families, optionally filtered by vendor or category', fn: (opts?: { vendorId?: string; category?: string }) => getFamilies(opts as any), params: ['vendorId?', 'category?'] },
  { name: 'getDevices', desc: 'Get paginated devices with filtering, sorting, and search', fn: (opts?: Record<string, unknown>) => getDevices(opts as any), params: ['vendors?', 'categories?', 'searchQuery?', 'sortBy?', 'sortOrder?', 'page?', 'pageSize?'] },
  { name: 'getDevice', desc: 'Get full device detail by ID', fn: (id: string) => getDevice(id), params: ['deviceId'] },
  { name: 'getDevicesByCategory', desc: 'Get all devices in a category', fn: (cat: string) => getDevicesByCategory(cat as any), params: ['category'] },
  { name: 'searchDevices', desc: 'Search devices by name, vendor, or family', fn: (q: string, limit?: number) => searchDevices(q, limit), params: ['query', 'limit?'] },
  { name: 'compareDevices', desc: 'Get full details for multiple devices', fn: (ids: string[]) => compareDevices(ids), params: ['deviceIds[]'] },
  { name: 'getStats', desc: 'Get database statistics', fn: getStats, params: [] },
  { name: 'getBenchmarkTypes', desc: 'Get all benchmark types', fn: getBenchmarkTypes, params: [] },
  { name: 'getSources', desc: 'Get all data sources', fn: getSources, params: [] },
  { name: 'getDeviceMetrics', desc: 'Get computed efficiency metrics for a device', fn: (id: string) => (window as any).__getDeviceMetrics?.(id), params: ['deviceId'] },
  { name: 'getDeviceMetricsTable', desc: 'Get flat table of all devices with computed metrics', fn: () => (window as any).__getDeviceMetricsTable?.() ?? [], params: [] },
]

const typeModules = [
  { name: 'DeviceCategory', desc: "Union: 'CPU' | 'GPU' | 'SBC' | 'NPU' | 'ASIC' | 'SoC' | 'System' | 'Memory' | 'Storage'", types: ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'Memory', 'Storage'] },
  { name: 'FilterState', desc: 'Object with vendor, category, search, sort, and pagination options', types: [] },
  { name: 'DeviceListItem', desc: 'Device with vendor, family, price, benchmark, and metrics', types: [] },
  { name: 'DeviceDetail', desc: 'Full device with benchmarks, specs, prices, and metrics', types: [] },
  { name: 'DeviceMetrics', desc: 'Computed metrics: TOPS, TOPS/$, TOPS/W, Perf/$, Perf/W, data completeness', types: [] },
  { name: 'DeviceMetricsRow', desc: 'Flat row for Studio table with all device + computed fields', types: [] },
  { name: 'Vendor', desc: 'Hardware vendor with ID, name, website, country', types: [] },
  { name: 'DeviceFamily', desc: 'Device family with vendor, category, architecture', types: [] },
  { name: 'DeviceVariant', desc: 'Device variant with specs, cores, memory, TDP, GPU-specific fields', types: [] },
  { name: 'BenchmarkResult', desc: 'Benchmark score with source, confidence, normalization', types: [] },
  { name: 'SpecSnapshot', desc: 'Compute specs: INT8 TOPS, FP16/FP32 TFLOPS, TDP, bandwidth', types: [] },
  { name: 'PriceSnapshot', desc: 'Price in USD with condition, region, date', types: [] },
]

export function DocsPage() {
  const [activeFn, setActiveFn] = useState<string | null>(null)
  const [fnInput, setFnInput] = useState('')
  const [fnResult, setFnResult] = useState<{ data: unknown; time: number } | null>(null)
  const [activeTab, setActiveTab] = useState<'functions' | 'types'>('functions')
  const [sidebarFn, setSidebarFn] = useState<string | null>(null)

  // Expose for live examples
  useMemo(() => {
    import('@/lib/api').then(api => {
      (window as any).__getDeviceMetrics = api.getDeviceMetrics
      (window as any).__getDeviceMetricsTable = api.getDeviceMetricsTable
    })
  }, [])

  const handleRun = (fnDef: typeof apiFunctions[0]) => {
    setActiveFn(fnDef.name)
    let input: unknown = undefined
    if (fnInput.trim()) {
      try { input = JSON.parse(fnInput) } catch { input = fnInput }
    }

    const start = performance.now()
    try {
      const result = fnDef.fn(input as any)
      const elapsed = performance.now() - start
      setFnResult({ data: result, time: elapsed })
    } catch (e) {
      setFnResult({ data: `Error: ${(e as Error).message}`, time: performance.now() - start })
    }
  }

  const selectedFn = apiFunctions.find(f => f.name === (activeFn || sidebarFn))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary mb-2">API Documentation</h1>
      <p className="text-sm text-text-secondary mb-6">Interactive documentation for the SiliconRank data API. All functions run client-side with in-memory data.</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {(['functions', 'types'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-brand-600 text-text-primary'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
            }`}
          >
            {tab === 'functions' ? 'Functions' : 'Types'}
          </button>
        ))}
      </div>

      {activeTab === 'functions' && (
        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar */}
          <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-4 lg:sticky lg:top-24 lg:self-start">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Functions</h3>
            <div className="space-y-1">
              {apiFunctions.map(fn => (
                <button
                  key={fn.name}
                  onClick={() => { setSidebarFn(fn.name); setFnResult(null); setFnInput('') }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    sidebarFn === fn.name
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  }`}
                >
                  <div className="font-mono font-medium">{fn.name}()</div>
                  <div className="text-xs mt-0.5 line-clamp-2">{fn.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div>
            {selectedFn ? (
              <div className="space-y-4">
                {/* Function header */}
                <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
                  <h2 className="text-lg font-bold text-brand-400 font-mono">{selectedFn.name}()</h2>
                  <p className="text-sm text-text-secondary mt-2">{selectedFn.desc}</p>

                  {/* Parameters */}
                  <div className="mt-4">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Parameters</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFn.params.map(p => (
                        <span key={p} className="px-2 py-1 bg-bg-tertiary rounded text-xs font-mono text-text-primary">
                          {p}
                        </span>
                      ))}
                      {selectedFn.params.length === 0 && <span className="text-xs text-text-muted">No parameters</span>}
                    </div>
                  </div>
                </div>

                {/* Live example */}
                <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Try it</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder={selectedFn.params[0] ? `e.g. ${selectedFn.params[0].replace('?', ' (optional)')}` : 'No parameters needed'}
                      value={fnInput}
                      onChange={e => setFnInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRun(selectedFn) }}
                      className="flex-1 px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      onClick={() => handleRun(selectedFn)}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-text-primary text-sm font-medium rounded-lg transition-colors"
                    >
                      Run
                    </button>
                  </div>

                  {fnResult && (
                    <div>
                      <div className="text-xs text-text-muted mb-2">Result ({fnResult.time.toFixed(1)}ms):</div>
                      <pre className="bg-bg-primary border border-border-subtle rounded-lg p-4 text-xs text-text-primary overflow-x-auto max-h-96 overflow-y-auto">
                        {typeof fnResult.data === 'object'
                          ? JSON.stringify(fnResult.data, null, 2)
                          : String(fnResult.data)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-text-muted">
                <p className="text-lg mb-2">Select a function from the sidebar</p>
                <p className="text-sm">Click any function to see its documentation and try it live.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'types' && (
        <div className="space-y-4">
          {typeModules.map(type => (
            <div key={type.name} className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-brand-400 font-mono">{type.name}</h3>
              <p className="text-sm text-text-secondary mt-1">{type.desc}</p>
              {type.types.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {type.types.map(t => (
                    <span key={t} className="px-2 py-1 bg-bg-tertiary rounded text-xs font-mono text-text-primary">{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
