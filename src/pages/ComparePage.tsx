import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { compareDevices, searchDevices } from '@/lib/api'

export function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return []
    return searchDevices(searchQuery, 10)
  }, [searchQuery])

  const devices = useMemo(() => compareDevices(selectedIds), [selectedIds])

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

  if (devices.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-4">Compare Devices</h1>
        <p className="text-slate-400 mb-8">Select devices to compare specifications and benchmarks side by side.</p>
        <div className="max-w-md mx-auto">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for a device to compare..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              {searchResults.map(result => (
                <button
                  key={result.device.deviceId}
                  onClick={() => addDevice(result.device.deviceId)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{result.device.modelName}</div>
                    <div className="text-xs text-slate-400">{result.vendor.name} &middot; {result.family.category}</div>
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
          <h1 className="text-2xl font-bold text-white">Compare Devices</h1>
          <p className="text-sm text-slate-400">{devices.length} device{devices.length !== 1 ? 's' : ''} selected</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length < 6 && (
            <div className="relative">
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Add Device
              </button>
              {showAdd && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full px-4 py-2.5 bg-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none border-b border-slate-700"
                  />
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults
                      .filter(r => !selectedIds.includes(r.device.deviceId))
                      .map(result => (
                        <button
                          key={result.device.deviceId}
                          onClick={() => addDevice(result.device.deviceId)}
                          className="w-full px-4 py-2.5 text-left hover:bg-slate-700 text-sm text-white"
                        >
                          {result.device.modelName} <span className="text-slate-400">- {result.vendor.name}</span>
                        </button>
                      ))}
                    {searchResults.filter(r => !selectedIds.includes(r.device.deviceId)).length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500">No matching devices</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setSelectedIds([])}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded-lg transition-colors border border-slate-700"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto bg-slate-800/30 border border-slate-700/50 rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase w-40">Spec</th>
              {devices.map(d => (
                <th key={d.device.deviceId} className="px-4 py-3 text-center min-w-[180px]">
                  <Link to={`/device/${d.device.deviceId}`} className="text-sm font-medium text-brand-400 hover:text-brand-300">
                    {d.device.modelName}
                  </Link>
                  <button
                    onClick={() => removeDevice(d.device.deviceId)}
                    className="block mx-auto mt-1 text-xs text-slate-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-700/30">
              <td className="px-4 py-3 text-sm text-slate-400">Vendor</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-white text-center">{d.vendor.name}</td>
              ))}
            </tr>
            <tr className="border-b border-slate-700/30">
              <td className="px-4 py-3 text-sm text-slate-400">Category</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-center">
                  <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">{d.family.category}</span>
                </td>
              ))}
            </tr>
            <tr className="border-b border-slate-700/30">
              <td className="px-4 py-3 text-sm text-slate-400">Architecture</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-white text-center">{d.family.architecture}</td>
              ))}
            </tr>
            <tr className="border-b border-slate-700/30">
              <td className="px-4 py-3 text-sm text-slate-400">Launch</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-white text-center">{d.device.launchDate}</td>
              ))}
            </tr>
            <tr className="border-b border-slate-700/30">
              <td className="px-4 py-3 text-sm text-slate-400">Cores / Threads</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-white text-center">
                  {d.device.cores && d.device.threads ? `${d.device.cores}C / ${d.device.threads}T` : '-'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-slate-700/30">
              <td className="px-4 py-3 text-sm text-slate-400">TDP</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-white text-center">
                  {d.device.tdpWatts ? `${d.device.tdpWatts}W` : '-'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-slate-700/30">
              <td className="px-4 py-3 text-sm text-slate-400">Memory</td>
              {devices.map(d => (
                <td key={d.device.deviceId} className="px-4 py-3 text-sm text-white text-center">
                  {d.device.memoryCapacityGB ? `${d.device.memoryCapacityGB}GB ${d.device.memoryType ?? ''}`.trim() : '-'}
                </td>
              ))}
            </tr>
            <tr className="border-b border-slate-700/30">
              <td className="px-4 py-3 text-sm text-slate-400">Price (USD)</td>
              {devices.map(d => {
                const price = d.prices.sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime())[0]
                return (
                  <td key={d.device.deviceId} className="px-4 py-3 text-sm text-white text-center font-medium">
                    {price ? `$${price.priceUsd.toLocaleString()}` : '-'}
                  </td>
                )
              })}
            </tr>
            {/* INT8 TOPS */}
            <tr className="border-b border-slate-700/30">
              <td className="px-4 py-3 text-sm text-slate-400">INT8 TOPS</td>
              {devices.map(d => {
                const spec = d.specs.find(s => s.int8Tops !== undefined)
                return (
                  <td key={d.device.deviceId} className="px-4 py-3 text-sm text-brand-400 text-center font-bold">
                    {spec?.int8Tops ?? '-'}
                  </td>
                )
              })}
            </tr>
            {/* FP16 TFLOPS */}
            <tr className="border-b border-slate-700/30">
              <td className="px-4 py-3 text-sm text-slate-400">FP16 TFLOPS</td>
              {devices.map(d => {
                const spec = d.specs.find(s => s.fp16Tflops !== undefined)
                return (
                  <td key={d.device.deviceId} className="px-4 py-3 text-sm text-white text-center">
                    {spec?.fp16Tflops ?? '-'}
                  </td>
                )
              })}
            </tr>
            {/* FP32 TFLOPS */}
            <tr className="border-b border-slate-700/30">
              <td className="px-4 py-3 text-sm text-slate-400">FP32 TFLOPS</td>
              {devices.map(d => {
                const spec = d.specs.find(s => s.fp32Tflops !== undefined)
                return (
                  <td key={d.device.deviceId} className="px-4 py-3 text-sm text-white text-center">
                    {spec?.fp32Tflops ?? '-'}
                  </td>
                )
              })}
            </tr>
            {/* Benchmarks */}
            {devices.some(d => d.benchmarks.length > 0) && (
              <>
                <tr className="border-b border-slate-700/50">
                  <td colSpan={devices.length + 1} className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase bg-slate-800/50">
                    Benchmarks
                  </td>
                </tr>
                {[...new Set(devices.flatMap(d => d.benchmarks.map(b => b.benchmarkTypeId)))].map(bmId => (
                  <tr key={bmId} className="border-b border-slate-700/30">
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {bmId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    {devices.map(d => {
                      const bm = d.benchmarks.find(b => b.benchmarkTypeId === bmId)
                      return (
                        <td key={d.device.deviceId} className="px-4 py-3 text-sm text-white text-center">
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
