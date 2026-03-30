import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const POPULAR_CATEGORIES = [
  { label: 'CPUs', path: '/browse?category=CPU' },
  { label: 'GPUs', path: '/browse?category=GPU' },
  { label: 'NPUs / AI', path: '/browse?category=NPU' },
  { label: 'SBCs', path: '/browse?category=SBC' },
]

const POPULAR_DEVICES = [
  { name: 'NVIDIA RTX 5090', id: 'nvidia-rtx-5090' },
  { name: 'Apple M4 Ultra', id: 'apple-m4-ultra' },
  { name: 'NVIDIA H100 SXM', id: 'nvidia-h100-sxm' },
  { name: 'Raspberry Pi 5', id: 'raspberry-pi-5' },
]

export function NotFoundPage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/browse?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="text-6xl font-bold text-text-secondary mb-4">404</div>
      <h1 className="text-2xl font-bold text-text-primary mb-4">Page Not Found</h1>
      <p className="text-text-secondary mb-8">The page you're looking for doesn't exist.</p>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search devices..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-500 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Popular categories */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Popular Categories</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_CATEGORIES.map(cat => (
            <Link
              key={cat.path}
              to={cat.path}
              className="px-4 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-brand-500/30 transition-colors"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Popular devices */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Popular Devices</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_DEVICES.map(device => (
            <Link
              key={device.id}
              to={`/device/${device.id}`}
              className="px-4 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-brand-400 hover:text-brand-300 hover:border-brand-500/30 transition-colors"
            >
              {device.name}
            </Link>
          ))}
        </div>
      </div>

      <Link to="/" className="text-brand-400 hover:text-brand-300 font-medium">
        &larr; Back to Home
      </Link>
    </div>
  )
}
