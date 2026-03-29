import type {
  DeviceVariant,
  Vendor,
  DeviceFamily,
  BenchmarkResult,
  SpecSnapshot,
  PriceSnapshot,
  SourceRegistry,
  BenchmarkType,
  DeviceCategory,
  FilterState,
} from '@/types'
import {
  vendors as seedVendors,
  families as seedFamilies,
  devices as seedDevices,
  sources as seedSources,
  benchmarkTypes as seedBenchmarkTypes,
  benchmarks as seedBenchmarks,
  specs as seedSpecs,
  prices as seedPrices,
} from '@/lib/data/seed'
import { getDeviceMetrics } from './computed'

// In-memory data store (populated from seed data)
let vendorData = [...seedVendors]
let familyData = [...seedFamilies]
let deviceData = [...seedDevices]
let sourceData = [...seedSources]
let benchmarkTypeData = [...seedBenchmarkTypes]
let benchmarkData = [...seedBenchmarks]
let specData = [...seedSpecs]
let priceData = [...seedPrices]

// Lookup maps
const vendorMap = new Map(vendorData.map(v => [v.vendorId, v]))
const familyMap = new Map(familyData.map(f => [f.familyId, f]))

function getDeviceBenchmarks(deviceId: string) {
  return benchmarkData.filter(b => b.deviceId === deviceId)
}

function getDeviceSpecs(deviceId: string) {
  return specData.filter(s => s.deviceId === deviceId)
}

function getDevicePrices(deviceId: string) {
  return priceData.filter(p => p.deviceId === deviceId)
}

function getLatestPrice(deviceId: string) {
  const devicePrices = getDevicePrices(deviceId)
  if (devicePrices.length === 0) return undefined
  return devicePrices.sort((a, b) =>
    new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime()
  )[0]
}

export interface DeviceListItem {
  device: DeviceVariant
  vendor: Vendor
  family: DeviceFamily
  latestPrice?: PriceSnapshot
  topBenchmark?: BenchmarkResult
  metrics: {
    effectiveInt8Tops: number
    topsPerDollar: number | null
    topsPerWatt: number | null
    perfPerDollar: number | null
    perfPerWatt: number | null
    dataCompleteness: number
  }
}

export interface DeviceDetail extends DeviceListItem {
  benchmarks: BenchmarkResult[]
  specs: SpecSnapshot[]
  prices: PriceSnapshot[]
}

// --- API Functions ---

export function getVendors(): Vendor[] {
  return vendorData
}

export function getVendor(vendorId: string): Vendor | undefined {
  return vendorMap.get(vendorId)
}

export function getFamilies(options?: { vendorId?: string; category?: DeviceCategory }): DeviceFamily[] {
  let result = familyData
  if (options?.vendorId) result = result.filter(f => f.vendorId === options.vendorId)
  if (options?.category) result = result.filter(f => f.category === options.category)
  return result
}

export function getFamily(familyId: string): DeviceFamily | undefined {
  return familyMap.get(familyId)
}

export function getDevices(options?: Partial<FilterState>): { devices: DeviceListItem[]; total: number } {
  let result = deviceData

  // Apply filters
  if (options?.vendors?.length) {
    const familyIds = new Set(
      familyData.filter(f => options.vendors!.includes(f.vendorId)).map(f => f.familyId)
    )
    result = result.filter(d => familyIds.has(d.familyId))
  }

  if (options?.categories?.length) {
    const familyIds = new Set(
      familyData.filter(f => options.categories!.includes(f.category)).map(f => f.familyId)
    )
    result = result.filter(d => familyIds.has(d.familyId))
  }

  if (options?.minTdp) {
    result = result.filter(d => (d.tdpWatts ?? Infinity) >= options.minTdp!)
  }

  if (options?.maxTdp) {
    result = result.filter(d => (d.tdpWatts ?? 0) <= options.maxTdp!)
  }

  if (options?.searchQuery) {
    const q = options.searchQuery.toLowerCase()
    result = result.filter(d => {
      const vendor = vendorMap.get(familyMap.get(d.familyId)?.vendorId ?? '')
      return (
        d.modelName.toLowerCase().includes(q) ||
        d.sku?.toLowerCase().includes(q) ||
        vendor?.name.toLowerCase().includes(q) ||
        familyMap.get(d.familyId)?.familyName.toLowerCase().includes(q)
      )
    })
  }

  const total = result.length

  // Sort
  const sortBy = options?.sortBy ?? 'launchDate'
  const sortOrder = options?.sortOrder ?? 'desc'

  result.sort((a, b) => {
    let valA: string | number = ''
    let valB: string | number = ''

    switch (sortBy) {
      case 'name':
        valA = a.modelName
        valB = b.modelName
        break
      case 'launchDate':
        valA = a.launchDate
        valB = b.launchDate
        break
      case 'tdp':
        valA = a.tdpWatts ?? Infinity
        valB = b.tdpWatts ?? Infinity
        break
      case 'price':
        valA = getLatestPrice(a.deviceId)?.priceUsd ?? Infinity
        valB = getLatestPrice(b.deviceId)?.priceUsd ?? Infinity
        break
      case 'tops':
        valA = getDeviceMetrics(a.deviceId)?.effectiveInt8Tops ?? 0
        valB = getDeviceMetrics(b.deviceId)?.effectiveInt8Tops ?? 0
        break
      case 'topsPerDollar':
        valA = getDeviceMetrics(a.deviceId)?.topsPerDollar ?? 0
        valB = getDeviceMetrics(b.deviceId)?.topsPerDollar ?? 0
        break
      case 'topsPerWatt':
        valA = getDeviceMetrics(a.deviceId)?.topsPerWatt ?? 0
        valB = getDeviceMetrics(b.deviceId)?.topsPerWatt ?? 0
        break
      case 'perfPerDollar':
        valA = getDeviceMetrics(a.deviceId)?.perfPerDollar ?? 0
        valB = getDeviceMetrics(b.deviceId)?.perfPerDollar ?? 0
        break
      case 'perfPerWatt':
        valA = getDeviceMetrics(a.deviceId)?.perfPerWatt ?? 0
        valB = getDeviceMetrics(b.deviceId)?.perfPerWatt ?? 0
        break
      case 'dataCompleteness':
        valA = getDeviceMetrics(a.deviceId)?.dataCompleteness ?? 0
        valB = getDeviceMetrics(b.deviceId)?.dataCompleteness ?? 0
        break
      default:
        valA = a.launchDate
        valB = b.launchDate
    }

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }
    return sortOrder === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA)
  })

  // Pagination
  const page = options?.page ?? 1
  const pageSize = options?.pageSize ?? 25
  const start = (page - 1) * pageSize
  const paginatedResult = result.slice(start, start + pageSize)

  const devices: DeviceListItem[] = paginatedResult.map(d => {
    const m = getDeviceMetrics(d.deviceId)
    return {
      device: d,
      vendor: vendorMap.get(familyMap.get(d.familyId)?.vendorId ?? '')!,
      family: familyMap.get(d.familyId)!,
      latestPrice: getLatestPrice(d.deviceId),
      topBenchmark: getDeviceBenchmarks(d.deviceId).sort((a, b) => b.normalizedScore! - a.normalizedScore!)[0],
      metrics: {
        effectiveInt8Tops: m?.effectiveInt8Tops ?? 0,
        topsPerDollar: m?.topsPerDollar ?? null,
        topsPerWatt: m?.topsPerWatt ?? null,
        perfPerDollar: m?.perfPerDollar ?? null,
        perfPerWatt: m?.perfPerWatt ?? null,
        dataCompleteness: m?.dataCompleteness ?? 0,
      },
    }
  })

  return { devices, total }
}

export function getDevice(deviceId: string): DeviceDetail | undefined {
  const device = deviceData.find(d => d.deviceId === deviceId)
  if (!device) return undefined

  const family = familyMap.get(device.familyId)
  const vendor = family ? vendorMap.get(family.vendorId) : undefined

  if (!family || !vendor) return undefined

  const m = getDeviceMetrics(deviceId)

  return {
    device,
    vendor,
    family,
    latestPrice: getLatestPrice(deviceId),
    topBenchmark: getDeviceBenchmarks(deviceId).sort((a, b) => b.normalizedScore! - a.normalizedScore!)[0],
    benchmarks: getDeviceBenchmarks(deviceId),
    specs: getDeviceSpecs(deviceId),
    prices: getDevicePrices(deviceId),
    metrics: {
      effectiveInt8Tops: m?.effectiveInt8Tops ?? 0,
      topsPerDollar: m?.topsPerDollar ?? null,
      topsPerWatt: m?.topsPerWatt ?? null,
      perfPerDollar: m?.perfPerDollar ?? null,
      perfPerWatt: m?.perfPerWatt ?? null,
      dataCompleteness: m?.dataCompleteness ?? 0,
    },
  }
}

export function searchDevices(query: string, limit = 20): DeviceListItem[] {
  const q = query.toLowerCase()
  return deviceData
    .filter(d => {
      const vendor = vendorMap.get(familyMap.get(d.familyId)?.vendorId ?? '')
      return (
        d.modelName.toLowerCase().includes(q) ||
        d.sku?.toLowerCase().includes(q) ||
        vendor?.name.toLowerCase().includes(q) ||
        familyMap.get(d.familyId)?.familyName.toLowerCase().includes(q)
      )
    })
    .slice(0, limit)
    .map(d => {
      const m = getDeviceMetrics(d.deviceId)
      return {
        device: d,
        vendor: vendorMap.get(familyMap.get(d.familyId)?.vendorId ?? '')!,
        family: familyMap.get(d.familyId)!,
        latestPrice: getLatestPrice(d.deviceId),
        metrics: {
          effectiveInt8Tops: m?.effectiveInt8Tops ?? 0,
          topsPerDollar: m?.topsPerDollar ?? null,
          topsPerWatt: m?.topsPerWatt ?? null,
          perfPerDollar: m?.perfPerDollar ?? null,
          perfPerWatt: m?.perfPerWatt ?? null,
          dataCompleteness: m?.dataCompleteness ?? 0,
        },
      }
    })
}

export function compareDevices(deviceIds: string[]): DeviceDetail[] {
  return deviceIds
    .map(id => getDevice(id))
    .filter((d): d is DeviceDetail => d !== undefined)
}

export function getSources(): SourceRegistry[] {
  return sourceData
}

export function getBenchmarkTypes(): BenchmarkType[] {
  return benchmarkTypeData
}

export function getStats() {
  const categories = new Set(familyData.map(f => f.category))
  return {
    totalDevices: deviceData.length,
    totalVendors: vendorData.length,
    totalFamilies: familyData.length,
    categories: [...categories],
    totalBenchmarks: benchmarkData.length,
    totalSources: sourceData.length,
  }
}

export { getDeviceMetrics, getAllDeviceMetrics, getDeviceMetricsTable } from './computed'
export type { DeviceMetrics, DeviceMetricsRow } from './computed'

export function getDevicesByCategory(category: DeviceCategory): DeviceListItem[] {
  const familyIds = new Set(
    familyData.filter(f => f.category === category).map(f => f.familyId)
  )
  return deviceData
    .filter(d => familyIds.has(d.familyId))
    .map(d => {
      const m = getDeviceMetrics(d.deviceId)
      return {
        device: d,
        vendor: vendorMap.get(familyMap.get(d.familyId)?.vendorId ?? '')!,
        family: familyMap.get(d.familyId)!,
        latestPrice: getLatestPrice(d.deviceId),
        metrics: {
          effectiveInt8Tops: m?.effectiveInt8Tops ?? 0,
          topsPerDollar: m?.topsPerDollar ?? null,
          topsPerWatt: m?.topsPerWatt ?? null,
          perfPerDollar: m?.perfPerDollar ?? null,
          perfPerWatt: m?.perfPerWatt ?? null,
          dataCompleteness: m?.dataCompleteness ?? 0,
        },
      }
    })
}
