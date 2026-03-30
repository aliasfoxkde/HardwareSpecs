import { useState, useEffect, useMemo, useRef, memo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getDevices, getVendors, getFamilies } from '@/lib/api'
import { downloadCSV, downloadJSON } from '@/lib/export'
import { fmtNum, fmtRam } from '@/lib/utils'
import type { DeviceCategory, FilterState } from '@/types'

const CATEGORIES: DeviceCategory[] = ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System']

type SortKey = 'launchDate' | 'name' | 'tdp' | 'price' | 'tops' | 'topsPerDollar' | 'topsPerWatt' | 'perfPerDollar' | 'perfPerWatt' | 'dataCompleteness' | 'ram' | 'ramPerDollar'

const COLUMNS: { key: SortKey; label: string; align: 'left' | 'right'; className?: string }[] = [
  { key: 'name', label: 'Device', align: 'left' },
  { key: 'launchDate', label: 'Launch', align: 'right' },
  { key: 'ram', label: 'RAM', align: 'right' },
  { key: 'ramPerDollar', label: 'RAM/$', align: 'right', className: 'text-green-400' },
  { key: 'tops', label: 'INT8 TOPS', align: 'right', className: 'text-brand-400' },
  { key: 'topsPerDollar', label: 'TOPS/$', align: 'right', className: 'text-green-400' },
  { key: 'topsPerWatt', label: 'TOPS/W', align: 'right', className: 'text-blue-400' },
  { key: 'perfPerDollar', label: 'Perf/$', align: 'right' },
  { key: 'tdp', label: 'TDP', align: 'right' },
  { key: 'price', label: 'Price', align: 'right' },
  { key: 'dataCompleteness', label: 'Data', align: 'left' },
]

const CompletenessBar = memo(function CompletenessBar({ value }: { value: number }) {
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
})

function readFiltersFromUrl(sp: URLSearchParams): Partial<FilterState> {
  const f: Partial<FilterState> = {}
  const cat = sp.get('category')
  if (cat) f.categories = [cat as DeviceCategory]
  const vendor = sp.get('vendor')
  if (vendor) f.vendors = vendor.split(',')
  const q = sp.get('q')
  if (q) f.searchQuery = q
  const sort = sp.get('sort')
  if (sort) f.sortBy = sort
  const order = sp.get('order')
  if (order === 'asc' || order === 'desc') f.sortOrder = order
  const page = sp.get('page')
  if (page) f.page = Math.max(1, Number(page) || 1)
  const tdpMin = sp.get('tdpMin')
  if (tdpMin) f.minTdp = Number(tdpMin) || undefined
  const tdpMax = sp.get('tdpMax')
  if (tdpMax) f.maxTdp = Number(tdpMax) < 700 ? Number(tdpMax) : undefined
  const priceMin = sp.get('priceMin')
  if (priceMin) f.minPrice = Number(priceMin) || undefined
  const priceMax = sp.get('priceMax')
  if (priceMax) f.maxPrice = Number(priceMax) < 50000 ? Number(priceMax) : undefined
  return f
}

function writeFiltersToUrl(filters: FilterState): Record<string, string> {
  const p: Record<string, string> = {}
  if (filters.categories.length > 0) p.category = filters.categories[0]
  if (filters.vendors.length > 0) p.vendor = filters.vendors.join(',')
  if (filters.searchQuery) p.q = filters.searchQuery
  if (filters.sortBy !== 'launchDate') p.sort = filters.sortBy
  if (filters.sortOrder !== 'desc') p.order = filters.sortOrder
  if (filters.page > 1) p.page = String(filters.page)
  if (filters.minTdp && filters.minTdp > 0) p.tdpMin = String(filters.minTdp)
  if (filters.maxTdp && filters.maxTdp < 700) p.tdpMax = String(filters.maxTdp)
  if (filters.minPrice && filters.minPrice > 0) p.priceMin = String(filters.minPrice)
  if (filters.maxPrice && filters.maxPrice < 50000) p.priceMax = String(filters.maxPrice)
  return p
}

export function BrowsePage() {
  useEffect(() => { document.title = 'Browse Hardware | SiliconRank'; return () => { document.title = 'SiliconRank' } }, [])
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<FilterState>(() => ({
    vendors: [],
    categories: [],
    architectures: [],
    searchQuery: '',
    sortBy: 'launchDate',
    sortOrder: 'desc',
    page: 1,
    pageSize: 25,
    ...readFiltersFromUrl(searchParams),
  }))

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const vendors = useMemo(() => getVendors(), [])
  const families = useMemo(() => getFamilies(), [])
  const { devices, total } = useMemo(() => getDevices(filters), [filters])

  const totalPages = Math.ceil(total / filters.pageSize)

  // Sync filters to URL (replace to avoid history pollution)
  useEffect(() => {
    const params = writeFiltersToUrl(filters)
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  const handleSort = (key: SortKey) => {
    setFilters(f => ({
      ...f,
      sortBy: key,
      sortOrder: f.sortBy === key && f.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1,
    }))
  }

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

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (filters.sortBy !== col) return <span className="text-text-muted/40 ml-1">↕</span>
    return <span className="text-brand-400 ml-1">{filters.sortOrder === 'desc' ? '↓' : '↑'}</span>
  }

  const handleExportCSV = () => {
    const rows = devices.map(item => ({
      Device: item.device.modelName,
      Vendor: item.vendor.name,
      Category: item.family.category,
      Launch: item.device.launchDate,
      'RAM (GB)': item.device.memoryCapacityGB,
      'INT8 TOPS': item.metrics.effectiveInt8Tops || '',
      'TOPS/$': item.metrics.topsPerDollar || '',
      'TOPS/W': item.metrics.topsPerWatt || '',
      TDP: item.device.tdpWatts ? `${item.device.tdpWatts}W` : '',
      Price: item.latestPrice ? `$${item.latestPrice.priceUsd}` : '',
    }))
    downloadCSV(`siliconrank-${filters.categories.join('-') || 'all'}-${total}.csv`, rows)
  }

  const handleExportJSON = () => {
    const data = devices.map(item => ({
      device: item.device.modelName,
      vendor: item.vendor.name,
      category: item.family.category,
      launch: item.device.launchDate,
      ramGB: item.device.memoryCapacityGB,
      int8Tops: item.metrics.effectiveInt8Tops,
      topsPerDollar: item.metrics.topsPerDollar,
      topsPerWatt: item.metrics.topsPerWatt,
      tdpW: item.device.tdpWatts,
      priceUsd: item.latestPrice?.priceUsd,
    }))
    downloadJSON(`siliconrank-${filters.categories.join('-') || 'all'}-${total}.json`, data)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fade-in flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Header — fixed */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Browse Devices</h1>
          <p role="status" aria-live="polite" className="text-sm text-text-secondary">{total} devices found</p>
        </div>
      </div>

      {/* Filters — fixed */}
      <div className="mb-3 space-y-3 shrink-0">
        {/* Search */}
        <input
          type="text"
          aria-label="Search devices"
          placeholder="Search by name, vendor, or family..."
          value={filters.searchQuery}
          onChange={e => {
            const val = e.target.value
            setFilters(f => ({ ...f, searchQuery: val, page: 1 }))
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
            searchDebounceRef.current = setTimeout(() => {
              setFilters(f => ({ ...f, searchQuery: val, page: 1 }))
            }, 200)
          }}
          className="w-full px-4 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <div className="flex flex-wrap gap-4 items-center">
          {/* TDP Range Slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-secondary whitespace-nowrap">TDP</span>
            <input type="range" aria-label="Minimum TDP" aria-valuemin={0} aria-valuemax={700} min={0} max={700} step={5} value={filters.minTdp ?? 0}
              onChange={e => setFilters(f => ({ ...f, minTdp: Number(e.target.value) || undefined, page: 1 }))}
              className="w-20 h-1.5 accent-brand-500" />
            <span className="text-xs text-text-muted w-12 text-right">{filters.minTdp ?? 0}W</span>
            <span className="text-text-muted/40">–</span>
            <input type="range" aria-label="Maximum TDP" aria-valuemin={0} aria-valuemax={700} min={0} max={700} step={5} value={filters.maxTdp ?? 700}
              onChange={e => setFilters(f => ({ ...f, maxTdp: Number(e.target.value) < 700 ? Number(e.target.value) : undefined, page: 1 }))}
              className="w-20 h-1.5 accent-brand-500" />
            <span className="text-xs text-text-muted w-14 text-right">{filters.maxTdp ? `${filters.maxTdp}W` : '∞'}</span>
          </div>

          {/* Price Range Slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-secondary whitespace-nowrap">Price</span>
            <input type="range" aria-label="Minimum price" aria-valuemin={0} aria-valuemax={50000} min={0} max={50000} step={50} value={filters.minPrice ?? 0}
              onChange={e => setFilters(f => ({ ...f, minPrice: Number(e.target.value) || undefined, page: 1 }))}
              className="w-20 h-1.5 accent-green-500" />
            <span className="text-xs text-text-muted w-14 text-right">${(filters.minPrice ?? 0).toLocaleString()}</span>
            <span className="text-text-muted/40">–</span>
            <input type="range" aria-label="Maximum price" aria-valuemin={0} aria-valuemax={50000} min={0} max={50000} step={50} value={filters.maxPrice ?? 50000}
              onChange={e => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) < 50000 ? Number(e.target.value) : undefined, page: 1 }))}
              className="w-20 h-1.5 accent-green-500" />
            <span className="text-xs text-text-muted w-14 text-right">{filters.maxPrice ? `$${filters.maxPrice.toLocaleString()}` : '∞'}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Category filters */}
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              aria-pressed={filters.categories.includes(cat)}
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

          {/* Vendor filters */}
          {activeVendors.map(vendor => vendor && (
            <button
              key={vendor.vendorId}
              aria-pressed={filters.vendors.includes(vendor.vendorId)}
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

          {/* Active filter summary */}
          {(filters.categories.length > 0 || filters.vendors.length > 0 || filters.searchQuery) && (
            <button
              onClick={() => setFilters(f => ({ ...f, categories: [], vendors: [], searchQuery: '', page: 1 }))}
              className="text-sm text-brand-400 hover:text-brand-300"
            >
              Clear all filters
            </button>
          )}

          {/* Export buttons */}
          <div className="flex gap-1 ml-auto">
            <button
              aria-label="Export CSV"
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle transition-colors"
            >
              CSV
            </button>
            <button
              aria-label="Export JSON"
              onClick={handleExportJSON}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle transition-colors"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Table area — scrollable */}
      <div className="bg-bg-card/30 border border-border-subtle/50 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
        {/* Desktop table */}
        <div className="hidden lg:flex flex-col flex-1 min-h-0 overflow-auto">
          <table aria-label="Device list" className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border-subtle/50 bg-bg-secondary">
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    role="columnheader"
                    aria-sort={filters.sortBy === col.key ? (filters.sortOrder === 'desc' ? 'descending' : 'ascending') : 'none'}
                    onClick={() => handleSort(col.key)}
                    className={`px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-text-primary whitespace-nowrap transition-colors ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {col.label}
                      <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices.map(item => {
                const ram = item.device.memoryCapacityGB
                const price = item.latestPrice?.priceUsd
                const ramPerDollar = ram && price && price > 0 ? ram / price : null

                return (
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
                    <td className="px-4 py-3 text-sm text-text-secondary text-right whitespace-nowrap">
                      {item.device.launchDate || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary text-right whitespace-nowrap">
                      {fmtRam(ram)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                      {ramPerDollar != null && ramPerDollar > 0 ? (
                        <span className="text-green-400 font-medium">{ramPerDollar.toFixed(2)}</span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium whitespace-nowrap">
                      {item.metrics.effectiveInt8Tops > 0 ? (
                        <span className="text-brand-400">{fmtNum(item.metrics.effectiveInt8Tops)}</span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                      {item.metrics.topsPerDollar != null && item.metrics.topsPerDollar > 0 ? (
                        <span className="text-green-400 font-medium">{fmtNum(item.metrics.topsPerDollar)}</span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                      {item.metrics.topsPerWatt != null && item.metrics.topsPerWatt > 0 ? (
                        <span className="text-blue-400 font-medium">{fmtNum(item.metrics.topsPerWatt)}</span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                      {item.metrics.perfPerDollar != null && item.metrics.perfPerDollar > 0 ? (
                        <span className="text-text-primary">{fmtNum(item.metrics.perfPerDollar, 0)}</span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary text-right whitespace-nowrap">
                      {item.device.tdpWatts ? `${item.device.tdpWatts}W` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary text-right whitespace-nowrap">
                      {price ? `$${price.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <CompletenessBar value={item.metrics.dataCompleteness} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile/tablet cards */}
        <div className="lg:hidden divide-y divide-border-subtle/30 overflow-auto flex-1">
          {devices.map(item => {
            const ram = item.device.memoryCapacityGB
            const price = item.latestPrice?.priceUsd
            const ramPerDollar = ram && price && price > 0 ? ram / price : null

            return (
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
                      {item.device.launchDate && ` &middot; ${item.device.launchDate}`}
                    </div>
                  </div>
                  <div className="text-right">
                    {price && (
                      <div className="text-sm text-text-primary">${price.toLocaleString()}</div>
                    )}
                    {item.device.tdpWatts && (
                      <div className="text-xs text-text-muted">{item.device.tdpWatts}W</div>
                    )}
                  </div>
                </div>
                {/* Specs row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                  {ram && <span className="text-text-secondary">RAM: {fmtRam(ram)}</span>}
                  {ramPerDollar != null && ramPerDollar > 0 && (
                    <span className="text-green-400">{ramPerDollar.toFixed(2)} GB/$</span>
                  )}
                </div>
                {/* Efficiency metrics row */}
                {(item.metrics.effectiveInt8Tops > 0 || item.metrics.topsPerDollar) && (
                  <div className="flex flex-wrap gap-3 mt-1.5">
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
            )
          })}
        </div>

        {devices.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-text-muted text-lg mb-2">No devices match your current filters.</p>
            <p className="text-text-muted/60 text-sm mb-4">Try removing some filters or broadening your search.</p>
            <button
              onClick={() => setFilters(f => ({ ...f, categories: [], vendors: [], searchQuery: '', minTdp: undefined, maxTdp: undefined, minPrice: undefined, maxPrice: undefined, page: 1 }))}
              className="px-4 py-2 rounded-lg bg-brand-600 text-text-primary text-sm font-medium hover:bg-brand-500 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination — fixed at bottom */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle/30 shrink-0">
            <div className="text-sm text-text-secondary">
              Showing {(filters.page - 1) * filters.pageSize + 1}-{Math.min(filters.page * filters.pageSize, total)} of {total}
            </div>
            <div className="flex gap-1">
              <button
                aria-label="Previous page"
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
                    aria-label={`Page ${page}`}
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
                aria-label="Next page"
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
    </div>
  )
}
