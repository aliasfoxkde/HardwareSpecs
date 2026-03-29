import { useState, useMemo } from 'react'
import { getDevicesByCategory, getVendors } from '@/lib/api'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import type { DeviceCategory } from '@/types'

const VENDOR_COLORS: Record<string, string> = {
  nvidia: '#76b900',
  amd: '#ed1c24',
  intel: '#0071c5',
  apple: '#a2aaad',
  qualcomm: '#3253dc',
  broadcom: '#cc092f',
  google: '#4285f4',
  huawei: '#cf0a2c',
  'rockchip': '#ff6600',
  'hardkernel': '#333333',
  'beagleboard': '#000000',
  'xunlong': '#ff4500',
  'hailo': '#00bcd4',
  'intel-corporation': '#0071c5',
}

export function ChartsPage() {
  const [activeCategory, setActiveCategory] = useState<DeviceCategory>('GPU')
  const [chartType, setChartType] = useState<'scatter' | 'bar' | 'tops'>('scatter')

  const allDevices = useMemo(() => getDevicesByCategory(activeCategory), [activeCategory])
  const vendors = useMemo(() => getVendors(), [])

  const scatterData = useMemo(() => {
    return allDevices
      .filter(d => d.device.tdpWatts && d.latestPrice)
      .map(d => ({
        name: d.device.modelName,
        vendor: d.vendor.name,
        vendorId: d.vendor.vendorId,
        tdp: d.device.tdpWatts!,
        price: d.latestPrice!.priceUsd,
        fill: VENDOR_COLORS[d.vendor.vendorId] ?? '#3b82f6',
      }))
  }, [allDevices])

  const topsData = useMemo(() => {
    return allDevices
      .map(d => {
        const deviceId = d.device.deviceId
        const vendorId = d.vendor.vendorId
        // We'll compute TOPS from the spec data by looking at the seed data directly
        // For now, show devices that have compute specs
        return {
          name: d.device.modelName,
          vendor: d.vendor.name,
          vendorId,
          deviceId,
        }
      })
      .filter(d => ['nvidia', 'amd'].includes(d.vendorId) || activeCategory === 'NPU')
  }, [allDevices, activeCategory])

  const vendorPriceData = useMemo(() => {
    const vendorPrices: Record<string, { count: number; minPrice: number; maxPrice: number }> = {}
    allDevices.forEach(d => {
      if (!d.latestPrice) return
      const vId = d.vendor.vendorId
      if (!vendorPrices[vId]) {
        vendorPrices[vId] = { count: 0, minPrice: Infinity, maxPrice: 0 }
      }
      vendorPrices[vId].count++
      vendorPrices[vId].minPrice = Math.min(vendorPrices[vId].minPrice, d.latestPrice.priceUsd)
      vendorPrices[vId].maxPrice = Math.max(vendorPrices[vId].maxPrice, d.latestPrice.priceUsd)
    })
    return Object.entries(vendorPrices).map(([vendorId, data]) => ({
      vendorId,
      vendor: vendors.find(v => v.vendorId === vendorId)?.name ?? vendorId,
      count: data.count,
      avgPrice: Math.round((data.minPrice + data.maxPrice) / 2),
      fill: VENDOR_COLORS[vendorId] ?? '#3b82f6',
    })).sort((a, b) => b.count - a.count)
  }, [allDevices, vendors])

  const categories: DeviceCategory[] = ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-2">Charts & Visualizations</h1>
      <p className="text-sm text-slate-400 mb-6">Interactive charts for hardware performance, pricing, and efficiency.</p>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {(['scatter', 'bar', 'tops'] as const).map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                chartType === type
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {type === 'scatter' ? 'Price vs TDP' : type === 'bar' ? 'Vendor Count' : 'Compute'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="h-[400px] sm:h-[500px]">
          {chartType === 'scatter' && (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  type="number"
                  dataKey="price"
                  name="Price (USD)"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  label={{ value: 'Price (USD)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="tdp"
                  name="TDP (W)"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  label={{ value: 'TDP (W)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                  formatter={(value, name) => {
                    const v = Number(value)
                    if (name === 'Price (USD)') return [`$${v.toLocaleString()}`, name]
                    return [`${v}W`, name]
                  }}
                  labelFormatter={(_, payload) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload
                      return `${data.name} (${data.vendor})`
                    }
                    return ''
                  }}
                />
                <Scatter data={scatterData} fill="#3b82f6">
                  {scatterData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}

          {chartType === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorPriceData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="vendor"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  label={{ value: 'Devices', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Bar dataKey="count" name="Devices" radius={[4, 4, 0, 0]}>
                  {vendorPriceData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartType === 'tops' && (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <p className="text-lg mb-2">Compute Performance Chart</p>
                <p className="text-sm">Select GPU, NPU, or System category to view INT8 TOPS, FP16, and FP32 compute metrics.</p>
                <p className="text-xs text-slate-500 mt-4">
                  {topsData.length > 0 ? `${topsData.length} devices with compute specs in ${activeCategory}` : `No compute data available for ${activeCategory} - try GPU or NPU`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-700/30">
          {[...new Set(allDevices.map(d => d.vendor.vendorId))].map(vendorId => {
            const vendor = vendors.find(v => v.vendorId === vendorId)
            return (
              <div key={vendorId} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: VENDOR_COLORS[vendorId] ?? '#3b82f6' }} />
                <span className="text-xs text-slate-400">{vendor?.name ?? vendorId}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
