import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getStats, getDevicesByCategory } from '@/lib/api'

export function LandingPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getStats>> | null>(null)
  const [topGpus, setTopGpus] = useState<ReturnType<typeof getDevicesByCategory>>([])
  const [topSbcs, setTopSbcs] = useState<ReturnType<typeof getDevicesByCategory>>([])

  useEffect(() => {
    const s = getStats()
    setStats(s)
    setTopGpus(getDevicesByCategory('GPU').slice(0, 5))
    setTopSbcs(getDevicesByCategory('SBC').slice(0, 5))
  }, [])

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Interactive Charts',
      description: 'Scatter plots, heatmaps, Pareto frontiers, and more. Visualize performance, efficiency, and value across any dimension.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      title: 'Cross-Vendor Comparison',
      description: 'Compare NVIDIA, AMD, Intel, Apple, Qualcomm, and edge AI vendors side by side with normalized metrics.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'AI Accelerator Tracking',
      description: 'NPUs, TPUs, ASICs, and edge AI chips from Hailo, Coral, Radxa, Groq, Cerebras, and more.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Data Provenance',
      description: 'Every data point is traceable to its source with confidence scores and measurement context.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Efficiency Metrics',
      description: 'Performance per dollar, performance per watt, effective INT8 TOPS, and value scoring.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Mobile-First PWA',
      description: 'Install as a native app on any device. Full-screen, offline-capable, works everywhere.',
    },
  ]

  const sources = [
    { name: 'Geekbench', desc: 'Cross-platform CPU & GPU benchmarks' },
    { name: 'PassMark', desc: '30+ years of benchmark history' },
    { name: 'TechPowerUp', desc: 'GPU performance database' },
    { name: 'MLPerf', desc: 'Standardized AI benchmarks' },
    { name: 'Vendor Specs', desc: 'NVIDIA, AMD, Intel, Apple, Qualcomm' },
    { name: 'Community', desc: 'Phoronix, SBC benchmarks, and more' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 via-surface to-surface" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            Open Source Hardware Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight mb-6">
            Compare Every Chip.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">
              One Platform.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Normalized benchmarks, efficiency metrics, and AI accelerator tracking for CPUs, GPUs, NPUs, SBCs, and edge devices from every major vendor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/browse"
              className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-brand-500/25"
            >
              Browse Database
            </Link>
            <Link
              to="/compare"
              className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors border border-slate-700"
            >
              Compare Devices
            </Link>
          </div>

          {/* Stats bar */}
          {stats && (
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { value: stats.totalDevices, label: 'Devices' },
                { value: stats.totalVendors, label: 'Vendors' },
                { value: stats.categories.length, label: 'Categories' },
                { value: stats.totalBenchmarks, label: 'Benchmarks' },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything You Need to Compare Hardware</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              From edge AI accelerators to datacenter GPUs, get a complete picture of performance, efficiency, and value.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => (
              <div
                key={feature.title}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-brand-500/30 transition-colors"
              >
                <div className="text-brand-400 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Multi-Source Data Aggregation</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Data from the most trusted benchmark and vendor sources, normalized and cross-linked.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {sources.map(source => (
              <div key={source.name} className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="w-2 h-2 rounded-full bg-brand-400 mt-2 shrink-0" />
                <div>
                  <div className="font-semibold text-white text-sm">{source.name}</div>
                  <div className="text-xs text-slate-400">{source.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Preview */}
      <section className="py-20 bg-surface-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Explore by Category</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {/* GPUs */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top GPUs</h3>
              <div className="space-y-3">
                {topGpus.map(item => (
                  <Link
                    key={item.device.deviceId}
                    to={`/device/${item.device.deviceId}`}
                    className="flex items-center justify-between hover:bg-slate-700/50 rounded-lg px-3 py-2 -mx-3 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{item.device.modelName}</div>
                      <div className="text-xs text-slate-400">{item.vendor.name}</div>
                    </div>
                    {item.latestPrice && (
                      <div className="text-sm text-brand-400">${item.latestPrice.priceUsd.toLocaleString()}</div>
                    )}
                  </Link>
                ))}
              </div>
              <Link to="/browse?category=GPU" className="inline-block mt-4 text-sm text-brand-400 hover:text-brand-300">
                View all GPUs &rarr;
              </Link>
            </div>

            {/* SBCs */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top SBCs</h3>
              <div className="space-y-3">
                {topSbcs.map(item => (
                  <Link
                    key={item.device.deviceId}
                    to={`/device/${item.device.deviceId}`}
                    className="flex items-center justify-between hover:bg-slate-700/50 rounded-lg px-3 py-2 -mx-3 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{item.device.modelName}</div>
                      <div className="text-xs text-slate-400">{item.vendor.name}</div>
                    </div>
                    {item.device.tdpWatts && (
                      <div className="text-xs text-slate-400">{item.device.tdpWatts}W</div>
                    )}
                  </Link>
                ))}
              </div>
              <Link to="/browse?category=SBC" className="inline-block mt-4 text-sm text-brand-400 hover:text-brand-300">
                View all SBCs &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Start Comparing Hardware</h2>
          <p className="text-lg text-slate-400 mb-8">
            Free, open source, and built for researchers, developers, and hardware enthusiasts.
          </p>
          <Link
            to="/browse"
            className="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-brand-500/25"
          >
            Explore the Database
          </Link>
        </div>
      </section>
    </div>
  )
}
