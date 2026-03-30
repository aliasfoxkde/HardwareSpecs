import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { getStats, getDevicesByCategory, getDevices } from '@/lib/api'

function useAnimatedCounter(target: number, duration = 1500, startOnMount = false): number {
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!startOnMount || started.current) return
    started.current = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, startOnMount])

  return value
}

function StatCounter({ value: target, label }: { value: number; label: string }) {
  const animated = useAnimatedCounter(target, 1500, true)
  return (
    <div className="bg-bg-card/50 border border-border-subtle/50 rounded-xl px-4 py-3 backdrop-blur-sm">
      <div className="text-2xl sm:text-3xl font-bold text-text-primary">{animated.toLocaleString()}</div>
      <div className="text-sm text-text-secondary">{label}</div>
    </div>
  )
}

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
    }))

    let frameId: number
    let paused = false

    const onVisibility = () => {
      if (document.hidden) {
        paused = true
        cancelAnimationFrame(frameId)
      } else if (paused) {
        paused = false
        frameId = requestAnimationFrame(animate)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.offsetWidth
        if (p.x > canvas.offsetWidth) p.x = 0
        if (p.y < 0) p.y = canvas.offsetHeight
        if (p.y > canvas.offsetHeight) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`
        ctx.fill()
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

const categoryIcons: Record<string, string> = {
  CPU: '⚙️',
  GPU: '🎮',
  SBC: '🔋',
  NPU: '🧠',
  ASIC: '💎',
  SoC: '📱',
  System: '🖥️',
  Memory: '💾',
  Storage: '💿',
}

export function LandingPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getStats>> | null>(null)
  const [topGpus, setTopGpus] = useState<ReturnType<typeof getDevicesByCategory>>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [topValueDevices, setTopValueDevices] = useState<ReturnType<typeof getDevicesByCategory>>([])

  useEffect(() => {
    const s = getStats()
    setStats(s)
    setTopGpus(
      getDevicesByCategory('GPU')
        .filter(d => d.metrics.effectiveInt8Tops > 0)
        .sort((a, b) => b.metrics.effectiveInt8Tops - a.metrics.effectiveInt8Tops)
        .slice(0, 5),
    )

    // Count devices per category
    const cats = ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'Memory', 'Storage'] as const
    const counts: Record<string, number> = {}
    for (const cat of cats) {
      counts[cat] = getDevicesByCategory(cat).length
    }
    setCategoryCounts(counts)

    // Top value devices (best TOPS/$) — across all categories
    const { devices: allDevicesSorted } = getDevices({ sortBy: 'topsPerDollar', sortOrder: 'desc', pageSize: 1000 })
    const withValue = allDevicesSorted.filter(d => d.metrics.topsPerDollar != null && d.metrics.topsPerDollar > 0)
    setTopValueDevices(withValue.slice(0, 5))
  }, [])

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: '8+ Chart Types',
      description: 'Scatter, bar, pie, heatmap, time series, stacked, regression analysis, and radar visualizations.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      title: 'Cross-Vendor Compare',
      description: 'NVIDIA, AMD, Intel, Apple, Qualcomm, and edge AI vendors side by side.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'AI Accelerator DB',
      description: 'NPUs, TPUs, ASICs, and edge AI chips from Hailo, Coral, Groq, Cerebras.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Efficiency Metrics',
      description: 'TOPS/$, TOPS/W, Perf/$, Perf/W with best-value highlighting.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4m0-8c0-2.21-3.582-4-8-4S4 4.79 4 7m0 0h16" />
        </svg>
      ),
      title: 'Studio Mode',
      description: 'Full dataset spreadsheet with filtering, notes, export, and analysis.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13m-6 0a3 3 0 11-6 0 3 3 0 016 0zm6 0V6.253" />
        </svg>
      ),
      title: 'Live API Docs',
      description: 'Interactive API documentation with live examples and type references.',
    },
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 via-bg-primary to-bg-primary" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-3xl animate-pulse" />
        <Particles />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            Open Source Hardware Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text-primary tracking-tight mb-6 animate-fade-in">
            Compare Every Chip.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-cyan-400 to-emerald-400 animate-gradient-x bg-[length:200%_auto]">
              One Platform.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-fade-in">
            Normalized benchmarks, efficiency metrics, and AI accelerator tracking for CPUs, GPUs, NPUs, SBCs, and edge devices from every major vendor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link
              to="/browse"
              className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-500 text-text-primary font-semibold rounded-xl transition-colors shadow-lg shadow-brand-500/25"
            >
              Browse Database
            </Link>
            <Link
              to="/compare"
              className="w-full sm:w-auto px-8 py-3 bg-bg-secondary hover:bg-bg-secondary text-text-primary font-semibold rounded-xl transition-colors border border-border-subtle"
            >
              Compare Devices
            </Link>
            <Link
              to="/studio"
              className="w-full sm:w-auto px-8 py-3 bg-bg-secondary hover:bg-bg-secondary text-text-primary font-semibold rounded-xl transition-colors border border-border-subtle"
            >
              Studio
            </Link>
          </div>

          {/* Animated Stats */}
          {stats && (
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <StatCounter value={stats.totalDevices} label="Devices" />
              <StatCounter value={stats.totalVendors} label="Vendors" />
              <StatCounter value={stats.categories.length} label="Categories" />
              <StatCounter value={stats.totalBenchmarks} label="Benchmarks" />
            </div>
          )}
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 bg-bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Explore by Category</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Comprehensive hardware database across all major categories.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <Link
                key={cat}
                to={`/browse?category=${cat}`}
                className="bg-bg-card/50 border border-border-subtle/50 rounded-xl p-5 hover:border-brand-500/30 transition-all hover:scale-[1.02] text-center group"
              >
                <div className="text-3xl mb-2">{categoryIcons[cat] ?? '📦'}</div>
                <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-400 transition-colors">{cat}</h3>
                <div className="text-2xl font-bold text-brand-400 mt-1">{count}</div>
                <div className="text-xs text-text-muted">devices</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Powerful Analysis Tools</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              From edge AI accelerators to datacenter GPUs, get a complete picture of performance, efficiency, and value.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => (
              <div
                key={feature.title}
                className="bg-bg-card/50 border border-border-subtle/50 rounded-xl p-6 hover:border-brand-500/30 transition-colors"
              >
                <div className="text-brand-400 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Value Devices */}
      {topValueDevices.length > 0 && (
        <section className="py-16 bg-bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Best TOPS/$ Value</h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                The most efficient compute per dollar across all GPUs.
              </p>
            </div>
            <div className="max-w-3xl mx-auto bg-bg-card/50 border border-border-subtle/50 rounded-xl p-6">
              <div className="space-y-3">
                {topValueDevices.map((item, i) => (
                  <Link
                    key={item.device.deviceId}
                    to={`/device/${item.device.deviceId}`}
                    className="flex items-center justify-between hover:bg-bg-card rounded-lg px-3 py-2 -mx-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-brand-400 w-6 text-center">{i + 1}</span>
                      <div>
                        <div className="text-sm font-medium text-text-primary">{item.device.modelName}</div>
                        <div className="text-xs text-text-secondary">{item.vendor.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.metrics.topsPerDollar != null && (
                        <span className="text-sm font-bold text-green-400">{item.metrics.topsPerDollar.toFixed(1)} TOPS/$</span>
                      )}
                      {item.metrics.effectiveInt8Tops > 0 && (
                        <span className="text-sm text-text-secondary">{item.metrics.effectiveInt8Tops.toFixed(0)} TOPS</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/studio" className="inline-block mt-4 text-sm text-brand-400 hover:text-brand-300">
                View full analysis in Studio &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Top GPUs */}
      {topGpus.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Top GPUs</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-bg-card/50 border border-border-subtle/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">By TOPS Performance</h3>
                <div className="space-y-3">
                  {topGpus.map(item => (
                    <Link
                      key={item.device.deviceId}
                      to={`/device/${item.device.deviceId}`}
                      className="flex items-center justify-between hover:bg-bg-card rounded-lg px-3 py-2 -mx-3 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-text-primary">{item.device.modelName}</div>
                        <div className="text-xs text-text-secondary">{item.vendor.name}</div>
                      </div>
                      <div className="text-right">
                        {item.metrics.effectiveInt8Tops > 0 ? (
                          <div className="text-sm font-bold text-brand-400">{item.metrics.effectiveInt8Tops.toFixed(0)} TOPS</div>
                        ) : (
                          <div className="text-sm text-text-secondary">-</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                <Link to="/browse?category=GPU" className="inline-block mt-4 text-sm text-brand-400 hover:text-brand-300">
                  View all GPUs &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-bg-secondary/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Start Comparing Hardware</h2>
          <p className="text-lg text-text-secondary mb-8">
            Free, open source, and built for researchers, developers, and hardware enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/browse"
              className="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-500 text-text-primary font-semibold rounded-xl transition-colors shadow-lg shadow-brand-500/25"
            >
              Explore the Database
            </Link>
            <Link
              to="/charts"
              className="inline-block px-8 py-3 bg-bg-secondary hover:bg-bg-secondary text-text-primary font-semibold rounded-xl transition-colors border border-border-subtle"
            >
              View Charts
            </Link>
            <Link
              to="/docs"
              className="inline-block px-8 py-3 bg-bg-secondary hover:bg-bg-secondary text-text-primary font-semibold rounded-xl transition-colors border border-border-subtle"
            >
              API Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
