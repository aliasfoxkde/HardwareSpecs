import { describe, it, expect } from 'vitest'
import {
  vendors,
  devices,
  families,
  benchmarkTypes,
  benchmarks,
  specs,
  prices,
} from '@/lib/data/seed'
import {
  normalizeWithinBenchmark,
  computeCategoryScores,
  computePerfPerDollar,
  computePerfPerWatt,
  computeEffectiveInt8Tops,
  computeDataCompleteness,
} from '@/lib/normalization'

describe('Seed Data Integrity', () => {
  it('should have valid vendor references in all families', () => {
    const vendorIds = new Set(vendors.map(v => v.vendorId))
    for (const family of families) {
      expect(vendorIds.has(family.vendorId)).toBe(true)
    }
  })

  it('should have valid family references in all devices', () => {
    const familyIds = new Set(families.map(f => f.familyId))
    for (const device of devices) {
      expect(familyIds.has(device.familyId)).toBe(true)
    }
  })

  it('should have valid device references in all benchmarks', () => {
    const deviceIds = new Set(devices.map(d => d.deviceId))
    for (const bm of benchmarks) {
      expect(deviceIds.has(bm.deviceId)).toBe(true)
    }
  })

  it('should have valid device references in all specs', () => {
    const deviceIds = new Set(devices.map(d => d.deviceId))
    for (const spec of specs) {
      expect(deviceIds.has(spec.deviceId)).toBe(true)
    }
  })

  it('should have valid device references in all prices', () => {
    const deviceIds = new Set(devices.map(d => d.deviceId))
    for (const price of prices) {
      expect(deviceIds.has(price.deviceId)).toBe(true)
    }
  })

  it('should have valid benchmark type references in all benchmarks', () => {
    const btIds = new Set(benchmarkTypes.map(bt => bt.benchmarkTypeId))
    for (const bm of benchmarks) {
      expect(btIds.has(bm.benchmarkTypeId)).toBe(true)
    }
  })

  it('should have unique device IDs', () => {
    const ids = devices.map(d => d.deviceId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should have unique vendor IDs', () => {
    const ids = vendors.map(v => v.vendorId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should have at least 30 devices', () => {
    expect(devices.length).toBeGreaterThanOrEqual(30)
  })

  it('should have at least 10 vendors', () => {
    expect(vendors.length).toBeGreaterThanOrEqual(10)
  })
})

describe('Normalization Engine', () => {
  it('should normalize within benchmark to 0-1 range', () => {
    const results = normalizeWithinBenchmark(benchmarks, 'geekbench-6-single')
    expect(results.size).toBeGreaterThan(0)
    for (const [, score] of results) {
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    }
  })

  it('should handle single result with 0.5 score', () => {
    const singleResult = [benchmarks[0]]
    const results = normalizeWithinBenchmark(singleResult, singleResult[0].benchmarkTypeId)
    expect(results.get(singleResult[0].deviceId)).toBe(0.5)
  })

  it('should compute category scores for devices with benchmarks', () => {
    const deviceBenchmarks = new Map<string, typeof benchmarks>()
    for (const bm of benchmarks) {
      const existing = deviceBenchmarks.get(bm.deviceId) ?? []
      existing.push(bm)
      deviceBenchmarks.set(bm.deviceId, existing)
    }
    const scores = computeCategoryScores(deviceBenchmarks, benchmarkTypes)
    expect(scores.size).toBeGreaterThan(0)
    for (const [, catScores] of scores) {
      for (const [, score] of Object.entries(catScores)) {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(1)
      }
    }
  })

  it('should compute perf per dollar', () => {
    const scores = new Map<string, number>()
    scores.set(devices[0].deviceId, 0.8)
    const result = computePerfPerDollar(scores, prices)
    // At least some devices should have prices
    if (result.size > 0) {
      for (const [, value] of result) {
        expect(value).toBeGreaterThan(0)
      }
    }
  })

  it('should compute perf per watt for devices with TDP', () => {
    const scores = new Map<string, number>()
    const devicesWithTdp = devices.filter(d => d.tdpWatts && d.tdpWatts > 0)
    if (devicesWithTdp.length > 0) {
      scores.set(devicesWithTdp[0].deviceId, 0.8)
      const result = computePerfPerWatt(scores, devicesWithTdp)
      for (const [, value] of result) {
        expect(value).toBeGreaterThan(0)
      }
    }
  })

  it('should compute effective INT8 TOPS with modelled confidence', () => {
    const specsWithTops = specs.filter(s => s.int8Tops !== undefined && s.int8Tops > 0)
    if (specsWithTops.length > 0) {
      const result = computeEffectiveInt8Tops(specsWithTops)
      expect(result.size).toBeGreaterThan(0)
      for (const [, data] of result) {
        expect(data.value).toBeGreaterThan(0)
        expect(data.confidence).toBeGreaterThanOrEqual(0.5)
        expect(data.confidence).toBeLessThanOrEqual(1)
        expect(data.method).toBe('modelled')
      }
    }
  })

  it('should compute data completeness between 0 and 1', () => {
    for (const device of devices.slice(0, 5)) {
      const completeness = computeDataCompleteness(
        device,
        benchmarks.filter(b => b.deviceId === device.deviceId),
        specs.filter(s => s.deviceId === device.deviceId),
        prices.filter(p => p.deviceId === device.deviceId),
      )
      expect(completeness).toBeGreaterThanOrEqual(0)
      expect(completeness).toBeLessThanOrEqual(1)
    }
  })
})
