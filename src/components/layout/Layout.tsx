import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { searchDevices, getStats } from '@/lib/api'

export function Layout() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchDevices>>([])
  const [showSearch, setShowSearch] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getStats>> | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setStats(getStats())
    setMobileMenuOpen(false)
    setShowSearch(false)
    setSearchQuery('')
  }, [location.pathname])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchDevices(searchQuery, 8)
      setSearchResults(results)
      setShowSearch(true)
    } else {
      setSearchResults([])
      setShowSearch(false)
    }
  }, [searchQuery])

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/browse', label: 'Browse' },
    { path: '/compare', label: 'Compare' },
    { path: '/charts', label: 'Charts' },
  ]

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/favicon.svg" alt="SiliconRank" className="w-8 h-8" />
              <span className="text-xl font-bold text-white">SiliconRank</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search */}
            <div className="hidden md:block relative flex-1 max-w-xs ml-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                  {searchResults.map(result => (
                    <button
                      key={result.device.deviceId}
                      onClick={() => {
                        navigate(`/device/${result.device.deviceId}`)
                        setShowSearch(false)
                        setSearchQuery('')
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{result.device.modelName}</div>
                        <div className="text-xs text-slate-400">{result.vendor.name} &middot; {result.family.category}</div>
                      </div>
                      {result.latestPrice && (
                        <div className="text-sm text-brand-400">${result.latestPrice.priceUsd.toLocaleString()}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 animate-fade-in">
              <div className="relative mb-3">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              {showSearch && searchResults.length > 0 && (
                <div className="mb-3 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                  {searchResults.slice(0, 5).map(result => (
                    <button
                      key={result.device.deviceId}
                      onClick={() => {
                        navigate(`/device/${result.device.deviceId}`)
                        setMobileMenuOpen(false)
                        setSearchQuery('')
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-700 text-sm text-white"
                    >
                      {result.device.modelName} <span className="text-slate-400">- {result.vendor.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      location.pathname === link.path
                        ? 'bg-brand-600/20 text-brand-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/favicon.svg" alt="" className="w-6 h-6" />
                <span className="font-bold text-white">SiliconRank</span>
              </div>
              <p className="text-sm text-slate-400">
                Open hardware intelligence platform. Compare CPUs, GPUs, NPUs, and AI accelerators.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Explore</h4>
              <div className="flex flex-col gap-2">
                <Link to="/browse" className="text-sm text-slate-400 hover:text-white transition-colors">Browse Devices</Link>
                <Link to="/compare" className="text-sm text-slate-400 hover:text-white transition-colors">Compare</Link>
                <Link to="/charts" className="text-sm text-slate-400 hover:text-white transition-colors">Charts</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Categories</h4>
              <div className="flex flex-col gap-2">
                <Link to="/browse?category=CPU" className="text-sm text-slate-400 hover:text-white transition-colors">CPUs</Link>
                <Link to="/browse?category=GPU" className="text-sm text-slate-400 hover:text-white transition-colors">GPUs</Link>
                <Link to="/browse?category=NPU" className="text-sm text-slate-400 hover:text-white transition-colors">NPUs / AI</Link>
                <Link to="/browse?category=SBC" className="text-sm text-slate-400 hover:text-white transition-colors">SBCs</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Project</h4>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-slate-400">Open Source (MIT)</span>
                {stats && (
                  <span className="text-sm text-slate-400">
                    {stats.totalDevices} devices &middot; {stats.totalVendors} vendors
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
            SiliconRank &copy; {new Date().getFullYear()} &middot; Open source under MIT License
          </div>
        </div>
      </footer>
    </div>
  )
}
