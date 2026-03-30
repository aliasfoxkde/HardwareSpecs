import { useState, useMemo, useEffect } from 'react'
import { getAllDeviceMetrics } from '@/lib/api'
import { getDevices } from '@/lib/api'

// ── TOPS Calculator ──

function TopsCalculator() {
  const [tensorCores, setTensorCores] = useState('')
  const [clockGhz, setClockGhz] = useState('')
  const [precision, setPrecision] = useState<'fp4' | 'int8' | 'fp8' | 'fp16' | 'fp32'>('int8')
  const [opsPerClockPerCore, setOpsPerClockPerCore] = useState('256')

  const precisionMultiplier: Record<string, number> = { fp4: 2, int8: 1, fp8: 1, fp16: 0.5, fp32: 0.25 }
  const precisionLabel: Record<string, string> = { fp4: 'FP4 (4-bit)', int8: 'INT8 (8-bit integer)', fp8: 'FP8 (8-bit float)', fp16: 'FP16 (16-bit)', fp32: 'FP32 (32-bit)' }

  const result = useMemo(() => {
    const cores = parseFloat(tensorCores) || 0
    const clock = parseFloat(clockGhz) || 0
    const ops = parseFloat(opsPerClockPerCore) || 256
    const mult = precisionMultiplier[precision]
    const tops = (cores * clock * 2 * ops * mult) / 1000 // 2 for multiply-accumulate
    return tops
  }, [tensorCores, clockGhz, precision, opsPerClockPerCore])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">TOPS Calculator</h3>
      <p className="text-sm text-text-secondary">Estimate compute throughput from tensor core specifications. Formula: TOPS = cores &times; clock (GHz) &times; 2 (MAC) &times; ops/clock &times; precision multiplier / 1000</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-text-secondary mb-1">Tensor Cores</label>
          <input type="number" value={tensorCores} onChange={e => setTensorCores(e.target.value)} placeholder="e.g. 680" className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Clock Speed (GHz)</label>
          <input type="number" step="0.01" value={clockGhz} onChange={e => setClockGhz(e.target.value)} placeholder="e.g. 2.52" className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Precision</label>
          <select value={precision} onChange={e => setPrecision(e.target.value as typeof precision)} className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary">
            {Object.entries(precisionLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Ops/Clock/Core (default: 256)</label>
          <input type="number" value={opsPerClockPerCore} onChange={e => setOpsPerClockPerCore(e.target.value)} placeholder="256" className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
      </div>
      <div className="bg-bg-tertiary/50 rounded-lg p-4 text-center">
        <div className="text-xs text-text-secondary mb-1">Estimated TOPS ({precisionLabel[precision]})</div>
        <div className="text-3xl font-bold text-brand-400">
          {result > 0 ? result >= 1000 ? `${(result / 1000).toFixed(2)}k` : result.toFixed(1) : '-'}
        </div>
      </div>
    </div>
  )
}

// ── Efficiency Calculator ──

function EfficiencyCalculator() {
  const [tops, setTops] = useState('')
  const [tdpW, setTdpW] = useState('')
  const [price, setPrice] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState('24')
  const [electricityRate, setElectricityRate] = useState('0.12')

  const topsPerWatt = useMemo(() => {
    const t = parseFloat(tops) || 0
    const w = parseFloat(tdpW) || 0
    return w > 0 ? t / w : null
  }, [tops, tdpW])

  const topsPerDollar = useMemo(() => {
    const t = parseFloat(tops) || 0
    const p = parseFloat(price) || 0
    return p > 0 ? t / p : null
  }, [tops, price])

  const monthlyCost = useMemo(() => {
    const w = parseFloat(tdpW) || 0
    const h = parseFloat(hoursPerDay) || 0
    const r = parseFloat(electricityRate) || 0
    return (w / 1000) * h * 30 * r
  }, [tdpW, hoursPerDay, electricityRate])

  const annualCost = useMemo(() => monthlyCost * 12, [monthlyCost])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Efficiency Calculator</h3>
      <p className="text-sm text-text-secondary">Compute efficiency metrics and power cost estimates.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-text-secondary mb-1">INT8 TOPS</label>
          <input type="number" value={tops} onChange={e => setTops(e.target.value)} placeholder="e.g. 661" className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">TDP (Watts)</label>
          <input type="number" value={tdpW} onChange={e => setTdpW(e.target.value)} placeholder="e.g. 450" className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Price (USD)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 1599" className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Usage (hours/day)</label>
          <input type="number" value={hoursPerDay} onChange={e => setHoursPerDay(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Electricity Rate ($/kWh)</label>
          <input type="number" step="0.01" value={electricityRate} onChange={e => setElectricityRate(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
          <div className="text-xs text-text-secondary mb-1">TOPS/W</div>
          <div className="text-lg font-bold text-blue-400">{topsPerWatt ? topsPerWatt.toFixed(2) : '-'}</div>
        </div>
        <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
          <div className="text-xs text-text-secondary mb-1">TOPS/$</div>
          <div className="text-lg font-bold text-green-400">{topsPerDollar ? topsPerDollar.toFixed(3) : '-'}</div>
        </div>
        <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
          <div className="text-xs text-text-secondary mb-1">Monthly Cost</div>
          <div className="text-lg font-bold text-yellow-400">${monthlyCost.toFixed(2)}</div>
        </div>
        <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
          <div className="text-xs text-text-secondary mb-1">Annual Cost</div>
          <div className="text-lg font-bold text-red-400">${annualCost.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

// ── Memory Bandwidth Estimator ──

function MemoryBandwidthEstimator() {
  const [busWidth, setBusWidth] = useState('')
  const [memType, setMemType] = useState<'gddr6' | 'gddr6x' | 'gddr7' | 'hbm2' | 'hbm2e' | 'hbm3' | 'hbm3e' | 'lpddr5' | 'lpddr5x'>('gddr6x')
  const [transferRate, setTransferRate] = useState('')

  const defaultRates: Record<string, number> = {
    gddr6: 14, gddr6x: 20, gddr7: 28, hbm2: 2.4, hbm2e: 3.2, hbm3: 4.8, hbm3e: 6.4, lpddr5: 6.4, lpddr5x: 8.5,
  }

  const effectiveRate = parseFloat(transferRate) || defaultRates[memType] || 0
  const bandwidth = useMemo(() => {
    const bw = parseFloat(busWidth) || 0
    return bw > 0 && effectiveRate > 0 ? (bw * effectiveRate) / 8 : 0
  }, [busWidth, effectiveRate])

  const aiWorkloadNote = useMemo(() => {
    if (bandwidth <= 0) return ''
    const models7b = bandwidth / 8 // rough estimate for 7B params
    const models13b = bandwidth / 16
    const models70b = bandwidth / 80
    return `Rough memory-bound serving capacity: ~${models7b.toFixed(0)} tok/s (7B) | ~${models13b.toFixed(0)} tok/s (13B) | ~${models70b.toFixed(1)} tok/s (70B)`
  }, [bandwidth])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Memory Bandwidth Estimator</h3>
      <p className="text-sm text-text-secondary">Estimate memory bandwidth from bus width and transfer rate. Formula: BW = busWidth (bits) &times; transferRate (Gbps) / 8</p>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-text-secondary mb-1">Bus Width (bits)</label>
          <input type="number" value={busWidth} onChange={e => setBusWidth(e.target.value)} placeholder="e.g. 384" className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Memory Type</label>
          <select value={memType} onChange={e => { setMemType(e.target.value as typeof memType); setTransferRate('') }} className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary">
            {Object.keys(defaultRates).map(k => <option key={k} value={k}>{k.toUpperCase()} ({defaultRates[k]} Gbps/pin)</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Transfer Rate (Gbps/pin)</label>
          <input type="number" step="0.1" value={transferRate} onChange={e => setTransferRate(e.target.value)} placeholder={defaultRates[memType].toString()} className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
      </div>
      <div className="bg-bg-tertiary/50 rounded-lg p-4 text-center">
        <div className="text-xs text-text-secondary mb-1">Estimated Bandwidth</div>
        <div className="text-3xl font-bold text-purple-400">
          {bandwidth > 0 ? `${bandwidth.toFixed(0)} GB/s` : '-'}
        </div>
        {aiWorkloadNote && <div className="text-xs text-text-muted mt-2">{aiWorkloadNote}</div>}
      </div>
    </div>
  )
}

// ── TCO Calculator ──

function TcoCalculator() {
  const [purchasePrice, setPurchasePrice] = useState('')
  const [tdpW, setTdpW] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState('24')
  const [years, setYears] = useState('3')
  const [electricityRate, setElectricityRate] = useState('0.12')
  const [pue, setPue] = useState('1.1')

  const results = useMemo(() => {
    const price = parseFloat(purchasePrice) || 0
    const w = parseFloat(tdpW) || 0
    const h = parseFloat(hoursPerDay) || 0
    const y = parseFloat(years) || 0
    const rate = parseFloat(electricityRate) || 0
    const p = parseFloat(pue) || 1

    const monthlyPower = (w / 1000) * h * 30 * rate * p
    const annualPower = monthlyPower * 12
    const totalPower = annualPower * y
    const total = price + totalPower
    const powerPct = total > 0 ? (totalPower / total * 100) : 0

    return { monthlyPower, annualPower, totalPower, total, powerPct }
  }, [purchasePrice, tdpW, hoursPerDay, years, electricityRate, pue])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">TCO Calculator</h3>
      <p className="text-sm text-text-secondary">Total Cost of Ownership over the device lifetime including electricity.</p>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-text-secondary mb-1">Purchase Price (USD)</label>
          <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="e.g. 1599" className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">TDP (Watts)</label>
          <input type="number" value={tdpW} onChange={e => setTdpW(e.target.value)} placeholder="e.g. 450" className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Usage (hours/day)</label>
          <input type="number" value={hoursPerDay} onChange={e => setHoursPerDay(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Lifespan (years)</label>
          <input type="number" value={years} onChange={e => setYears(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Electricity ($/kWh)</label>
          <input type="number" step="0.01" value={electricityRate} onChange={e => setElectricityRate(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">PUE (Power Usage Effectiveness)</label>
          <input type="number" step="0.01" value={pue} onChange={e => setPue(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
          <div className="text-xs text-text-secondary mb-1">Monthly Power</div>
          <div className="text-lg font-bold text-yellow-400">${results.monthlyPower.toFixed(2)}</div>
        </div>
        <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
          <div className="text-xs text-text-secondary mb-1">Annual Power</div>
          <div className="text-lg font-bold text-orange-400">${results.annualPower.toFixed(2)}</div>
        </div>
        <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
          <div className="text-xs text-text-secondary mb-1">Total Power ({years}yr)</div>
          <div className="text-lg font-bold text-red-400">${results.totalPower.toFixed(2)}</div>
        </div>
        <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center border border-brand-500/30">
          <div className="text-xs text-text-secondary mb-1">Total TCO</div>
          <div className="text-lg font-bold text-brand-400">${results.total.toFixed(2)}</div>
          <div className="text-[10px] text-text-muted">{results.powerPct.toFixed(1)}% is power</div>
        </div>
      </div>
    </div>
  )
}

// ── Device Quick Lookup ──

function DeviceQuickLookup() {
  const [query, setQuery] = useState('')
  const metrics = useMemo(() => getAllDeviceMetrics(), [])

  const results = useMemo(() => {
    if (query.length < 2) return []
    const q = query.toLowerCase()
    const { devices: devs } = getDevices({ searchQuery: q, pageSize: 10 })
    return devs.map(d => ({
      name: d.device.modelName,
      vendor: d.vendor.name,
      tops: metrics.get(d.device.deviceId)?.effectiveInt8Tops ?? 0,
      topsPerDollar: metrics.get(d.device.deviceId)?.topsPerDollar ?? null,
      topsPerWatt: metrics.get(d.device.deviceId)?.topsPerWatt ?? null,
      price: d.latestPrice?.priceUsd,
      tdp: d.device.tdpWatts,
      completeness: metrics.get(d.device.deviceId)?.dataCompleteness ?? 0,
    }))
  }, [query, metrics])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Device Quick Lookup</h3>
      <p className="text-sm text-text-secondary">Search and compare key metrics across devices instantly.</p>
      <input
        type="text"
        placeholder="Search devices..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full px-4 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      {results.length > 0 && (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle/50">
                <th className="px-3 py-2 text-left text-xs text-text-secondary">Device</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">INT8 TOPS</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">TOPS/$</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">TOPS/W</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">TDP</th>
                <th className="px-3 py-2 text-right text-xs text-text-secondary">Price</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-border-subtle/20">
                  <td className="px-3 py-2">
                    <div className="font-medium text-text-primary">{r.name}</div>
                    <div className="text-xs text-text-muted">{r.vendor}</div>
                  </td>
                  <td className="px-3 py-2 text-right text-brand-400">{r.tops > 0 ? r.tops >= 1000 ? `${(r.tops / 1000).toFixed(1)}k` : r.tops.toFixed(0) : '-'}</td>
                  <td className="px-3 py-2 text-right text-green-400">{r.topsPerDollar ? r.topsPerDollar.toFixed(2) : '-'}</td>
                  <td className="px-3 py-2 text-right text-blue-400">{r.topsPerWatt ? r.topsPerWatt.toFixed(2) : '-'}</td>
                  <td className="px-3 py-2 text-right text-text-secondary">{r.tdp ? `${r.tdp}W` : '-'}</td>
                  <td className="px-3 py-2 text-right text-text-secondary">{r.price ? `$${r.price.toLocaleString()}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Tools Page ──

const TOOLS = [
  { id: 'tops', name: 'TOPS Calculator', icon: '⬡', description: 'Estimate compute throughput from tensor core specs', component: TopsCalculator },
  { id: 'efficiency', name: 'Efficiency Calculator', icon: '⚡', description: 'Compute TOPS/W, TOPS/$, and power costs', component: EfficiencyCalculator },
  { id: 'memory', name: 'Memory Bandwidth', icon: '▦', description: 'Estimate bandwidth and AI serving capacity', component: MemoryBandwidthEstimator },
  { id: 'tco', name: 'TCO Calculator', icon: '$', description: 'Total cost of ownership including electricity', component: TcoCalculator },
  { id: 'lookup', name: 'Device Quick Lookup', icon: '🔍', description: 'Search and compare devices instantly', component: DeviceQuickLookup },
] as const

export function ToolsPage() {
  useEffect(() => { document.title = 'Hardware Tools | SiliconRank'; return () => { document.title = 'SiliconRank' } }, [])
  const [activeTool, setActiveTool] = useState<string>('tops')
  const ActiveComponent = TOOLS.find(t => t.id === activeTool)?.component ?? TopsCalculator

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Tools</h1>
        <p className="text-sm text-text-secondary mt-1">Hardware calculators and utilities for AI planning</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 shrink-0">
          <div role="tablist" aria-label="Tool selection" className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {TOOLS.map(tool => (
              <button
                key={tool.id}
                role="tab"
                id={`tool-tab-${tool.id}`}
                aria-selected={activeTool === tool.id}
                aria-controls={`tool-panel-${tool.id}`}
                tabIndex={activeTool === tool.id ? 0 : -1}
                onClick={() => setActiveTool(tool.id)}
                onKeyDown={(e) => {
                  const idx = TOOLS.findIndex(t => t.id === tool.id)
                  if (e.key === 'ArrowDown') { const next = TOOLS[(idx + 1) % TOOLS.length]; setActiveTool(next.id); document.getElementById(`tool-tab-${next.id}`)?.focus() }
                  if (e.key === 'ArrowUp') { const prev = TOOLS[(idx - 1 + TOOLS.length) % TOOLS.length]; setActiveTool(prev.id); document.getElementById(`tool-tab-${prev.id}`)?.focus() }
                }}
                className={`px-4 py-3 rounded-lg text-left text-sm whitespace-nowrap transition-colors ${
                  activeTool === tool.id
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent'
                }`}
              >
                <span className="mr-2">{tool.icon}</span>
                {tool.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active tool */}
        <div role="tabpanel" id={`tool-panel-${activeTool}`} aria-labelledby={`tool-tab-${activeTool}`} className="flex-1 bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6 min-w-0">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}
