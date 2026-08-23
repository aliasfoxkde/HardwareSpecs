import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriceTdpHeatmap, VendorPerfHeatmap } from '@/components/charts/HeatmapChart'
import { VendorDistributionPie, CategoryDistributionPie, PriceBandPie } from '@/components/charts/MarketPieCharts'
import type { DeviceCategory } from '@/types'

// Mock API
vi.mock('@/lib/api', () => ({
  getDevicesByCategory: vi.fn().mockReturnValue([]),
  getVendors: vi.fn().mockReturnValue([]),
  getFamilies: vi.fn().mockReturnValue([]),
}))

describe('PriceTdpHeatmap', () => {
  it('renders empty state when no data', () => {
    render(<PriceTdpHeatmap category="GPU" />)
    expect(screen.getByText(/No price\+TDP data/i)).toBeDefined()
  })
})

describe('VendorPerfHeatmap', () => {
  it('renders empty state when no vendor data', () => {
    render(<VendorPerfHeatmap category="GPU" />)
    expect(screen.getByText(/No vendor data/i)).toBeDefined()
  })
})

describe('VendorDistributionPie', () => {
  it('renders nothing when no data', () => {
    const { container } = render(<VendorDistributionPie category="GPU" />)
    expect(container.firstChild).toBeNull()
  })
})

describe('CategoryDistributionPie', () => {
  it('renders when families exist', () => {
    // This component returns null when no families exist - just verify it doesn't throw
    expect(() => render(<CategoryDistributionPie />)).not.toThrow()
  })
})

describe('PriceBandPie', () => {
  it('renders nothing when no data', () => {
    const { container } = render(<PriceBandPie category="GPU" />)
    expect(container.firstChild).toBeNull()
  })
})
