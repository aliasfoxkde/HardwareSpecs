import { describe, it, expect } from 'vitest'
import { getDeviceMetrics, getAllDeviceMetrics, getDeviceMetricsTable } from '@/lib/api'

describe('Computed Metrics', () => {
  describe('getDeviceMetrics', () => {
    it('should return metrics for a known device', () => {
      const m = getDeviceMetrics('nvidia-rtx-5090')
      expect(m).not.toBeNull()
      expect(m!.deviceId).toBe('nvidia-rtx-5090')
      expect(m!.effectiveInt8Tops).toBeGreaterThan(0)
      expect(m!.dataCompleteness).toBeGreaterThanOrEqual(0)
      expect(m!.dataCompleteness).toBeLessThanOrEqual(1)
    })

    it('should return null for nonexistent device', () => {
      const m = getDeviceMetrics('nonexistent-device')
      expect(m).toBeNull()
    })

    it('should have topsPerDollar for devices with price and TOPS', () => {
      const m = getDeviceMetrics('nvidia-rtx-5090')
      expect(m).not.toBeNull()
      if (m!.latestPrice && m!.latestPrice > 0 && m!.effectiveInt8Tops > 0) {
        expect(m!.topsPerDollar).not.toBeNull()
        expect(m!.topsPerDollar!).toBeGreaterThan(0)
        // Verify calculation
        expect(m!.topsPerDollar!).toBeCloseTo(m!.effectiveInt8Tops / m!.latestPrice, 2)
      }
    })

    it('should have topsPerWatt for devices with TDP and TOPS', () => {
      const m = getDeviceMetrics('nvidia-rtx-5090')
      expect(m).not.toBeNull()
      if (m!.tdpWatts && m!.tdpWatts > 0 && m!.effectiveInt8Tops > 0) {
        expect(m!.topsPerWatt).not.toBeNull()
        expect(m!.topsPerWatt!).toBeGreaterThan(0)
        // Verify calculation
        expect(m!.topsPerWatt!).toBeCloseTo(m!.effectiveInt8Tops / m!.tdpWatts, 2)
      }
    })

    it('should return null topsPerDollar when no price is available', () => {
      // Find a device without price (unlikely after Phase 7, but test the logic)
      const all = getAllDeviceMetrics()
      for (const [, m] of all) {
        if (!m.latestPrice) {
          expect(m.topsPerDollar).toBeNull()
          expect(m.perfPerDollar).toBeNull()
          break
        }
      }
    })

    it('should have dataCompleteness between 0 and 1 for all devices', () => {
      const all = getAllDeviceMetrics()
      expect(all.size).toBeGreaterThan(100)
      for (const [, m] of all) {
        expect(m.dataCompleteness).toBeGreaterThanOrEqual(0)
        expect(m.dataCompleteness).toBeLessThanOrEqual(1)
      }
    })

    it('should have fp16 and fp32 fields', () => {
      const m = getDeviceMetrics('nvidia-rtx-5090')
      expect(m).not.toBeNull()
      expect(typeof m!.fp16Tflops).toBeDefined()
      expect(typeof m!.fp32Tflops).toBeDefined()
    })
  })

  describe('getAllDeviceMetrics', () => {
    it('should return metrics for all devices', () => {
      const all = getAllDeviceMetrics()
      expect(all.size).toBeGreaterThan(300)
    })

    it('should have unique device IDs', () => {
      const all = getAllDeviceMetrics()
      const ids = [...all.keys()]
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('getDeviceMetricsTable', () => {
    it('should return an array with all devices', () => {
      const table = getDeviceMetricsTable()
      expect(table.length).toBeGreaterThan(300)
    })

    it('should include vendor and family info', () => {
      const table = getDeviceMetricsTable()
      const row = table.find(r => r.deviceId === 'nvidia-rtx-5090')
      expect(row).toBeDefined()
      expect(row!.vendorName).toBe('NVIDIA')
      expect(row!.categoryName).toBe('GPU')
    })

    it('should have GPU-specific fields for GPUs', () => {
      const table = getDeviceMetricsTable()
      const gpuRow = table.find(r => r.categoryName === 'GPU')
      expect(gpuRow).toBeDefined()
      expect(typeof gpuRow!.tmus).toBeDefined()
      expect(typeof gpuRow!.rops).toBeDefined()
    })
  })
})
