import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { DevicePage } from '@/pages/DevicePage'
import type { DeviceDetail } from '@/lib/api'
import type { DeviceMetrics } from '@/lib/api/computed'

const originalMatchMedia = window.matchMedia

beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

afterAll(() => {
  window.matchMedia = originalMatchMedia
})

// Mock recharts to avoid SVG rendering issues in tests
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}))

const mockMetrics: DeviceMetrics = {
  deviceId: 'nvidia-rtx-5090',
  effectiveInt8Tops: 2500,
  effectiveInt8TopsConfidence: 0.95,
  topsPerDollar: 2.5,
  topsPerWatt: 8.3,
  perfPerDollar: 1200,
  perfPerWatt: 4100,
  fp16Tflops: 5.0,
  fp32Tflops: 2.5,
  fp4Tflops: 10.0,
  fp8Tflops: 7.5,
  dataCompleteness: 0.85,
  latestPrice: 1999,
  tdpWatts: 450,
  topBenchmarkScore: 24500,
  topBenchmarkType: 'ai-perf',
}

const mockDeviceDetail: DeviceDetail = {
  device: {
    deviceId: 'nvidia-rtx-5090',
    familyId: 'nvidia-blackwell',
    modelName: 'NVIDIA GeForce RTX 5090',
    sku: 'RTX 5090',
    launchDate: '2025-01-06',
    processNm: 3,
    cores: 21760,
    threads: 21760,
    tdpWatts: 450,
    maxPowerWatts: 575,
    memoryType: 'GDDR7',
    memoryCapacityGB: 32,
    memoryBandwidthGBps: 1792,
    formFactor: 'PCIe',
    interface: 'PCIe 5.0 x16',
    referenceUrl: 'https://www.nvidia.com/rtx5090',
    purchaseUrl: 'https://www.nvidia.com/buy',
  },
  vendor: {
    vendorId: 'nvidia',
    name: 'NVIDIA',
    website: 'https://www.nvidia.com',
    country: 'USA',
  },
  family: {
    familyId: 'nvidia-blackwell',
    vendorId: 'nvidia',
    category: 'GPU',
    subCategory: 'Discrete GPU',
    familyName: 'Blackwell',
    architecture: 'Blackwell',
    firstSeen: '2025-01-01',
    status: 'active',
  },
  latestPrice: {
    priceId: 'price-1',
    deviceId: 'nvidia-rtx-5090',
    sourceId: 'nvidia-com',
    priceUsd: 1999,
    condition: 'msrp',
    region: 'US',
    observedAt: '2025-03-15',
  },
  topBenchmark: {
    resultId: 'result-1',
    deviceId: 'nvidia-rtx-5090',
    benchmarkTypeId: 'ai-perf',
    sourceId: 'nvidia-com',
    rawScore: 24500,
    normalizedScore: 0.98,
    confidence: 0.9,
    observedAt: '2025-02-01',
  },
  benchmarks: [
    {
      resultId: 'result-1',
      deviceId: 'nvidia-rtx-5090',
      benchmarkTypeId: 'ai-perf',
      sourceId: 'nvidia-com',
      rawScore: 24500,
      normalizedScore: 0.98,
      confidence: 0.9,
      observedAt: '2025-02-01',
    },
    {
      resultId: 'result-2',
      deviceId: 'nvidia-rtx-5090',
      benchmarkTypeId: 'standard-perf',
      sourceId: 'techpowerup',
      rawScore: 18200,
      normalizedScore: 0.92,
      confidence: 0.85,
      observedAt: '2025-02-15',
    },
  ],
  specs: [
    {
      snapshotId: 'spec-1',
      deviceId: 'nvidia-rtx-5090',
      sourceId: 'nvidia-com',
      int8Tops: 2500,
      fp16Tflops: 5.0,
      fp32Tflops: 2.5,
      fp4Tflops: 10.0,
      fp8Tflops: 7.5,
    },
  ],
  prices: [
    {
      priceId: 'price-1',
      deviceId: 'nvidia-rtx-5090',
      sourceId: 'nvidia-com',
      priceUsd: 1999,
      condition: 'msrp',
      region: 'US',
      observedAt: '2025-03-15',
    },
    {
      priceId: 'price-2',
      deviceId: 'nvidia-rtx-5090',
      sourceId: 'newegg',
      priceUsd: 2199,
      condition: 'new',
      region: 'US',
      observedAt: '2025-03-10',
    },
  ],
  metrics: {
    effectiveInt8Tops: 2500,
    topsPerDollar: 2.5,
    topsPerWatt: 8.3,
    perfPerDollar: 1200,
    perfPerWatt: 4100,
    dataCompleteness: 0.85,
  },
}

const mockSimilarDevices = [
  {
    device: {
      deviceId: 'nvidia-rtx-5080',
      familyId: 'nvidia-blackwell',
      modelName: 'NVIDIA GeForce RTX 5080',
      launchDate: '2025-01-06',
    },
    vendor: { vendorId: 'nvidia', name: 'NVIDIA', website: 'https://www.nvidia.com', country: 'USA' },
    family: {
      familyId: 'nvidia-blackwell',
      vendorId: 'nvidia',
      category: 'GPU' as const,
      familyName: 'Blackwell',
      architecture: 'Blackwell',
      firstSeen: '2025-01-01',
      status: 'active' as const,
    },
    latestPrice: { priceId: 'p2', deviceId: 'nvidia-rtx-5080', sourceId: 'nvidia', priceUsd: 999, condition: 'msrp', region: 'US', observedAt: '2025-03-01' },
    metrics: { effectiveInt8Tops: 1500, topsPerDollar: 1.5, topsPerWatt: 5.0, perfPerDollar: 800, perfPerWatt: 3000, dataCompleteness: 0.8 },
  },
]

// Mock modules
vi.mock('@/lib/api', async importActual => {
  const actual = await importActual<typeof import('@/lib/api')>()
  return {
    ...actual,
    getDevice: vi.fn((deviceId: string) => {
      if (deviceId === 'nvidia-rtx-5090') return mockDeviceDetail
      return undefined
    }),
    getDeviceMetrics: vi.fn((deviceId: string) => {
      if (deviceId === 'nvidia-rtx-5090') return mockMetrics
      return null
    }),
    getDevicesByCategory: vi.fn(() => mockSimilarDevices),
  }
})

function Wrapper({ children, deviceId = 'nvidia-rtx-5090' }: { children: React.ReactNode; deviceId?: string }) {
  return (
    <MemoryRouter initialEntries={[`/device/${deviceId}`]}>
      <Routes>
        <Route path="/device/:deviceId" element={children} />
      </Routes>
    </MemoryRouter>
  )
}

describe('DevicePage', () => {
  describe('renders device name and details', () => {
    it('renders the device model name as heading', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByRole('heading', { name: 'NVIDIA GeForce RTX 5090' })).toBeTruthy()
    })

    it('renders vendor name', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      // Vendor appears in header and sidebar - use first match
      expect(screen.getAllByText('NVIDIA').length).toBeGreaterThan(0)
    })

    it('renders device category badge', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      // GPU appears in breadcrumb category badge
      const gpuBadge = document.querySelector('span.text-xs.font-medium.rounded.bg-brand-600\\/20.text-brand-400')
      expect(gpuBadge?.textContent).toBe('GPU')
    })

    it('renders family name', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('Blackwell')).toBeTruthy()
    })

    it('renders architecture info', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText(/Architecture: Blackwell/)).toBeTruthy()
    })

    it('renders launch date', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText(/Launched 2025-01-06/)).toBeTruthy()
    })

    it('renders breadcrumb with device name', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      // Device name in breadcrumb (last span in breadcrumb nav)
      const breadcrumbNav = document.querySelector('nav[aria-label="Breadcrumb"]')
      const lastSpan = breadcrumbNav?.querySelector('span:last-child')
      expect(lastSpan?.textContent).toBe('NVIDIA GeForce RTX 5090')
    })
  })

  describe('renders specs section', () => {
    it('renders Specifications heading', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByRole('heading', { name: 'Specifications' })).toBeTruthy()
    })

    it('renders cores and threads', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      // Cores/threads appears in the spec table row for "Cores / Threads"
      const coresRow = document.querySelector('[aria-label="Device specifications"]')
      expect(coresRow?.textContent).toContain('21760C / 21760T')
    })

    it('renders process node', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('3nm')).toBeTruthy()
    })

    it('renders TDP', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('450W')).toBeTruthy()
    })

    it('renders memory capacity and type', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('32GB GDDR7')).toBeTruthy()
    })

    it('renders memory bandwidth', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('1792 GB/s')).toBeTruthy()
    })

    it('renders form factor', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('PCIe')).toBeTruthy()
    })

    it('renders interface', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('PCIe 5.0 x16')).toBeTruthy()
    })

    it('renders max power', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('575W')).toBeTruthy()
    })
  })

  describe('renders benchmarks section', () => {
    it('renders Benchmarks heading', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByRole('heading', { name: 'Benchmarks' })).toBeTruthy()
    })

    it('renders benchmark scores', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('24,500')).toBeTruthy()
      expect(screen.getByText('18,200')).toBeTruthy()
    })

    it('renders benchmark source and date', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText(/Source: nvidia-com/)).toBeTruthy()
      expect(screen.getByText(/Source: techpowerup/)).toBeTruthy()
    })

    it('renders normalized scores', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText(/Normalized: 98\.0%/)).toBeTruthy()
      expect(screen.getByText(/Normalized: 92\.0%/)).toBeTruthy()
    })
  })

  describe('renders prices section', () => {
    it('renders price history heading', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('Price History')).toBeTruthy()
    })

    it('renders MSRP price', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      // MSRP shown in header price section
      const msrpPrice = document.querySelector('div.text-2xl.font-bold.text-text-primary')
      expect(msrpPrice?.textContent).toBe('$1,999')
    })

    it('renders price condition labels', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText(/MSRP/)).toBeTruthy()
      expect(screen.getByText(/new/)).toBeTruthy()
    })

    it('renders price region', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getAllByText(/US/).length).toBeGreaterThan(0)
    })

    it('renders price chart', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByTestId('line-chart')).toBeTruthy()
    })
  })

  describe('back button navigation', () => {
    it('renders breadcrumb with home link', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      const homeLink = document.querySelector('a[href="/"]')
      expect(homeLink).toBeTruthy()
    })

    it('renders breadcrumb with browse link', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      const browseLink = document.querySelector('a[href="/browse"]')
      expect(browseLink).toBeTruthy()
    })

    it('renders breadcrumb with category link', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      const categoryLink = document.querySelector('a[href="/browse?category=GPU"]')
      expect(categoryLink).toBeTruthy()
    })
  })

  describe('not found state', () => {
    it('renders Device Not Found heading for unknown device', () => {
      render(<DevicePage />, { wrapper: ({ children }) => Wrapper({ children, deviceId: 'non-existent-device' }) })
      expect(screen.getByRole('heading', { name: 'Device Not Found' })).toBeTruthy()
    })

    it('renders not found message', () => {
      render(<DevicePage />, { wrapper: ({ children }) => Wrapper({ children, deviceId: 'non-existent-device' }) })
      expect(screen.getByText(/doesn't exist in our database/i)).toBeTruthy()
    })

    it('renders browse all devices link', () => {
      render(<DevicePage />, { wrapper: ({ children }) => Wrapper({ children, deviceId: 'non-existent-device' }) })
      expect(screen.getByText(/Browse all devices/)).toBeTruthy()
    })

    it('does not render device name when device not found', () => {
      render(<DevicePage />, { wrapper: ({ children }) => Wrapper({ children, deviceId: 'non-existent-device' }) })
      expect(screen.queryByRole('heading', { name: 'NVIDIA GeForce RTX 5090' })).toBeNull()
    })
  })

  describe('efficiency metrics', () => {
    it('renders Efficiency Metrics heading', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByRole('heading', { name: 'Efficiency Metrics' })).toBeTruthy()
    })

    it('renders INT8 TOPS value', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      // INT8 TOPS appears in the Efficiency Metrics card
      expect(screen.getByRole('heading', { name: 'Efficiency Metrics' })).toBeTruthy()
    })

    it('renders TOPS per dollar', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('2.5')).toBeTruthy()
    })

    it('renders TOPS per watt', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      // TOPS/W label exists
      expect(screen.getByText(/TOPS\/W/)).toBeTruthy()
    })

    it('renders data completeness bar', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText(/Data Completeness/)).toBeTruthy()
      expect(screen.getByText('85%')).toBeTruthy()
    })
  })

  describe('compute capabilities section', () => {
    it('renders Compute Capabilities heading', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByRole('heading', { name: 'Compute Capabilities' })).toBeTruthy()
    })

    it('renders INT8 TOPS in compute section', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      // Compute Capabilities section has INT8 TOPS label
      expect(screen.getByRole('heading', { name: 'Compute Capabilities' })).toBeTruthy()
    })

    it('renders FP16 TFLOPS', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      // FP16 TFLOPS in Compute Capabilities section
      expect(screen.getByRole('heading', { name: 'Compute Capabilities' })).toBeTruthy()
    })
  })

  describe('quick stats sidebar', () => {
    it('renders Quick Stats heading', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('Quick Stats')).toBeTruthy()
    })

    it('renders benchmark count', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      // Quick Stats sidebar with Benchmarks count
      expect(screen.getByText('Quick Stats')).toBeTruthy()
    })

    it('renders price points count', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      // Price Points count row in Quick Stats
      expect(screen.getByText(/Price Points/)).toBeTruthy()
    })

    it('renders active status', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('active')).toBeTruthy()
    })
  })

  describe('similar devices sidebar', () => {
    it('renders Similar Devices heading', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('Similar Devices')).toBeTruthy()
    })

    it('renders similar device links', () => {
      render(<DevicePage />, { wrapper: Wrapper })
      expect(screen.getByText('NVIDIA GeForce RTX 5080')).toBeTruthy()
    })
  })
})
