import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getDevices, getVendors, getFamilies } from '@/lib/api'
import type { DeviceCategory, FilterState } from '@/types'

const CATEGORIES: DeviceCategory[] = ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System']

const SORT_OPTIONS = [
  { value: 'launchDate', label: 'Launch Date' },
  { value: 'name', label: 'Name' },
  { value: 'tdp', label: 'TDP' },
  { value: 'price', label: 'Price' },
  { value: 'tops', label: 'INT8 TOPS' },
  { value: 'topsPerDollar', label: 'TOPS/$' },
  { value: 'topsPerWatt', label: 'TOPS/W' },
  { value: 'perfPerDollar', label: 'Perf/$' },
  { value: 'perfPerWatt', label: 'Perf/W' },
  { value: 'dataCompleteness', label: 'Data Quality' },
] as const

function fmtNum(n: number | null | undefined, decimals = 1): string {
  if (n == null) return '-'
  if (n >= 1000) return `${(n / 1000).toFixed(decimals)}k`
  if (n >= 100) return Math.round(n).toLocaleString()
  return n.toFixed(decimals)
}

function CompletenessBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-text-muted">{pct}%</span>
    </div>
  )
}

export function BrowsePage() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<FilterState>({
    vendors: [],
    categories: searchParams.get('category') ? [searchParams.get('category') as DeviceCategory] : [],
    architectures: [],
    searchQuery: '',
    sortBy: 'launchDate',
    sortOrder: 'desc',
    page: 1,
    pageSize: 25,
  })

  const vendors = useMemo(() => getVendors(), [])
  const families = useMemo(() => getFamilies(), [])
  const { devices, total } = useMemo(() => getDevices(filters), [filters])

  const totalPages = Math.ceil(total / filters.pageSize)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) {
      setFilters(f => ({ ...f, categories: [cat as DeviceCategory], page: 1 }))
    }
  }, [searchParams])

  const toggleCategory = (cat: DeviceCategory) => {
    setFilters(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
      page: 1,
    }))
  }

  const toggleVendor = (vendorId: string) => {
    setFilters(f => ({
      ...f,
      vendors: f.vendors.includes(vendorId)
        ? f.vendors.filter(v => v !== vendorId)
        : [...f.vendors, vendorId],
      page: 1,
    }))
  }

  const uniqueVendorIds = [...new Set(families.map(f => f.vendorId))]
  const activeVendors = uniqueVendorIds
    .map(id => vendors.find(v => v.vendorId === id))
    .filter(Boolean)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Browse Devices</h1>
          <p className="text-sm text-text-secondary">{total} devices found</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy}
            onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value, page: 1 }))}
            className="bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setFilters(f => ({ ...f, sortOrder: f.sortOrder === 'asc' ? 'desc' : 'asc' }))}
            className="p-2 bg-bg-secondary border border-border-subtle rounded-lg text-text-secondary hover:text-text-primary"
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, vendor, or family..."
          value={filters.searchQuery}
          onChange={e => setFilters(f => ({ ...f, searchQuery: e.target.value, page: 1 }))}
          className="w-full px-4 py-2.5 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filters.categories.includes(cat)
                  ? 'bg-brand-600 text-text-primary'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Vendor filters */}
        <div className="flex flex-wrap gap-2">
          {activeVendors.map(vendor => vendor && (
            <button
              key={vendor.vendorId}
              onClick={() => toggleVendor(vendor.vendorId)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filters.vendors.includes(vendor.vendorId)
                  ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30'
                  : 'bg-bg-card/50 text-text-secondary hover:text-text-primary border border-border-subtle/50'
              }`}
            >
              {vendor.name}
            </button>
          ))}
        </div>

        {/* Active filter summary */}
        {(filters.categories.length > 0 || filters.vendors.length > 0 || filters.searchQuery) && (
          <button
            onClick={() => setFilters(f => ({ ...f, categories: [], vendors: [], searchQuery: '', page: 1 }))}
            className="text-sm text-brand-400 hover:text-brand-300"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Device table */}
      <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl overflow-hidden">
        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Device</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Vendor</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">INT8 TOPS</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">TOPS/$</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">TOPS/W</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Perf/$</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">TDP</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(item => (
                <tr
                  key={item.device.deviceId}
                  className="border-b border-border-subtle/30 hover:bg-bg-tertiary/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/device/${item.device.deviceId}`}
                      className="text-sm font-medium text-brand-400 hover:text-brand-300"
                    >
                      {item.device.modelName}
                    </Link>
                    {item.device.sku && (
                      <div className="text-xs text-text-muted">{item.device.sku}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-bg-tertiary text-text-secondary">
                      {item.family.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{item.vendor.name}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {item.metrics.effectiveInt8Tops > 0 ? (
                      <span className="text-brand-400">{fmtNum(item.metrics.effectiveInt8Tops)}</span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {item.metrics.topsPerDollar != null && item.metrics.topsPerDollar > 0 ? (
                      <span className="text-green-400 font-medium">{fmtNum(item.metrics.topsPerDollar)}</span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {item.metrics.topsPerWatt != null && item.metrics.topsPerWatt > 0 ? (
                      <span className="text-blue-400 font-medium">{fmtNum(item.metrics.topsPerWatt)}</span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {item.metrics.perfPerDollar != null && item.metrics.perfPerDollar > 0 ? (
                      <span className="text-text-primary">{fmtNum(item.metrics.perfPerDollar, 0)}</span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary text-right">
                    {item.device.tdpWatts ? `${item.device.tdpWatts}W` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary text-right">
                    {item.latestPrice ? `$${item.latestPrice.priceUsd.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <CompletenessBar value={item.metrics.dataCompleteness} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/tablet cards */}
        <div className="lg:hidden divide-y divide-border-subtle/30">
          {devices.map(item => (
            <Link
              key={item.device.deviceId}
              to={`/device/${item.device.deviceId}`}
              className="block px-4 py-3 hover:bg-bg-tertiary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-brand-400">{item.device.modelName}</div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {item.vendor.name} &middot; {item.family.category}
                  </div>
                </div>
                <div className="text-right">
                  {item.latestPrice && (
                    <div className="text-sm text-text-primary">${item.latestPrice.priceUsd.toLocaleString()}</div>
                  )}
                  {item.device.tdpWatts && (
                    <div className="text-xs text-text-muted">{item.device.tdpWatts}W</div>
                  )}
                </div>
              </div>
              {/* Efficiency metrics row */}
              {(item.metrics.effectiveInt8Tops > 0 || item.metrics.topsPerDollar) && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {item.metrics.effectiveInt8Tops > 0 && (
                    <span className="text-xs text-brand-400">{fmtNum(item.metrics.effectiveInt8Tops)} TOPS</span>
                  )}
                  {item.metrics.topsPerDollar != null && item.metrics.topsPerDollar > 0 && (
                    <span className="text-xs text-green-400">{fmtNum(item.metrics.topsPerDollar)} TOPS/$</span>
                  )}
                  {item.metrics.topsPerWatt != null && item.metrics.topsPerWatt > 0 && (
                    <span className="text-xs text-blue-400">{fmtNum(item.metrics.topsPerWatt)} TOPS/W</span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>

        {devices.length === 0 && (
          <div className="px-4 py-12 text-center text-text-muted">
            No devices match your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-text-secondary">
            Showing {(filters.page - 1) * filters.pageSize + 1}-{Math.min(filters.page * filters.pageSize, total)} of {total}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
              disabled={filters.page <= 1}
              className="px-3 py-1.5 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-secondary disabled:opacity-30 hover:text-text-primary"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number
              if (totalPages <= 5) {
                page = i + 1
              } else if (filters.page <= 3) {
                page = i + 1
              } else if (filters.page >= totalPages - 2) {
                page = totalPages - 4 + i
              } else {
                page = filters.page - 2 + i
              }
              return (
                <button
                  key={page}
                  onClick={() => setFilters(f => ({ ...f, page }))}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    page === filters.page
                      ? 'bg-brand-600 text-text-primary'
                      : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            <button
              onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, f.page + 1) }))}
              disabled={filters.page >= totalPages}
              className="px-3 py-1.5 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-secondary disabled:opacity-30 hover:text-text-primary"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
