import { useParams, Link } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import { getDevice, getDevicesByCategory, getDeviceMetrics } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function fmtNum(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '-'
  if (n >= 1000) return `${(n / 1000).toFixed(decimals)}k`
  if (Number.isInteger(n)) return n.toLocaleString()
  return n.toFixed(decimals)
}

export function DevicePage() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const device = useMemo(() => (deviceId ? getDevice(deviceId) : undefined), [deviceId])
  const metrics = useMemo(() => (deviceId ? getDeviceMetrics(deviceId) : null), [deviceId])
  const similar = useMemo(() => {
    if (!device) return []
    const sameCategory = getDevicesByCategory(device.family.category)
    return sameCategory.filter(d => d.device.deviceId !== device.device.deviceId).slice(0, 5)
  }, [device])

  useEffect(() => {
    if (!device) return
    const tops = metrics?.effectiveInt8Tops ? `${metrics.effectiveInt8Tops.toLocaleString()} TOPS` : ''
    const price = device.latestPrice?.priceUsd ? `$${device.latestPrice.priceUsd.toLocaleString()}` : ''
    document.title = `${device.device.modelName}${tops ? ` - ${tops}` : ''}${price ? ` - ${price}` : ''} | SiliconRank`
    const desc = [
      `${device.device.modelName}:`,
      tops,
      price,
      device.device.tdpWatts ? `${device.device.tdpWatts}W TDP` : '',
    ].filter(Boolean).join(', ')
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', `${desc}. Compare specs, benchmarks, and efficiency metrics.`)
    return () => { document.title = 'SiliconRank' }
  }, [device, metrics])

  if (!device) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Device Not Found</h1>
        <p className="text-text-secondary mb-6">The device you're looking for doesn't exist in our database.</p>
        <Link to="/browse" className="text-brand-400 hover:text-brand-300">Browse all devices &rarr;</Link>
      </div>
    )
  }

  const latestPrice = device.prices.sort((a, b) =>
    new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime()
  )[0]

  const completenessPct = Math.round((metrics?.dataCompleteness ?? 0) * 100)
  const completenessColor = completenessPct >= 70 ? 'bg-green-500' : completenessPct >= 40 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link to="/" className="hover:text-text-primary">Home</Link>
        <span className="text-text-muted/40">/</span>
        <Link to="/browse" className="hover:text-text-primary">Browse</Link>
        <span className="text-text-muted/40">/</span>
        <Link to={`/browse?category=${device.family.category}`} className="hover:text-text-primary">{device.family.category}</Link>
        <span className="text-text-muted/40">/</span>
        <span className="text-text-primary font-medium">{device.device.modelName}</span>
      </nav>

      {/* Header */}
      <div className="bg-bg-card/50 border border-border-subtle/50 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{device.device.modelName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="px-2.5 py-0.5 text-xs font-medium rounded bg-brand-600/20 text-brand-400 border border-brand-500/20">
                {device.family.category}
              </span>
              <span className="text-sm text-text-secondary">{device.vendor.name}</span>
              <span className="text-sm text-text-muted">&middot;</span>
              <span className="text-sm text-text-secondary">{device.family.familyName}</span>
            </div>
            <p className="text-sm text-text-muted mt-2">Architecture: {device.family.architecture} &middot; Launched {device.device.launchDate}</p>
          </div>
          <div className="text-right shrink-0">
            {latestPrice && (
              <>
                <div className="text-2xl font-bold text-text-primary">${latestPrice.priceUsd.toLocaleString()}</div>
                <div className="text-sm text-text-secondary">{latestPrice.condition === 'msrp' ? 'MSRP' : latestPrice.condition}</div>
              </>
            )}
            <div className="flex gap-2 mt-2">
              {device.device.referenceUrl && (
                <a
                  href={device.device.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-bg-tertiary/50 text-text-secondary hover:text-brand-400 border border-border-subtle/50 hover:border-brand-500/30 transition-colors"
                >
                  Source &nearr;
                </a>
              )}
              {device.device.purchaseUrl && (
                <a
                  href={device.device.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/20 hover:border-green-500/30 transition-colors"
                >
                  Buy &nearr;
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Efficiency Metrics Card */}
          {metrics && (metrics.effectiveInt8Tops > 0 || metrics.topsPerDollar || metrics.perfPerDollar) && (
            <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Efficiency Metrics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {metrics.effectiveInt8Tops > 0 && (
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-text-secondary mb-1">INT8 TOPS</div>
                    <div className="text-lg font-bold text-brand-400">{fmtNum(metrics.effectiveInt8Tops)}</div>
                    {metrics.effectiveInt8TopsConfidence < 1 && (
                      <div className="text-[10px] text-text-muted mt-0.5">
                        confidence: {Math.round(metrics.effectiveInt8TopsConfidence * 100)}%
                      </div>
                    )}
                  </div>
                )}
                {metrics.topsPerDollar != null && metrics.topsPerDollar > 0 && (
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-text-secondary mb-1">TOPS/$</div>
                    <div className="text-lg font-bold text-green-400">{fmtNum(metrics.topsPerDollar)}</div>
                  </div>
                )}
                {metrics.topsPerWatt != null && metrics.topsPerWatt > 0 && (
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-text-secondary mb-1">TOPS/W</div>
                    <div className="text-lg font-bold text-blue-400">{fmtNum(metrics.topsPerWatt)}</div>
                  </div>
                )}
                {metrics.perfPerDollar != null && metrics.perfPerDollar > 0 && (
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-text-secondary mb-1">Perf/$</div>
                    <div className="text-lg font-bold text-text-primary">{fmtNum(metrics.perfPerDollar, 0)}</div>
                  </div>
                )}
                {metrics.perfPerWatt != null && metrics.perfPerWatt > 0 && (
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-text-secondary mb-1">Perf/W</div>
                    <div className="text-lg font-bold text-purple-400">{fmtNum(metrics.perfPerWatt, 0)}</div>
                  </div>
                )}
                {metrics.fp16Tflops != null && (
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-text-secondary mb-1">FP16 TFLOPS</div>
                    <div className="text-lg font-bold text-text-primary">{fmtNum(metrics.fp16Tflops)}</div>
                  </div>
                )}
                {metrics.fp32Tflops != null && (
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-text-secondary mb-1">FP32 TFLOPS</div>
                    <div className="text-lg font-bold text-text-primary">{fmtNum(metrics.fp32Tflops)}</div>
                  </div>
                )}
                {metrics.fp4Tflops != null && (
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-text-secondary mb-1">FP4 TFLOPS</div>
                    <div className="text-lg font-bold text-orange-400">{fmtNum(metrics.fp4Tflops)}</div>
                  </div>
                )}
                {metrics.fp8Tflops != null && (
                  <div className="bg-bg-tertiary/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-text-secondary mb-1">FP8 TFLOPS</div>
                    <div className="text-lg font-bold text-cyan-400">{fmtNum(metrics.fp8Tflops)}</div>
                  </div>
                )}
              </div>
              {/* Data Completeness bar */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs text-text-secondary">Data Completeness</span>
                <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${completenessColor}`} style={{ width: `${completenessPct}%` }} />
                </div>
                <span className="text-xs text-text-muted font-medium">{completenessPct}%</span>
              </div>
            </div>
          )}

          {/* Key Specifications */}
          <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Specifications</h2>
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
                <div key={spec.label} className="flex justify-between items-center py-2 border-b border-border-subtle/30">
                  <span className="text-sm text-text-secondary">{spec.label}</span>
                  <span className="text-sm font-medium text-text-primary">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI / Compute Specs */}
          {device.specs.length > 0 && (
            <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Compute Capabilities</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {device.specs.map(spec => (
                  <div key={spec.snapshotId} className="space-y-3 py-2 border-b border-border-subtle/30">
                    {spec.int8Tops !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">INT8 TOPS</span>
                        <span className="text-sm font-medium text-brand-400">{spec.int8Tops}</span>
                      </div>
                    )}
                    {spec.fp16Tflops !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">FP16 TFLOPS</span>
                        <span className="text-sm font-medium text-text-primary">{spec.fp16Tflops}</span>
                      </div>
                    )}
                    {spec.fp32Tflops !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">FP32 TFLOPS</span>
                        <span className="text-sm font-medium text-text-primary">{spec.fp32Tflops}</span>
                      </div>
                    )}
                    {spec.fp4Tflops !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">FP4 TFLOPS</span>
                        <span className="text-sm font-medium text-orange-400">{spec.fp4Tflops}</span>
                      </div>
                    )}
                    {spec.fp8Tflops !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">FP8 TFLOPS</span>
                        <span className="text-sm font-medium text-cyan-400">{spec.fp8Tflops}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benchmarks */}
          {device.benchmarks.length > 0 && (
            <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Benchmarks</h2>
              <div className="space-y-3">
                {device.benchmarks.map(bm => (
                  <div key={bm.resultId} className="flex items-center justify-between py-3 border-b border-border-subtle/30">
                    <div>
                      <div className="text-sm font-medium text-text-primary">{bm.benchmarkTypeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                      <div className="text-xs text-text-muted">
                        Source: {bm.sourceId} &middot; {bm.observedAt}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-text-primary">{bm.rawScore.toLocaleString()}</div>
                      {bm.normalizedScore !== undefined && (
                        <div className="text-xs text-text-secondary">
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
          <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Category</span>
                <span className="text-sm text-text-primary font-medium">{device.family.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Vendor</span>
                <span className="text-sm text-text-primary font-medium">{device.vendor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Status</span>
                <span className={`text-sm font-medium ${device.family.status === 'active' ? 'text-green-400' : 'text-text-secondary'}`}>
                  {device.family.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Benchmarks</span>
                <span className="text-sm text-text-primary font-medium">{device.benchmarks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Price Points</span>
                <span className="text-sm text-text-primary font-medium">{device.prices.length}</span>
              </div>
            </div>
          </div>

          {/* Price History */}
          {device.prices.length > 0 && (() => {
            const sortedPrices = [...device.prices].sort((a, b) =>
              new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime()
            )
            const chartData = sortedPrices.map(p => ({ date: p.observedAt, price: p.priceUsd, condition: p.condition }))
            return (
              <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Price History</h3>
                {sortedPrices.length >= 2 && (
                  <div className="mb-4" style={{ width: '100%', height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} stroke="var(--color-border-subtle)" />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} stroke="var(--color-border-subtle)" tickFormatter={v => `$${v.toLocaleString()}`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '12px' }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any) => [`$${Number(value ?? 0).toLocaleString()}`, 'Price']}
                          labelFormatter={label => `Date: ${label}`}
                        />
                        <Line type="monotone" dataKey="price" stroke="var(--color-brand-500)" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="space-y-2">
                  {sortedPrices.reverse().map(price => (
                    <div key={price.priceId} className="flex justify-between items-center py-1.5">
                      <div>
                        <div className="text-sm text-text-primary">${price.priceUsd.toLocaleString()}</div>
                        <div className="text-xs text-text-muted">{price.condition} &middot; {price.region}</div>
                      </div>
                      <div className="text-xs text-text-muted">{price.observedAt}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Similar Devices */}
          {similar.length > 0 && (
            <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Similar Devices</h3>
              <div className="space-y-2">
                {similar.map(item => (
                  <Link
                    key={item.device.deviceId}
                    to={`/device/${item.device.deviceId}`}
                    className="block px-2 py-1.5 rounded hover:bg-bg-tertiary/50 transition-colors"
                  >
                    <div className="text-sm font-medium text-brand-400">{item.device.modelName}</div>
                    <div className="text-xs text-text-muted">
                      {item.vendor.name}
                      {item.metrics.topsPerDollar != null && item.metrics.topsPerDollar > 0 && (
                        <> &middot; <span className="text-green-400">{fmtNum(item.metrics.topsPerDollar)} TOPS/$</span></>
                      )}
                    </div>
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
