import { describe, it, expect } from 'vitest'
import {
  VENDOR_COLORS,
  getVendorColor,
  formatNumber,
  formatUsd,
  linearRegression,
  CHART_STYLES,
} from '@/components/charts/chartUtils'

describe('chartUtils', () => {
  describe('VENDOR_COLORS', () => {
    it('contains known vendors', () => {
      expect(VENDOR_COLORS['nvidia']).toBe('#76b900')
      expect(VENDOR_COLORS['amd']).toBe('#ed1c24')
      expect(VENDOR_COLORS['intel']).toBe('#0071c5')
    })
  })

  describe('getVendorColor', () => {
    it('returns known vendor color', () => {
      expect(getVendorColor('nvidia')).toBe('#76b900')
    })

    it('returns default color for unknown vendor', () => {
      expect(getVendorColor('unknown-vendor')).toBe('#3b82f6')
    })
  })

  describe('formatNumber', () => {
    it('returns dash for null/undefined', () => {
      expect(formatNumber(null)).toBe('-')
      expect(formatNumber(undefined)).toBe('-')
    })

    it('formats millions', () => {
      expect(formatNumber(1_500_000)).toBe('1.5M')
      expect(formatNumber(2_000_000, 0)).toBe('2M')
    })

    it('formats thousands', () => {
      expect(formatNumber(1_500)).toBe('1.5k')
      expect(formatNumber(2_000, 0)).toBe('2k')
    })

    it('formats integers with locale string', () => {
      expect(formatNumber(150, 0)).toBe('150')
    })

    it('formats decimals', () => {
      expect(formatNumber(1.234)).toBe('1.2')
      expect(formatNumber(1.234, 2)).toBe('1.23')
    })
  })

  describe('formatUsd', () => {
    it('formats thousands as $Xk', () => {
      expect(formatUsd(1500)).toBe('$1.5k')
      expect(formatUsd(2000)).toBe('$2.0k')
    })

    it('formats under 1000 as plain $X', () => {
      expect(formatUsd(500)).toBe('$500')
      expect(formatUsd(999)).toBe('$999')
    })
  })

  describe('linearRegression', () => {
    it('returns zero values for fewer than 2 points', () => {
      expect(linearRegression([])).toEqual({ slope: 0, intercept: 0, r2: 0 })
      expect(linearRegression([{ x: 1, y: 2 }])).toEqual({ slope: 0, intercept: 0, r2: 0 })
    })

    it('computes correct slope and intercept for linear data', () => {
      // y = 2x + 1
      const data = [
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 7 },
      ]
      const result = linearRegression(data)
      expect(result.slope).toBeCloseTo(2, 1)
      expect(result.intercept).toBeCloseTo(1, 1)
      expect(result.r2).toBeCloseTo(1, 2)
    })

    it('returns zero slope when denom is zero (all x values equal)', () => {
      const data = [
        { x: 1, y: 3 },
        { x: 1, y: 5 },
        { x: 1, y: 7 },
      ]
      const result = linearRegression(data)
      expect(result.slope).toBe(0)
      expect(result.r2).toBe(0)
    })

    it('handles constant y values (r2 = 0)', () => {
      const data = [
        { x: 1, y: 5 },
        { x: 2, y: 5 },
        { x: 3, y: 5 },
      ]
      const result = linearRegression(data)
      expect(result.r2).toBe(0)
    })
  })

  describe('CHART_STYLES', () => {
    it('contains expected CSS variable keys', () => {
      expect(CHART_STYLES.gridStroke).toBeDefined()
      expect(CHART_STYLES.axisTick).toBeDefined()
      expect(CHART_STYLES.tooltipBg).toBeDefined()
      expect(CHART_STYLES.tooltipBorder).toBeDefined()
      expect(CHART_STYLES.tooltipText).toBeDefined()
    })
  })
})
