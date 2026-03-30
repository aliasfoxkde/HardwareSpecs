import { describe, it, expect } from 'vitest'
import {
  computeDataCompleteness,
  computeEffectiveInt8Tops,
  computePerfPerDollar,
  computePerfPerWatt,
} from '@/lib/normalization'
import type { DeviceVariant, SpecSnapshot, PriceSnapshot } from '@/types'

const mockDevice: DeviceVariant = {
  deviceId: 'test-dev-1',
  familyId: 'test-family-1',
  modelName: 'Test Device',
  launchDate: '2024-01-01',
}

describe('Normalization edge cases', () => {
  it('computeDataCompleteness returns 0 for empty device with no data', () => {
    const result = computeDataCompleteness(mockDevice, [], [], [])
    expect(result).toBe(0)
  })

  it('computeDataCompleteness handles device with all core fields', () => {
    const fullDevice: DeviceVariant = {
      ...mockDevice,
      processNm: 5,
      cores: 8,
      threads: 16,
      tdpWatts: 65,
    }
    const result = computeDataCompleteness(fullDevice, [], [], [])
    expect(result).toBeGreaterThan(0)
  })

  it('computeEffectiveInt8Tops returns empty map for empty specs', () => {
    const result = computeEffectiveInt8Tops([])
    expect(result.size).toBe(0)
  })

  it('computeEffectiveInt8Tops skips specs with no int8Tops', () => {
    const spec: SpecSnapshot = {
      snapshotId: 'snap-1',
      deviceId: 'dev-1',
      sourceId: 'src-1',
      // int8Tops intentionally omitted
    }
    const result = computeEffectiveInt8Tops([spec])
    expect(result.size).toBe(0)
  })

  it('computeEffectiveInt8Tops computes value for valid spec', () => {
    const spec: SpecSnapshot = {
      snapshotId: 'snap-1',
      deviceId: 'dev-1',
      sourceId: 'src-1',
      int8Tops: 100,
    }
    const result = computeEffectiveInt8Tops([spec])
    expect(result.size).toBe(1)
    const entry = result.get('dev-1')!
    expect(entry.value).toBeGreaterThan(0)
    expect(entry.confidence).toBeGreaterThan(0)
    expect(entry.method).toBe('modelled')
  })

  it('computePerfPerDollar returns empty map for empty inputs', () => {
    const result = computePerfPerDollar(new Map(), [])
    expect(result.size).toBe(0)
  })

  it('computePerfPerDollar skips devices with no price', () => {
    const scores = new Map<string, number>([['dev-1', 0.8]])
    const result = computePerfPerDollar(scores, [])
    expect(result.size).toBe(0)
  })

  it('computePerfPerDollar computes value for device with price', () => {
    const scores = new Map<string, number>([['dev-1', 0.8]])
    const prices: PriceSnapshot[] = [
      {
        priceId: 'price-1',
        deviceId: 'dev-1',
        sourceId: 'src-1',
        priceUsd: 100,
        condition: 'new',
        region: 'US',
        observedAt: '2024-01-01',
      },
    ]
    const result = computePerfPerDollar(scores, prices)
    expect(result.size).toBe(1)
    expect(result.get('dev-1')).toBe(0.8 / 100)
  })

  it('computePerfPerWatt returns empty map for empty inputs', () => {
    const result = computePerfPerWatt(new Map(), [])
    expect(result.size).toBe(0)
  })

  it('computePerfPerWatt skips devices with no TDP', () => {
    const scores = new Map<string, number>([['dev-1', 0.8]])
    const result = computePerfPerWatt(scores, [{ ...mockDevice, deviceId: 'dev-1' }])
    expect(result.size).toBe(0)
  })

  it('computePerfPerWatt computes value for device with TDP', () => {
    const scores = new Map<string, number>([['dev-1', 0.8]])
    const devices: DeviceVariant[] = [{ ...mockDevice, deviceId: 'dev-1', tdpWatts: 65 }]
    const result = computePerfPerWatt(scores, devices)
    expect(result.size).toBe(1)
    expect(result.get('dev-1')).toBeCloseTo(0.8 / 65)
  })
})
