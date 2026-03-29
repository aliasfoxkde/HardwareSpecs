import { describe, it, expect } from 'vitest'
import {
  getDevices,
  getDevice,
  searchDevices,
  compareDevices,
  getVendors,
  getFamilies,
  getStats,
  getDevicesByCategory,
} from '@/lib/api'

describe('API Layer', () => {
  describe('getVendors', () => {
    it('should return all vendors', () => {
      const vendors = getVendors()
      expect(vendors.length).toBeGreaterThanOrEqual(10)
      expect(vendors.every(v => v.vendorId && v.name)).toBe(true)
    })
  })

  describe('getFamilies', () => {
    it('should return all families', () => {
      const families = getFamilies()
      expect(families.length).toBeGreaterThan(20)
    })

    it('should filter by vendor', () => {
      const families = getFamilies({ vendorId: 'nvidia' })
      expect(families.every(f => f.vendorId === 'nvidia')).toBe(true)
    })

    it('should filter by category', () => {
      const families = getFamilies({ category: 'GPU' })
      expect(families.every(f => f.category === 'GPU')).toBe(true)
    })
  })

  describe('getDevices', () => {
    it('should return paginated devices', () => {
      const { devices, total } = getDevices({ page: 1, pageSize: 10 })
      expect(devices.length).toBeLessThanOrEqual(10)
      expect(total).toBeGreaterThan(30)
    })

    it('should filter by category', () => {
      const { devices, total } = getDevices({ categories: ['GPU'] })
      expect(total).toBeGreaterThan(0)
      expect(devices.every(d => d.family.category === 'GPU')).toBe(true)
    })

    it('should filter by search query', () => {
      const { total } = getDevices({ searchQuery: 'nvidia' })
      expect(total).toBeGreaterThan(0)
    })

    it('should sort by name ascending', () => {
      const { devices } = getDevices({ sortBy: 'name', sortOrder: 'asc', pageSize: 100 })
      for (let i = 1; i < devices.length; i++) {
        expect(devices[i].device.modelName.localeCompare(devices[i - 1].device.modelName)).toBeGreaterThanOrEqual(0)
      }
    })

    it('should paginate correctly', () => {
      const page1 = getDevices({ page: 1, pageSize: 5 })
      const page2 = getDevices({ page: 2, pageSize: 5 })
      expect(page1.devices.length).toBe(5)
      expect(page2.devices.length).toBe(5)
      expect(page1.devices[0].device.deviceId).not.toBe(page2.devices[0].device.deviceId)
    })
  })

  describe('getDevice', () => {
    it('should return a device detail with all relations', () => {
      const device = getDevice('nvidia-rtx-5090')
      expect(device).toBeDefined()
      expect(device!.vendor.name).toBe('NVIDIA')
      expect(device!.family.category).toBe('GPU')
      expect(device!.device.modelName).toContain('RTX 5090')
    })

    it('should return undefined for non-existent device', () => {
      const device = getDevice('nonexistent-device')
      expect(device).toBeUndefined()
    })
  })

  describe('searchDevices', () => {
    it('should find devices by partial name', () => {
      const results = searchDevices('ryzen')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(d => d.device.modelName.toLowerCase().includes('ryzen'))).toBe(true)
    })

    it('should return empty for no matches', () => {
      const results = searchDevices('zzzznonexistent')
      expect(results.length).toBe(0)
    })
  })

  describe('compareDevices', () => {
    it('should return device details for comparison', () => {
      const result = compareDevices(['nvidia-rtx-5090', 'amd-rx-9070-xt'])
      expect(result.length).toBe(2)
      expect(result.every(d => d.benchmarks !== undefined)).toBe(true)
    })
  })

  describe('getStats', () => {
    it('should return aggregate statistics', () => {
      const stats = getStats()
      expect(stats.totalDevices).toBeGreaterThan(30)
      expect(stats.totalVendors).toBeGreaterThan(10)
      expect(stats.categories.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('getDevicesByCategory', () => {
    it('should return only devices of the specified category', () => {
      const gpus = getDevicesByCategory('GPU')
      expect(gpus.length).toBeGreaterThan(5)
      expect(gpus.every(d => d.family.category === 'GPU')).toBe(true)
    })
  })
})
