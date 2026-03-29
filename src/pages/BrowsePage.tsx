import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getDevices, getVendors, getFamilies } from '@/lib/api'
import type { DeviceCategory, FilterState } from '@/types'

const CATEGORIES: DeviceCategory[] = ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System']

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
          <h1 className="text-2xl font-bold text-white">Browse Devices</h1>
          <p className="text-sm text-slate-400">{total} devices found</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy}
            onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value, page: 1 }))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="launchDate">Launch Date</option>
            <option value="name">Name</option>
            <option value="tdp">TDP</option>
            <option value="price">Price</option>
          </select>
          <button
            onClick={() => setFilters(f => ({ ...f, sortOrder: f.sortOrder === 'asc' ? 'desc' : 'asc' }))}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white"
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
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filters.categories.includes(cat)
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
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
                  : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
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
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Device</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vendor</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">TDP</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Launch</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(item => (
                <tr
                  key={item.device.deviceId}
                  className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/device/${item.device.deviceId}`}
                      className="text-sm font-medium text-brand-400 hover:text-brand-300"
                    >
                      {item.device.modelName}
                    </Link>
                    {item.device.sku && (
                      <div className="text-xs text-slate-500">{item.device.sku}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-slate-700 text-slate-300">
                      {item.family.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{item.vendor.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-300 text-right">
                    {item.device.tdpWatts ? `${item.device.tdpWatts}W` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 text-right">
                    {item.latestPrice ? `$${item.latestPrice.priceUsd.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{item.device.launchDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-700/30">
          {devices.map(item => (
            <Link
              key={item.device.deviceId}
              to={`/device/${item.device.deviceId}`}
              className="block px-4 py-3 hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-brand-400">{item.device.modelName}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {item.vendor.name} &middot; {item.family.category}
                  </div>
                </div>
                <div className="text-right">
                  {item.latestPrice && (
                    <div className="text-sm text-white">${item.latestPrice.priceUsd.toLocaleString()}</div>
                  )}
                  {item.device.tdpWatts && (
                    <div className="text-xs text-slate-500">{item.device.tdpWatts}W</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {devices.length === 0 && (
          <div className="px-4 py-12 text-center text-slate-500">
            No devices match your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-400">
            Showing {(filters.page - 1) * filters.pageSize + 1}-{Math.min(filters.page * filters.pageSize, total)} of {total}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
              disabled={filters.page <= 1}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 disabled:opacity-30 hover:text-white"
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
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            <button
              onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, f.page + 1) }))}
              disabled={filters.page >= totalPages}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 disabled:opacity-30 hover:text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
