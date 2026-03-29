import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { getDevice, getDevicesByCategory } from '@/lib/api'

export function DevicePage() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const device = useMemo(() => (deviceId ? getDevice(deviceId) : undefined), [deviceId])
  const similar = useMemo(() => {
    if (!device) return []
    const sameCategory = getDevicesByCategory(device.family.category)
    return sameCategory.filter(d => d.device.deviceId !== device.device.deviceId).slice(0, 5)
  }, [device])

  if (!device) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Device Not Found</h1>
        <p className="text-slate-400 mb-6">The device you're looking for doesn't exist in our database.</p>
        <Link to="/browse" className="text-brand-400 hover:text-brand-300">Browse all devices &rarr;</Link>
      </div>
    )
  }

  const latestPrice = device.prices.sort((a, b) =>
    new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime()
  )[0]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/browse" className="hover:text-white">Browse</Link>
        <span>/</span>
        <span className="text-slate-500">{device.family.category}</span>
        <span>/</span>
        <span className="text-white">{device.device.modelName}</span>
      </nav>

      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{device.device.modelName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="px-2.5 py-0.5 text-xs font-medium rounded bg-brand-600/20 text-brand-400 border border-brand-500/20">
                {device.family.category}
              </span>
              <span className="text-sm text-slate-400">{device.vendor.name}</span>
              <span className="text-sm text-slate-500">&middot;</span>
              <span className="text-sm text-slate-400">{device.family.familyName}</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">Architecture: {device.family.architecture} &middot; Launched {device.device.launchDate}</p>
          </div>
          {latestPrice && (
            <div className="text-right">
              <div className="text-2xl font-bold text-white">${latestPrice.priceUsd.toLocaleString()}</div>
              <div className="text-sm text-slate-400">{latestPrice.condition === 'msrp' ? 'MSRP' : latestPrice.condition}</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Specifications */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Cores / Threads', value: device.device.cores && device.device.threads ? `${device.device.cores}C / ${device.device.threads}T` : undefined },
                { label: 'Process Node', value: device.device.processNm ? `${device.device.processNm}nm` : undefined },
                { label: 'TDP', value: device.device.tdpWatts ? `${device.device.tdpWatts}W` : undefined },
                { label: 'Max Power', value: device.device.maxPowerWatts ? `${device.device.maxPowerWatts}W` : undefined },
                { label: 'Memory', value: device.device.memoryCapacityGB ? `${device.device.memoryCapacityGB}GB ${device.device.memoryType ?? ''}`.trim() : undefined },
                { label: 'Memory Bandwidth', value: device.device.memoryBandwidthGBps ? `${device.device.memoryBandwidthGBps} GB/s` : undefined },
                { label: 'Form Factor', value: device.device.formFactor },
                { label: 'Interface', value: device.device.interface },
              ].filter(s => s.value).map(spec => (
                <div key={spec.label} className="flex justify-between items-center py-2 border-b border-slate-700/30">
                  <span className="text-sm text-slate-400">{spec.label}</span>
                  <span className="text-sm font-medium text-white">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI / Compute Specs */}
          {device.specs.length > 0 && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Compute Capabilities</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {device.specs.map(spec => (
                  <div key={spec.snapshotId} className="space-y-3 py-2 border-b border-slate-700/30">
                    {spec.int8Tops !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">INT8 TOPS</span>
                        <span className="text-sm font-medium text-brand-400">{spec.int8Tops}</span>
                      </div>
                    )}
                    {spec.fp16Tflops !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">FP16 TFLOPS</span>
                        <span className="text-sm font-medium text-white">{spec.fp16Tflops}</span>
                      </div>
                    )}
                    {spec.fp32Tflops !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">FP32 TFLOPS</span>
                        <span className="text-sm font-medium text-white">{spec.fp32Tflops}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benchmarks */}
          {device.benchmarks.length > 0 && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Benchmarks</h2>
              <div className="space-y-3">
                {device.benchmarks.map(bm => (
                  <div key={bm.resultId} className="flex items-center justify-between py-3 border-b border-slate-700/30">
                    <div>
                      <div className="text-sm font-medium text-white">{bm.benchmarkTypeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                      <div className="text-xs text-slate-500">
                        Source: {bm.sourceId} &middot; {bm.observedAt}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{bm.rawScore.toLocaleString()}</div>
                      {bm.normalizedScore !== undefined && (
                        <div className="text-xs text-slate-400">
                          Normalized: {(bm.normalizedScore * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Category</span>
                <span className="text-sm text-white font-medium">{device.family.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Vendor</span>
                <span className="text-sm text-white font-medium">{device.vendor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Status</span>
                <span className={`text-sm font-medium ${device.family.status === 'active' ? 'text-green-400' : 'text-slate-400'}`}>
                  {device.family.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Benchmarks</span>
                <span className="text-sm text-white font-medium">{device.benchmarks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Price Points</span>
                <span className="text-sm text-white font-medium">{device.prices.length}</span>
              </div>
            </div>
          </div>

          {/* Price History */}
          {device.prices.length > 0 && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Price History</h3>
              <div className="space-y-2">
                {device.prices.sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime()).map(price => (
                  <div key={price.priceId} className="flex justify-between items-center py-1.5">
                    <div>
                      <div className="text-sm text-white">${price.priceUsd.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">{price.condition} &middot; {price.region}</div>
                    </div>
                    <div className="text-xs text-slate-500">{price.observedAt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Devices */}
          {similar.length > 0 && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Similar Devices</h3>
              <div className="space-y-2">
                {similar.map(item => (
                  <Link
                    key={item.device.deviceId}
                    to={`/device/${item.device.deviceId}`}
                    className="block px-2 py-1.5 rounded hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="text-sm font-medium text-brand-400">{item.device.modelName}</div>
                    <div className="text-xs text-slate-500">{item.vendor.name}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
