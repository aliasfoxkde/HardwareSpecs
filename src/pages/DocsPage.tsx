import { useState, useEffect } from 'react'
import { getVendors, getFamilies, getDevices, getDevice, getDevicesByCategory, searchDevices, getStats, compareDevices, getBenchmarkTypes, getSources, getDeviceMetrics, getDeviceMetricsTable } from '@/lib/api'

const API_BASE = 'https://siliconrank.cyopsys.com'

interface ApiEndpoint {
  name: string
  method: 'GET' | 'POST'
  path: string
  description: string
  params: { name: string; type: string; required: boolean; description: string }[]
  exampleUrl: string
  exampleCurl: string
  exampleResponse: string
  fn: (...args: any[]) => unknown
}

const endpoints: ApiEndpoint[] = [
  {
    name: 'getVendors',
    method: 'GET',
    path: '/api/vendors',
    description: 'Get all hardware vendors',
    params: [],
    exampleUrl: `${API_BASE}/api/vendors`,
    exampleCurl: `curl -s ${API_BASE}/api/vendors | jq`,
    exampleResponse: JSON.stringify([{ vendorId: 'nvidia', name: 'NVIDIA', website: 'https://nvidia.com', country: 'US' }], null, 2),
    fn: () => getVendors(),
  },
  {
    name: 'getFamilies',
    method: 'GET',
    path: '/api/families',
    description: 'Get device families, optionally filtered by vendor or category',
    params: [
      { name: 'vendorId', type: 'string', required: false, description: 'Filter by vendor ID' },
      { name: 'category', type: 'string', required: false, description: 'Filter by category (CPU, GPU, SBC, NPU, ASIC, SoC, System)' },
    ],
    exampleUrl: `${API_BASE}/api/families?category=GPU`,
    exampleCurl: `curl -s "${API_BASE}/api/families?category=GPU" | jq '.[0:2]'`,
    exampleResponse: JSON.stringify([{ familyId: 'nvidia-geforce-rtx-40', vendorId: 'nvidia', category: 'GPU', familyName: 'GeForce RTX 40 Series', architecture: 'Ada Lovelace' }], null, 2),
    fn: (opts?: { vendorId?: string; category?: string }) => getFamilies(opts as any),
  },
  {
    name: 'getDevices',
    method: 'GET',
    path: '/api/devices',
    description: 'Get paginated devices with filtering, sorting, and search',
    params: [
      { name: 'vendors', type: 'string[]', required: false, description: 'Filter by vendor IDs' },
      { name: 'categories', type: 'string[]', required: false, description: 'Filter by categories' },
      { name: 'searchQuery', type: 'string', required: false, description: 'Search by name, vendor, or family' },
      { name: 'sortBy', type: 'string', required: false, description: 'Sort field: launchDate, name, tdp, price, tops, topsPerDollar, topsPerWatt' },
      { name: 'sortOrder', type: 'string', required: false, description: 'asc or desc' },
      { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
      { name: 'pageSize', type: 'number', required: false, description: 'Items per page (default: 25)' },
    ],
    exampleUrl: `${API_BASE}/api/devices?categories=GPU&sortBy=topsPerDollar&sortOrder=desc&pageSize=5`,
    exampleCurl: `curl -s "${API_BASE}/api/devices?categories=GPU&sortBy=topsPerDollar&sortOrder=desc&pageSize=5" | jq`,
    exampleResponse: '{ "devices": [...], "total": 163 }',
    fn: (opts?: Record<string, unknown>) => getDevices(opts as any),
  },
  {
    name: 'getDevice',
    method: 'GET',
    path: '/api/devices/:deviceId',
    description: 'Get full device detail by ID',
    params: [
      { name: 'deviceId', type: 'string', required: true, description: 'Device identifier (e.g. nvidia-rtx-4090)' },
    ],
    exampleUrl: `${API_BASE}/api/devices/nvidia-rtx-4090`,
    exampleCurl: `curl -s ${API_BASE}/api/devices/nvidia-rtx-4090 | jq`,
    exampleResponse: '{ "device": {...}, "vendor": {...}, "family": {...}, "benchmarks": [...], "specs": [...], "prices": [...] }',
    fn: (id: string) => getDevice(id),
  },
  {
    name: 'searchDevices',
    method: 'GET',
    path: '/api/search',
    description: 'Search devices by name, vendor, or family',
    params: [
      { name: 'query', type: 'string', required: true, description: 'Search query' },
      { name: 'limit', type: 'number', required: false, description: 'Max results (default: 20)' },
    ],
    exampleUrl: `${API_BASE}/api/search?q=rtx+4090&limit=3`,
    exampleCurl: `curl -s "${API_BASE}/api/search?q=rtx+4090&limit=3" | jq`,
    exampleResponse: '[{ "device": {...}, "vendor": {...}, "metrics": {...} }]',
    fn: (q: string, limit?: number) => searchDevices(q, limit),
  },
  {
    name: 'getDevicesByCategory',
    method: 'GET',
    path: '/api/categories/:category/devices',
    description: 'Get all devices in a category',
    params: [
      { name: 'category', type: 'string', required: true, description: 'Category: CPU, GPU, SBC, NPU, ASIC, SoC, System' },
    ],
    exampleUrl: `${API_BASE}/api/categories/GPU/devices`,
    exampleCurl: `curl -s ${API_BASE}/api/categories/GPU/devices | jq '.[0:2]'`,
    exampleResponse: '[{ "device": {...}, "vendor": {...}, "metrics": {...} }]',
    fn: (cat: string) => getDevicesByCategory(cat as any),
  },
  {
    name: 'compareDevices',
    method: 'POST',
    path: '/api/compare',
    description: 'Get full details for multiple devices for comparison',
    params: [
      { name: 'deviceIds', type: 'string[]', required: true, description: 'Array of device IDs to compare' },
    ],
    exampleUrl: `${API_BASE}/api/compare`,
    exampleCurl: `curl -s -X POST ${API_BASE}/api/compare -H "Content-Type: application/json" -d '{"deviceIds":["nvidia-rtx-4090","amd-rx-7900-xtx"]}' | jq`,
    exampleResponse: '[{ "device": {...}, "vendor": {...}, "benchmarks": [...] }]',
    fn: (ids: string[]) => compareDevices(ids),
  },
  {
    name: 'getStats',
    method: 'GET',
    path: '/api/stats',
    description: 'Get database statistics',
    params: [],
    exampleUrl: `${API_BASE}/api/stats`,
    exampleCurl: `curl -s ${API_BASE}/api/stats | jq`,
    exampleResponse: '{ "totalDevices": 239, "totalVendors": 14, "totalFamilies": 60, "categories": [...], "totalBenchmarks": 332 }',
    fn: () => getStats(),
  },
  {
    name: 'getBenchmarkTypes',
    method: 'GET',
    path: '/api/benchmarks/types',
    description: 'Get all benchmark types',
    params: [],
    exampleUrl: `${API_BASE}/api/benchmarks/types`,
    exampleCurl: `curl -s ${API_BASE}/api/benchmarks/types | jq`,
    exampleResponse: JSON.stringify([{ benchmarkTypeId: 'gpu-raster-avg', name: 'GPU Rasterization Average', category: 'gpu_raster', unit: 'score' }], null, 2),
    fn: () => getBenchmarkTypes(),
  },
  {
    name: 'getSources',
    method: 'GET',
    path: '/api/sources',
    description: 'Get all data sources',
    params: [],
    exampleUrl: `${API_BASE}/api/sources`,
    exampleCurl: `curl -s ${API_BASE}/api/sources | jq`,
    exampleResponse: JSON.stringify([{ sourceId: 'techpowerup', name: 'TechPowerUp', baseUrl: 'https://techpowerup.com', sourceType: 'benchmark' }], null, 2),
    fn: () => getSources(),
  },
  {
    name: 'getDeviceMetrics',
    method: 'GET',
    path: '/api/devices/:deviceId/metrics',
    description: 'Get computed efficiency metrics for a device',
    params: [
      { name: 'deviceId', type: 'string', required: true, description: 'Device identifier' },
    ],
    exampleUrl: `${API_BASE}/api/devices/nvidia-rtx-4090/metrics`,
    exampleCurl: `curl -s ${API_BASE}/api/devices/nvidia-rtx-4090/metrics | jq`,
    exampleResponse: '{ "deviceId": "nvidia-rtx-4090", "effectiveInt8Tops": 330.5, "topsPerDollar": 0.12, "topsPerWatt": 2.37, "dataCompleteness": 0.85 }',
    fn: (id: string) => getDeviceMetrics(id),
  },
  {
    name: 'getDeviceMetricsTable',
    method: 'GET',
    path: '/api/metrics',
    description: 'Get flat table of all devices with computed metrics',
    params: [],
    exampleUrl: `${API_BASE}/api/metrics`,
    exampleCurl: `curl -s ${API_BASE}/api/metrics | jq '.[0:2]'`,
    exampleResponse: '[{ "deviceId": "...", "modelName": "...", "vendorName": "...", "effectiveInt8Tops": 330.5, "topsPerDollar": 0.12 }]',
    fn: () => getDeviceMetricsTable(),
  },
]

const typeDocs = [
  { name: 'DeviceCategory', desc: "Union type: 'CPU' | 'GPU' | 'SBC' | 'NPU' | 'ASIC' | 'SoC' | 'System' | 'Memory' | 'Storage'", values: ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'Memory', 'Storage'] },
  { name: 'DeviceListItem', desc: 'Device with vendor, family, price, benchmark, and computed metrics', fields: ['device: DeviceVariant', 'vendor: Vendor', 'family: DeviceFamily', 'latestPrice?: PriceSnapshot', 'topBenchmark?: BenchmarkResult', 'metrics: { effectiveInt8Tops, topsPerDollar, topsPerWatt, perfPerDollar, perfPerWatt, dataCompleteness }'] },
  { name: 'DeviceDetail', desc: 'Full device with all related data', fields: ['...DeviceListItem', 'benchmarks: BenchmarkResult[]', 'specs: SpecSnapshot[]', 'prices: PriceSnapshot[]'] },
  { name: 'DeviceMetrics', desc: 'Computed efficiency metrics for a device', fields: ['deviceId: string', 'effectiveInt8Tops: number', 'topsPerDollar: number | null', 'topsPerWatt: number | null', 'perfPerDollar: number | null', 'perfPerWatt: number | null', 'fp16Tflops: number | null', 'fp32Tflops: number | null', 'dataCompleteness: number', 'latestPrice: number | null', 'tdpWatts: number | null'] },
  { name: 'DeviceMetricsRow', desc: 'Flat row extending DeviceMetrics with display fields', fields: ['...DeviceMetrics', 'modelName: string', 'vendorName: string', 'vendorId: string', 'categoryName: string', 'familyName: string', 'architecture: string', 'launchDate: string', 'processNm, cores, threads, memoryCapacityGB, memoryType, memoryBandwidthGBps'] },
  { name: 'Vendor', desc: 'Hardware vendor', fields: ['vendorId: string', 'name: string', 'website: string', 'country: string', 'parentVendorId?: string'] },
  { name: 'DeviceFamily', desc: 'Device family grouping', fields: ['familyId: string', 'vendorId: string', 'category: DeviceCategory', 'familyName: string', 'architecture: string', 'firstSeen: string', 'status: active | deprecated | announced'] },
  { name: 'DeviceVariant', desc: 'Individual device model', fields: ['deviceId: string', 'familyId: string', 'modelName: string', 'sku?: string', 'launchDate: string', 'processNm?, cores?, threads?, tdpWatts?, memoryCapacityGB?, memoryType?, memoryBandwidthGBps?', 'GPU: tmus?, rops?, tensorCores?, rtCores?, baseClockMhz?, boostClockMhz?'] },
  { name: 'BenchmarkResult', desc: 'Benchmark score with metadata', fields: ['resultId: string', 'deviceId: string', 'benchmarkTypeId: string', 'sourceId: string', 'rawScore: number', 'normalizedScore?: number', 'confidence: number', 'observedAt: string'] },
  { name: 'SpecSnapshot', desc: 'Compute specification snapshot', fields: ['snapshotId: string', 'deviceId: string', 'int8Tops?: number', 'fp16Tflops?: number', 'fp32Tflops?: number', 'tdpWatts?: number', 'memoryBwGBps?: number'] },
  { name: 'PriceSnapshot', desc: 'Price in USD', fields: ['priceId: string', 'deviceId: string', 'priceUsd: number', 'condition: new | used | msrp', 'region: string', 'observedAt: string'] },
  { name: 'FilterState', desc: 'Query parameters for getDevices()', fields: ['vendors?: string[]', 'categories?: DeviceCategory[]', 'searchQuery?: string', 'sortBy?: string', 'sortOrder?: asc | desc', 'page?: number', 'pageSize?: number'] },
]

const METHOD_COLORS: Record<string, string> = { GET: 'bg-green-500/20 text-green-400', POST: 'bg-blue-500/20 text-blue-400' }

export function DocsPage() {
  useEffect(() => { document.title = 'API Documentation | SiliconRank'; return () => { document.title = 'SiliconRank' } }, [])
  const [activeTab, setActiveTab] = useState<'endpoints' | 'types'>('endpoints')
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [liveInput, setLiveInput] = useState('')
  const [liveResult, setLiveResult] = useState<{ data: unknown; time: number } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const endpoint = endpoints.find(e => e.name === selectedEndpoint)

  const handleRun = (ep: ApiEndpoint) => {
    let input: unknown = undefined
    if (liveInput.trim()) {
      try { input = JSON.parse(liveInput) } catch { input = liveInput }
    }

    const start = performance.now()
    try {
      const result = ep.fn(input as any)
      const elapsed = performance.now() - start
      setLiveResult({ data: result, time: elapsed })
    } catch (e) {
      setLiveResult({ data: `Error: ${(e as Error).message}`, time: performance.now() - start })
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary mb-2">API Documentation</h1>
      <p className="text-sm text-text-secondary mb-6">
        Interactive documentation for the SiliconRank data API. All functions run client-side with in-memory data.
        Use the URL examples or curl commands to build integrations.
      </p>

      {/* Quick start */}
      <div className="mb-8 bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-brand-400 mb-3">Quick Start</h2>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Base URL</div>
            <code className="text-sm text-brand-300 bg-bg-tertiary px-3 py-1 rounded font-mono">{API_BASE}</code>
          </div>
          <div>
            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Try it now</div>
            <div className="flex gap-2">
              <code className="flex-1 text-sm text-text-primary bg-bg-tertiary px-3 py-2 rounded font-mono overflow-x-auto">{API_BASE}/api/stats</code>
              <button onClick={() => copyToClipboard(`${API_BASE}/api/stats`, 'quickstart')} className="px-3 py-2 bg-bg-tertiary hover:bg-bg-secondary text-xs font-medium rounded transition-colors border border-border-subtle">
                {copiedId === 'quickstart' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-bg-tertiary/30 rounded-lg p-3">
              <div className="text-xs text-text-muted mb-1">Response Format</div>
              <code className="text-xs text-text-primary">application/json</code>
            </div>
            <div className="bg-bg-tertiary/30 rounded-lg p-3">
              <div className="text-xs text-text-muted mb-1">Authentication</div>
              <code className="text-xs text-text-primary">None required (open API)</code>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {(['endpoints', 'types'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-brand-600 text-text-primary'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
            }`}
          >
            {tab === 'endpoints' ? 'Endpoints' : 'Types'}
          </button>
        ))}
      </div>

      {activeTab === 'endpoints' && (
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-4 lg:sticky lg:top-24 lg:self-start max-h-[80vh] overflow-y-auto">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Endpoints</h3>
            <div className="space-y-1">
              {endpoints.map(ep => (
                <button
                  key={ep.name}
                  onClick={() => { setSelectedEndpoint(ep.name); setLiveResult(null); setLiveInput('') }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedEndpoint === ep.name
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
                    <span className="font-mono font-medium truncate">{ep.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div>
            {endpoint ? (
              <div className="space-y-4">
                {/* Endpoint header */}
                <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${METHOD_COLORS[endpoint.method]}`}>{endpoint.method}</span>
                    <code className="text-lg font-bold text-brand-400 font-mono">{endpoint.path}</code>
                  </div>
                  <p className="text-sm text-text-secondary">{endpoint.description}</p>

                  {/* Parameters */}
                  {endpoint.params.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Parameters</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border-subtle/50">
                              <th className="text-left py-1.5 px-2 text-xs text-text-muted font-medium">Name</th>
                              <th className="text-left py-1.5 px-2 text-xs text-text-muted font-medium">Type</th>
                              <th className="text-left py-1.5 px-2 text-xs text-text-muted font-medium">Required</th>
                              <th className="text-left py-1.5 px-2 text-xs text-text-muted font-medium">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {endpoint.params.map(p => (
                              <tr key={p.name} className="border-b border-border-subtle/20">
                                <td className="py-1.5 px-2"><code className="text-brand-300 font-mono text-xs">{p.name}</code></td>
                                <td className="py-1.5 px-2 text-xs text-text-secondary"><code>{p.type}</code></td>
                                <td className="py-1.5 px-2 text-xs">{p.required ? <span className="text-red-400">required</span> : <span className="text-text-muted">optional</span>}</td>
                                <td className="py-1.5 px-2 text-xs text-text-secondary">{p.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* URL Example */}
                <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Request URL</h3>
                    <button onClick={() => copyToClipboard(endpoint.exampleUrl, 'url')} className="px-2 py-1 text-xs bg-bg-tertiary hover:bg-bg-secondary rounded border border-border-subtle transition-colors">
                      {copiedId === 'url' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <code className="block text-sm text-brand-300 bg-bg-primary border border-border-subtle rounded-lg px-4 py-3 font-mono overflow-x-auto whitespace-nowrap">{endpoint.exampleUrl}</code>
                </div>

                {/* Curl Example */}
                <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">cURL</h3>
                    <button onClick={() => copyToClipboard(endpoint.exampleCurl, 'curl')} className="px-2 py-1 text-xs bg-bg-tertiary hover:bg-bg-secondary rounded border border-border-subtle transition-colors">
                      {copiedId === 'curl' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="bg-bg-primary border border-border-subtle rounded-lg px-4 py-3 text-xs text-text-primary overflow-x-auto font-mono">{endpoint.exampleCurl}</pre>
                </div>

                {/* Response Format */}
                <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Response Format</h3>
                  <pre className="bg-bg-primary border border-border-subtle rounded-lg px-4 py-3 text-xs text-text-primary overflow-x-auto font-mono max-h-48 overflow-y-auto">{endpoint.exampleResponse}</pre>
                </div>

                {/* Live example */}
                <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Try it Live</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder={endpoint.params[0] ? `e.g. ${endpoint.params[0].name}${endpoint.params[0].required ? '' : ' (optional)'}` : 'No parameters needed'}
                      value={liveInput}
                      onChange={e => setLiveInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRun(endpoint) }}
                      className="flex-1 px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      onClick={() => handleRun(endpoint)}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-text-primary text-sm font-medium rounded-lg transition-colors"
                    >
                      Run
                    </button>
                  </div>

                  {liveResult && (
                    <div>
                      <div className="text-xs text-text-muted mb-2">Result ({liveResult.time.toFixed(1)}ms):</div>
                      <pre className="bg-bg-primary border border-border-subtle rounded-lg p-4 text-xs text-text-primary overflow-x-auto max-h-96 overflow-y-auto">
                        {typeof liveResult.data === 'object'
                          ? JSON.stringify(liveResult.data, null, 2)
                          : String(liveResult.data)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-text-muted">
                <p className="text-lg mb-2">Select an endpoint from the sidebar</p>
                <p className="text-sm">Click any endpoint to see its documentation, URL, curl command, and try it live.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'types' && (
        <div className="space-y-4">
          {typeDocs.map(type => (
            <div key={type.name} className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-brand-400 font-mono">{type.name}</h3>
              <p className="text-sm text-text-secondary mt-1">{type.desc}</p>
              {'values' in type && (type.values?.length ?? 0) > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(type.values ?? []).map(t => (
                    <span key={t} className="px-2 py-1 bg-bg-tertiary rounded text-xs font-mono text-text-primary">{t}</span>
                  ))}
                </div>
              )}
              {'fields' in type && (type.fields?.length ?? 0) > 0 && (
                <div className="mt-3 space-y-1">
                  {(type.fields ?? []).map(f => (
                    <div key={f} className="text-xs font-mono text-text-secondary">
                      <span className="text-text-muted mr-1">-</span> {f}
                    </div>
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
