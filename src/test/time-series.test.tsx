import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  TdpOverTimeChart,
  TopsOverTimeChart,
  PriceOverTimeChart,
  ProcessOverTimeChart,
} from '@/components/charts/TimeSeriesChart'

// Mock recharts
vi.mock('recharts', () => ({
  LineChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="linechart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive">{children}</div>
  ),
  Legend: () => <div data-testid="legend" />,
}))

// Mock API - default returns empty
vi.mock('@/lib/api', () => ({
  getDevicesByCategory: vi.fn().mockReturnValue([]),
  getVendors: vi.fn().mockReturnValue([]),
}))

/* eslint-disable @typescript-eslint/no-explicit-any */
function makeDevice(opts: {
  vendorId?: string
  tdpWatts?: number
  launchDate?: string
  effectiveInt8Tops?: number
  latestPrice?: { priceUsd: number; date: string }
  processNm?: number
} = {}): any {
  const vid = opts.vendorId ?? 'nvidia'
  return {
    device: {
      deviceId: 'dev1',
      modelName: 'Test Chip',
      category: 'GPU',
      familyId: 'f1',
      vendorId: vid,
      architecture: 'Ada',
      launchDate: opts.launchDate ?? '2023-06-15',
      tdpWatts: opts.tdpWatts ?? 150,
      cores: 16384,
      threads: 16384,
      memoryCapacityGB: 24,
      memoryType: 'GDDR6X',
      processNm: opts.processNm ?? 5,
    },
    vendor: { vendorId: vid, name: vid === 'amd' ? 'AMD' : 'NVIDIA', website: 'https://test.com', country: 'US' },
    family: { familyId: 'f1', name: 'Test Family', category: 'GPU', vendorId: vid, architecture: 'Ada', deviceIds: ['dev1'] },
    metrics: { effectiveInt8Tops: opts.effectiveInt8Tops ?? 500, topsPerDollar: 0.5, topsPerWatt: 3.0, perfPerDollar: 10, perfPerWatt: 30, dataCompleteness: 0.9 },
    latestPrice: opts.latestPrice ?? { priceUsd: 2000, date: '2024-01-01' },
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

import { getDevicesByCategory, getVendors } from '@/lib/api'

describe('TimeSeriesChart - TdpOverTimeChart', () => {
  beforeEach(() => {
    vi.mocked(getDevicesByCategory).mockReturnValue([])
    vi.mocked(getVendors).mockReturnValue([])
  })

  it('renders empty state when no data', () => {
    render(<TdpOverTimeChart category="GPU" />)
    expect(screen.getByText(/No TDP trend data for GPU/i)).toBeDefined()
  })

  it('renders chart when devices have tdp and launchDate', () => {
    vi.mocked(getDevicesByCategory).mockReturnValue([
      makeDevice({ tdpWatts: 300, launchDate: '2023-01-01' }),
      makeDevice({ vendorId: 'amd', tdpWatts: 350, launchDate: '2023-03-01' }),
    ])
    vi.mocked(getVendors).mockReturnValue([
      { vendorId: 'nvidia', name: 'NVIDIA', website: 'https://nvidia.com', country: 'US' },
      { vendorId: 'amd', name: 'AMD', website: 'https://amd.com', country: 'US' },
    ])
    render(<TdpOverTimeChart category="GPU" />)
    expect(screen.getByTestId('linechart')).toBeDefined()
  })
})

describe('TimeSeriesChart - TopsOverTimeChart', () => {
  beforeEach(() => {
    vi.mocked(getDevicesByCategory).mockReturnValue([])
    vi.mocked(getVendors).mockReturnValue([])
  })

  it('renders empty state when no data', () => {
    render(<TopsOverTimeChart category="GPU" />)
    expect(screen.getByText(/No TOPS trend data for GPU/i)).toBeDefined()
  })

  it('renders chart when devices have TOPS and launchDate', () => {
    vi.mocked(getDevicesByCategory).mockReturnValue([
      makeDevice({ effectiveInt8Tops: 1000, launchDate: '2023-01-01' }),
    ])
    vi.mocked(getVendors).mockReturnValue([{ vendorId: 'nvidia', name: 'NVIDIA', website: 'https://nvidia.com', country: 'US' }])
    render(<TopsOverTimeChart category="GPU" />)
    expect(screen.getByTestId('linechart')).toBeDefined()
  })
})

describe('TimeSeriesChart - PriceOverTimeChart', () => {
  beforeEach(() => {
    vi.mocked(getDevicesByCategory).mockReturnValue([])
    vi.mocked(getVendors).mockReturnValue([])
  })

  it('renders empty state when no data', () => {
    render(<PriceOverTimeChart category="GPU" />)
    expect(screen.getByText(/No price trend data for GPU/i)).toBeDefined()
  })

  it('renders chart when devices have price and launchDate', () => {
    vi.mocked(getDevicesByCategory).mockReturnValue([
      makeDevice({ latestPrice: { priceUsd: 2500, date: '2024-01-01' }, launchDate: '2023-01-01' }),
    ])
    vi.mocked(getVendors).mockReturnValue([{ vendorId: 'nvidia', name: 'NVIDIA', website: 'https://nvidia.com', country: 'US' }])
    render(<PriceOverTimeChart category="GPU" />)
    expect(screen.getByTestId('linechart')).toBeDefined()
  })
})

describe('TimeSeriesChart - ProcessOverTimeChart', () => {
  beforeEach(() => {
    vi.mocked(getDevicesByCategory).mockReturnValue([])
    vi.mocked(getVendors).mockReturnValue([])
  })

  it('renders empty state when no data', () => {
    render(<ProcessOverTimeChart category="GPU" />)
    expect(screen.getByText(/No process node data for GPU/i)).toBeDefined()
  })

  it('renders chart when devices have process and launchDate', () => {
    vi.mocked(getDevicesByCategory).mockReturnValue([
      makeDevice({ processNm: 5, launchDate: '2023-01-01' }),
    ])
    vi.mocked(getVendors).mockReturnValue([{ vendorId: 'nvidia', name: 'NVIDIA', website: 'https://nvidia.com', country: 'US' }])
    render(<ProcessOverTimeChart category="GPU" />)
    expect(screen.getByTestId('linechart')).toBeDefined()
  })
})
