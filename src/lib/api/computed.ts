import { devices, benchmarks, specs, prices } from '@/lib/data/seed'
import { vendors as allVendors, families as allFamilies } from '@/lib/data/seed'
import { computeEffectiveInt8Tops, computeDataCompleteness } from '@/lib/normalization'

export interface DeviceMetrics {
  deviceId: string
  effectiveInt8Tops: number
  effectiveInt8TopsConfidence: number
  topsPerDollar: number | null
  topsPerWatt: number | null
  perfPerDollar: number | null
  perfPerWatt: number | null
  fp16Tflops: number | null
  fp32Tflops: number | null
  fp4Tflops: number | null
  fp8Tflops: number | null
  dataCompleteness: number
  latestPrice: number | null
  tdpWatts: number | null
  topBenchmarkScore: number | null
  topBenchmarkType: string | null
}

const familyMap = new Map(allFamilies.map(f => [f.familyId, f]))
const vendorMap = new Map(allVendors.map(v => [v.vendorId, v]))

function getLatestPrice(deviceId: string): number | null {
  const devicePrices = prices.filter(p => p.deviceId === deviceId)
  if (devicePrices.length === 0) return null
  // Prefer: new > msrp > used
  const priority = { new: 0, msrp: 1, used: 2 }
  devicePrices.sort((a, b) => (priority[a.condition] ?? 3) - (priority[b.condition] ?? 3))
  return devicePrices[0].priceUsd
}

function getTopBenchmark(deviceId: string): { score: number; type: string } | null {
  const deviceBenchmarks = benchmarks.filter(b => b.deviceId === deviceId)
  if (deviceBenchmarks.length === 0) return null
  return deviceBenchmarks.reduce((best, b) => b.rawScore > best.score ? { score: b.rawScore, type: b.benchmarkTypeId } : best, { score: deviceBenchmarks[0].rawScore, type: deviceBenchmarks[0].benchmarkTypeId })
}

export function getDeviceMetrics(deviceId: string): DeviceMetrics | null {
  const device = devices.find(d => d.deviceId === deviceId)
  if (!device) return null

  const deviceSpecs = specs.filter(s => s.deviceId === deviceId)
  const price = getLatestPrice(deviceId)
  const topBench = getTopBenchmark(deviceId)
  const int8Result = computeEffectiveInt8Tops([{ deviceId }], deviceSpecs, specs)
  const effective = int8Result.get(deviceId)
  const completeness = computeDataCompleteness(device, benchmarks.filter(b => b.deviceId === deviceId), deviceSpecs, prices.filter(p => p.deviceId === deviceId))

  const fp16Spec = deviceSpecs.find(s => s.fp16Tflops != null)
  const fp32Spec = deviceSpecs.find(s => s.fp32Tflops != null)
  const fp4Spec = deviceSpecs.find(s => s.fp4Tflops != null)
  const fp8Spec = deviceSpecs.find(s => s.fp8Tflops != null)
  const int8Spec = deviceSpecs.find(s => s.int8Tops != null)

  const effectiveTops = effective?.value ?? int8Spec?.int8Tops ?? 0

  return {
    deviceId,
    effectiveInt8Tops: effectiveTops,
    effectiveInt8TopsConfidence: effective?.confidence ?? 0.5,
    topsPerDollar: price && effectiveTops > 0 ? effectiveTops / price : null,
    topsPerWatt: device.tdpWatts && effectiveTops > 0 ? effectiveTops / device.tdpWatts : null,
    perfPerDollar: price && topBench ? topBench.score / price : null,
    perfPerWatt: device.tdpWatts && topBench ? topBench.score / device.tdpWatts : null,
    fp16Tflops: fp16Spec?.fp16Tflops ?? null,
    fp32Tflops: fp32Spec?.fp32Tflops ?? null,
    fp4Tflops: fp4Spec?.fp4Tflops ?? null,
    fp8Tflops: fp8Spec?.fp8Tflops ?? null,
    dataCompleteness: completeness,
    latestPrice: price,
    tdpWatts: device.tdpWatts ?? null,
    topBenchmarkScore: topBench?.score ?? null,
    topBenchmarkType: topBench?.type ?? null,
  }
}

export function getAllDeviceMetrics(): Map<string, DeviceMetrics> {
  const map = new Map<string, DeviceMetrics>()
  for (const device of devices) {
    const m = getDeviceMetrics(device.deviceId)
    if (m) map.set(device.deviceId, m)
  }
  return map
}

export interface DeviceMetricsRow extends DeviceMetrics {
  modelName: string
  vendorName: string
  vendorId: string
  categoryName: string
  familyName: string
  architecture: string
  launchDate: string
  processNm: number | null
  cores: number | null
  threads: number | null
  memoryCapacityGB: number | null
  memoryType: string | null
  memoryBandwidthGBps: number | null
  formFactor: string | null
  status: string
  // GPU-specific fields
  tmus: number | null
  rops: number | null
  tensorCores: number | null
  rtCores: number | null
  baseClockMhz: number | null
  boostClockMhz: number | null
  memoryBusWidth: string | null
}

export function getDeviceMetricsTable(): DeviceMetricsRow[] {
  const all = getAllDeviceMetrics()
  return devices.map(device => {
    const m = all.get(device.deviceId)
    const family = familyMap.get(device.familyId)
    const vendor = family ? vendorMap.get(family.vendorId) : null
    return {
      ...(m ?? {
        deviceId: device.deviceId,
        effectiveInt8Tops: 0,
        effectiveInt8TopsConfidence: 0,
        topsPerDollar: null,
        topsPerWatt: null,
        perfPerDollar: null,
        perfPerWatt: null,
        fp16Tflops: null,
        fp32Tflops: null,
        fp4Tflops: null,
        fp8Tflops: null,
        dataCompleteness: 0,
        latestPrice: null,
        tdpWatts: null,
        topBenchmarkScore: null,
        topBenchmarkType: null,
      }),
      modelName: device.modelName,
      vendorName: vendor?.name ?? 'Unknown',
      vendorId: vendor?.vendorId ?? '',
      categoryName: family?.category ?? 'Unknown',
      familyName: family?.familyName ?? 'Unknown',
      architecture: family?.architecture ?? '',
      launchDate: device.launchDate,
      processNm: device.processNm ?? null,
      cores: device.cores ?? null,
      threads: device.threads ?? null,
      memoryCapacityGB: device.memoryCapacityGB ?? null,
      memoryType: device.memoryType ?? null,
      memoryBandwidthGBps: device.memoryBandwidthGBps ?? null,
      formFactor: device.formFactor ?? null,
      status: family?.status ?? 'active',
      tmus: device.tmus ?? null,
      rops: device.rops ?? null,
      tensorCores: device.tensorCores ?? null,
      rtCores: device.rtCores ?? null,
      baseClockMhz: device.baseClockMhz ?? null,
      boostClockMhz: device.boostClockMhz ?? null,
      memoryBusWidth: device.memoryBusWidth ?? null,
    }
  })
}
