export type DeviceCategory =
  | 'CPU'
  | 'GPU'
  | 'SBC'
  | 'NPU'
  | 'ASIC'
  | 'SoC'
  | 'System'
  | 'Memory'
  | 'Storage'

export type WorkloadType =
  | 'cpu_single'
  | 'cpu_multi'
  | 'gpu_raster'
  | 'gpu_compute'
  | 'ai_inference'
  | 'ai_training'
  | 'memory'
  | 'storage'
  | 'efficiency'

export type SourceType =
  | 'benchmark'
  | 'vendor'
  | 'retailer'
  | 'community'
  | 'news'

export interface Vendor {
  vendorId: string
  name: string
  website: string
  country: string
  parentVendorId?: string
}

export interface DeviceFamily {
  familyId: string
  vendorId: string
  category: DeviceCategory
  subCategory?: string
  familyName: string
  architecture: string
  firstSeen: string
  status: 'active' | 'deprecated' | 'announced'
}

export interface DeviceVariant {
  deviceId: string
  familyId: string
  modelName: string
  sku?: string
  launchDate: string
  processNm?: number
  cores?: number
  threads?: number
  tdpWatts?: number
  maxPowerWatts?: number
  memoryType?: string
  memoryCapacityGB?: number
  memoryBandwidthGBps?: number
  formFactor?: string
  interface?: string
  notes?: string
}

export interface SourceRegistry {
  sourceId: string
  name: string
  baseUrl: string
  sourceType: SourceType
  refreshInterval?: string
  licenseNote?: string
  reliabilityWeight: number
  active: boolean
}

export interface BenchmarkType {
  benchmarkTypeId: string
  name: string
  category: WorkloadType
  unit: string
  weightHint: number
  normalizationMethod: string
}

export interface BenchmarkResult {
  resultId: string
  deviceId: string
  benchmarkTypeId: string
  sourceId: string
  rawScore: number
  normalizedScore?: number
  sampleSize?: number
  testConditions?: Record<string, unknown>
  confidence: number
  observedAt: string
}

export interface SpecSnapshot {
  snapshotId: string
  deviceId: string
  sourceId: string
  int8Tops?: number
  fp16Tflops?: number
  fp32Tflops?: number
  tdpWatts?: number
  idleWatts?: number
  boostWatts?: number
  memoryBwGBps?: number
  otherSpecs?: Record<string, unknown>
}

export interface PriceSnapshot {
  priceId: string
  deviceId: string
  sourceId: string
  priceUsd: number
  condition: 'new' | 'used' | 'msrp'
  region: string
  observedAt: string
}

export interface DerivedMetric {
  metricId: string
  deviceId: string
  metricName: string
  metricValue: number
  formulaVersion: string
  inputsJson: Record<string, number>
  confidence: number
  computedAt: string
}

export interface AliasMap {
  alias: string
  entityType: 'device' | 'family' | 'vendor'
  entityId: string
  sourceId?: string
  confidence: number
}

export interface DeviceWithDetails extends DeviceVariant {
  vendor: Vendor
  family: DeviceFamily
  benchmarks: BenchmarkResult[]
  specs: SpecSnapshot[]
  prices: PriceSnapshot[]
  metrics: DerivedMetric[]
  aliases: string[]
}

export interface FilterState {
  vendors: string[]
  categories: DeviceCategory[]
  architectures: string[]
  minTdp?: number
  maxTdp?: number
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  searchQuery: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  pageSize: number
}

export interface CompareSet {
  deviceIds: string[]
  selectedMetrics: string[]
}

export interface SavedView {
  id: string
  name: string
  filters: FilterState
  compareSet?: CompareSet
  createdAt: string
  updatedAt: string
}
