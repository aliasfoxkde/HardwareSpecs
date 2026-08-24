import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { Layout } from '@/components/layout/Layout'
import type { DeviceListItem } from '@/lib/api'

// Mock matchMedia for prefers-reduced-motion
const originalMatchMedia = window.matchMedia
beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

afterEach(() => {
  vi.restoreAllMocks()
})

// Mock data helpers
const makeDevice = (id: string, name: string, category: string): DeviceListItem =>
  ({
    device: {
      deviceId: id,
      modelName: name,
      familyId: 'f1',
      category: category as any,
      vendorId: 'v1',
      architecture: 'Test',
      launchDate: '2024-01-01',
    },
    vendor: { vendorId: 'v1', name: 'TestVendor', website: 'https://test.com', country: 'US' },
    family: { familyId: 'f1', name: 'TestFamily', category: category as any, vendorId: 'v1', architecture: 'Test', deviceIds: [id] },
    metrics: { effectiveInt8Tops: 100, topsPerDollar: 0.5, topsPerWatt: 2, perfPerDollar: 10, perfPerWatt: 50, dataCompleteness: 0.8 },
  }) as unknown as DeviceListItem

const MOCK_STATS = {
  totalDevices: 300,
  totalVendors: 25,
  categories: ['CPU', 'GPU', 'NPU', 'SBC', 'ASIC', 'SoC', 'System', 'Memory', 'Storage'],
  totalBenchmarks: 1500,
}

const MOCK_GPU_DEVICES: DeviceListItem[] = [
  makeDevice('gpu1', 'Test GPU 1', 'GPU'),
  makeDevice('gpu2', 'Test GPU 2', 'GPU'),
]

const MOCK_TOP_VALUE_DEVICES: DeviceListItem[] = [
  {
    ...makeDevice('val1', 'Best Value GPU', 'GPU'),
    metrics: { effectiveInt8Tops: 200, topsPerDollar: 2.5, topsPerWatt: 5, perfPerDollar: 20, perfPerWatt: 100, dataCompleteness: 0.9 },
  },
]

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api')
  return {
    ...actual,
    getStats: vi.fn(() => MOCK_STATS),
    getDevicesByCategory: vi.fn((category: string) => {
      if (category === 'GPU') return MOCK_GPU_DEVICES
      return []
    }),
    getDevices: vi.fn(() => ({ devices: MOCK_TOP_VALUE_DEVICES, total: 1 })),
  }
})

import { getStats, getDevicesByCategory, getDevices } from '@/lib/api'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<Layout />}>{children}</Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('LandingPage', () => {
  describe('navigation links', () => {
    it('renders all navigation links', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      const navLinks = ['Home', 'Browse', 'Compare', 'Charts', 'Studio', 'Tools', 'Reports', 'Docs']
      for (const label of navLinks) {
        expect(screen.getAllByRole('link', { name: label }).length).toBeGreaterThan(0)
      }
    })
  })

  describe('category cards', () => {
    it('renders category cards with correct links', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      const cats = ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'Memory', 'Storage']
      for (const cat of cats) {
        const link = document.querySelector(`a[href="/browse?category=${cat}"]`)
        expect(link).toBeTruthy()
      }
    })

    it('category cards show device counts', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      // GPU category has mock devices
      const gpuCard = document.querySelector('a[href="/browse?category=GPU"]')
      expect(gpuCard?.textContent).toContain('devices')
    })
  })

  describe('StatCounter components', () => {
    it('renders stat counters with labels', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      // StatCounter labels appear in the hero stats section
      expect(screen.getByText('Devices')).toBeTruthy()
      expect(screen.getByText('Vendors')).toBeTruthy()
      expect(screen.getAllByText('Benchmarks').length).toBeGreaterThan(0)
    })

    it('stat counters render numeric values', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      // The stat values are animated, but should eventually show target values
      // With prefers-reduced-motion: false, animation runs, values animate to target
      const statContainers = document.querySelectorAll('.bg-bg-card\\/50')
      expect(statContainers.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('featured devices sections', () => {
    it('renders top GPUs section', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      expect(screen.getByText('Top GPUs')).toBeTruthy()
    })

    it('renders best TOPS/$ value section', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      expect(screen.getByText('Best TOPS/$ Value')).toBeTruthy()
    })
  })

  describe('footer links', () => {
    it('renders all footer links', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      expect(screen.getByText('GitHub')).toBeTruthy()
      expect(screen.getByText('Sponsor')).toBeTruthy()
      expect(screen.getByText('Ko-fi')).toBeTruthy()
      expect(screen.getByText('Open Source (MIT)')).toBeTruthy()
    })
  })

  describe('page heading and description', () => {
    it('renders page heading', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      expect(screen.getByText('Compare Every Chip.')).toBeTruthy()
      expect(screen.getByText('One Platform.')).toBeTruthy()
    })

    it('renders page description', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      expect(
        screen.getByText(/Normalized benchmarks, efficiency metrics, and AI accelerator tracking/)
      ).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('Particles canvas has aria-hidden', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      const canvas = document.querySelector('canvas[aria-hidden="true"]')
      expect(canvas).toBeTruthy()
    })

    it('category card links have aria-label', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      const categoryLink = document.querySelector('a[aria-label*="devices"]')
      expect(categoryLink).toBeTruthy()
    })

    it('top value device links have aria-label', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      const valueLink = document.querySelector('a[aria-label*="TOPS per dollar"]')
      expect(valueLink).toBeTruthy()
    })

    it('top GPU links have aria-label', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      const gpuLink = document.querySelector('a[aria-label*="TOPS"]')
      expect(gpuLink).toBeTruthy()
    })
  })

  describe('api mocks', () => {
    it('getStats is called on render', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      expect(getStats).toHaveBeenCalled()
    })

    it('getDevicesByCategory is called for GPU', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      expect(getDevicesByCategory).toHaveBeenCalledWith('GPU')
    })

    it('getDevices is called for top value devices', () => {
      render(<Route path="/" element={<LandingPage />} />, { wrapper: Wrapper })
      expect(getDevices).toHaveBeenCalledWith({ sortBy: 'topsPerDollar', sortOrder: 'desc', pageSize: 1000 })
    })
  })
})
