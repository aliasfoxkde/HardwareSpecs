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
                <a
                  href="https://github.com/aliasfoxkde/HardwareSpecs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </a>
                <span className="text-sm text-slate-400">Open Source (MIT)</span>
                {stats && (
                  <span className="text-sm text-slate-400">
                    {stats.totalDevices} devices &middot; {stats.totalVendors} vendors
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
              <span>SiliconRank &copy; {new Date().getFullYear()} &middot; Open source under MIT License</span>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/sponsors/aliasfoxkde"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-pink-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  Sponsor
                </a>
                <a
                  href="https://ko-fi.com/aliasfoxkde"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-brand-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/></svg>
                  Ko-fi
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
