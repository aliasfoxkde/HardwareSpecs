import { useState, useEffect, useRef, useCallback } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { searchDevices, getStats } from '@/lib/api'
import { useTheme } from '@/hooks/useTheme'
import { BackToTop } from '@/components/layout/BackToTop'

function ThemeIcon({ mode }: { mode: 'auto' | 'dark' | 'light' }) {
  if (mode === 'dark') {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )
  }
  if (mode === 'light') {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  }
  // auto — monitor icon
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

export function Layout() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchDevices>>([])
  const [showSearch, setShowSearch] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [stats] = useState<Awaited<ReturnType<typeof getStats>> | null>(() => getStats())
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reset UI state on navigation using microtask to avoid synchronous setState in effect
    const id = queueMicrotask(() => {
      setMobileMenuOpen(false)
      setShowSearch(false)
      setSearchQuery('')
    })
    return () => clearTimeout(id as unknown as number)
  }, [location.pathname])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // Focus trap + Escape key for mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return
    const menu = menuRef.current
    if (!menu) return

    const focusable = menu.querySelectorAll<HTMLElement>(
      'a[href], button, input, [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length > 0) focusable[0].focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        menuButtonRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const doSearch = useCallback((query: string) => {
    if (query.length >= 2) {
      const results = searchDevices(query, 8)
      setSearchResults(results)
      setShowSearch(true)
    } else {
      setSearchResults([])
      setShowSearch(false)
    }
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 200)
  }, [doSearch])

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/browse', label: 'Browse' },
    { path: '/compare', label: 'Compare' },
    { path: '/charts', label: 'Charts' },
    { path: '/studio', label: 'Studio' },
    { path: '/tools', label: 'Tools' },
    { path: '/reports', label: 'Reports' },
    { path: '/docs', label: 'Docs' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      {/* Navbar */}
      <nav aria-label="Main navigation" className="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur-md border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/favicon.svg" alt="SiliconRank" className="w-8 h-8" />
              <span className="text-xl font-bold text-text-primary">SiliconRank</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive(link.path) ? 'page' : undefined}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search + Theme Toggle */}
            <div className="hidden lg:flex items-center gap-2 flex-1 max-w-xs ml-4">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                aria-label={`Theme: ${theme}. Click to switch.`}
                title={`Theme: ${theme}`}
              >
                <ThemeIcon mode={theme} />
              </button>
              {showSearch && searchResults.length > 0 && (
                <div role="listbox" aria-label="Search results" className="absolute top-full mt-1 w-full bg-bg-secondary border border-border-subtle rounded-lg shadow-xl overflow-hidden z-50">
                  {searchResults.map(result => (
                    <button
                      key={result.device.deviceId}
                      role="option"
                      onClick={() => {
                        navigate(`/device/${result.device.deviceId}`)
                        setShowSearch(false)
                        setSearchQuery('')
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-bg-tertiary transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-text-primary">{result.device.modelName}</div>
                        <div className="text-xs text-text-secondary">{result.vendor.name} &middot; {result.family.category}</div>
                      </div>
                      {result.latestPrice && (
                        <div className="text-sm text-brand-400">${result.latestPrice.priceUsd.toLocaleString()}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: theme + menu buttons */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-text-secondary hover:text-text-primary"
                aria-label={`Theme: ${theme}`}
              >
                <ThemeIcon mode={theme} />
              </button>
              <button
                ref={menuButtonRef}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                className="p-2 text-text-secondary hover:text-text-primary"
                aria-label="Toggle navigation menu"
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
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div ref={menuRef} id="mobile-menu" className="lg:hidden pb-4 animate-fade-in">
              <div className="relative mb-3">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              {showSearch && searchResults.length > 0 && (
                <div className="mb-3 bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden">
                  {searchResults.slice(0, 5).map(result => (
                    <button
                      key={result.device.deviceId}
                      onClick={() => {
                        navigate(`/device/${result.device.deviceId}`)
                        setMobileMenuOpen(false)
                        setSearchQuery('')
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-bg-tertiary text-sm text-text-primary"
                    >
                      {result.device.modelName} <span className="text-text-secondary">- {result.vendor.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <div role="menu" className="flex flex-col gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    role="menuitem"
                    aria-current={isActive(link.path) ? 'page' : undefined}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      isActive(link.path)
                        ? 'bg-brand-600/20 text-brand-400'
                        : 'text-text-secondary hover:text-text-primary'
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
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer aria-label="Site footer" className="border-t border-border-default bg-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/favicon.svg" alt="" className="w-6 h-6" />
                <span className="font-bold text-text-primary">SiliconRank</span>
              </div>
              <p className="text-sm text-text-secondary">
                Open hardware intelligence platform. Compare CPUs, GPUs, NPUs, and AI accelerators.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-3">Explore</h4>
              <div className="flex flex-col gap-2">
                <Link to="/browse" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Browse Devices</Link>
                <Link to="/compare" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Compare</Link>
                <Link to="/charts" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Charts</Link>
                <Link to="/studio" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Studio</Link>
                <Link to="/tools" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Tools</Link>
                <Link to="/reports" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Reports</Link>
                <Link to="/docs" className="text-sm text-text-secondary hover:text-text-primary transition-colors">API Docs</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-3">Categories</h4>
              <div className="flex flex-col gap-2">
                <Link to="/browse?category=CPU" className="text-sm text-text-secondary hover:text-text-primary transition-colors">CPUs</Link>
                <Link to="/browse?category=GPU" className="text-sm text-text-secondary hover:text-text-primary transition-colors">GPUs</Link>
                <Link to="/browse?category=NPU" className="text-sm text-text-secondary hover:text-text-primary transition-colors">NPUs / AI</Link>
                <Link to="/browse?category=SBC" className="text-sm text-text-secondary hover:text-text-primary transition-colors">SBCs</Link>
                <Link to="/browse?category=Memory" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Memory</Link>
                <Link to="/browse?category=Storage" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Storage</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-3">Project</h4>
              <div className="flex flex-col gap-2">
                <a
                  href="https://github.com/aliasfoxkde/HardwareSpecs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </a>
                <span className="text-sm text-text-secondary">Open Source (MIT)</span>
                {stats && (
                  <span className="text-sm text-text-secondary">
                    {stats.totalDevices} devices &middot; {stats.totalVendors} vendors
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border-default">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
              <span>SiliconRank &copy; {new Date().getFullYear()} &middot; Open source under MIT License</span>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/sponsors/aliasfoxkde"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-text-secondary hover:text-pink-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  Sponsor
                </a>
                <a
                  href="https://ko-fi.com/aliasfoxkde"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-text-secondary hover:text-brand-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/></svg>
                  Ko-fi
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <BackToTop />
    </div>
  )
}
