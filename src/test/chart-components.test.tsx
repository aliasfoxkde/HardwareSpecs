import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RadarComparisonChart, TopDevicesRadar } from '@/components/charts/RadarComparison'
import { PerfVsPriceChart, TopsVsPriceChart } from '@/components/charts/ScatterWithRegression'

// Mock recharts
vi.mock('recharts', () => ({
  RadarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="radarchart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Radar: () => <div data-testid="radar" />,
  PolarGrid: () => <div data-testid="polargrid" />,
  PolarAngleAxis: () => <div data-testid="polarangleaxis" />,
  PolarRadiusAxis: () => <div data-testid="polarradiusaxis" />,
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive">{children}</div>
  ),
  Scatter: ({ children }: { children: React.ReactNode }) => <div data-testid="scatter">{children}</div>,
  ComposedChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="composedchart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Cell: () => <div data-testid="cell" />,
}))

vi.mock('@/lib/api', () => ({
  getDeviceMetricsTable: vi.fn().mockReturnValue([]),
  getDevicesByCategory: vi.fn().mockReturnValue([]),
}))

import { getDeviceMetricsTable, getDevicesByCategory } from '@/lib/api'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock data factory
function makeMetricsRow(overrides: any = {}): any {
  return {
    deviceId: 'dev1',
    modelName: 'Test Device',
    categoryName: 'GPU',
    vendorName: 'NVIDIA',
    effectiveInt8Tops: 500,
    effectiveInt8TopsConfidence: 0.9,
    topsPerDollar: 0.5,
    topsPerWatt: 3.0,
    perfPerDollar: 30,
    perfPerWatt: 200,
    fp16Tflops: 50,
    fp32Tflops: 25,
    fp4Tflops: null,
    fp8Tflops: null,
    dataCompleteness: 0.8,
    latestPrice: 1000,
    tdpWatts: 300,
    memoryCapacityGB: 24,
    topBenchmarkScore: null,
    topBenchmarkType: null,
    ...overrides,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
function makeDeviceWithPrice(overrides: any = {}): any {
  return {
    device: {
      deviceId: overrides.deviceId ?? 'dev1',
      modelName: overrides.modelName ?? 'Test Device',
      category: 'GPU' as const,
      familyId: 'f1',
      vendorId: overrides.vendorId ?? 'nvidia',
      architecture: 'Ada',
      launchDate: overrides.launchDate ?? '2023-01-01',
      tdpWatts: overrides.tdpWatts ?? 300,
      cores: 16384,
      threads: 16384,
      memoryCapacityGB: 24,
      memoryType: 'GDDR6X',
      processNm: 5,
    },
    vendor: { vendorId: overrides.vendorId ?? 'nvidia', name: overrides.vendorName ?? 'NVIDIA', website: 'https://nvidia.com', country: 'US' },
    family: { familyId: 'f1', name: 'Test Family', category: 'GPU' as const, vendorId: overrides.vendorId ?? 'nvidia', architecture: 'Ada', deviceIds: ['dev1'] },
    metrics: {
      effectiveInt8Tops: overrides.effectiveInt8Tops ?? 500,
      topsPerDollar: overrides.topsPerDollar ?? 0.5,
      topsPerWatt: overrides.topsPerWatt ?? 3.0,
      perfPerDollar: overrides.perfPerDollar ?? 30,
      perfPerWatt: overrides.perfPerWatt ?? 200,
      dataCompleteness: 0.8,
    },
    latestPrice: overrides.latestPrice != null ? { priceUsd: overrides.latestPrice, date: '2024-01-01' } : undefined,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('RadarComparisonChart', () => {
  beforeEach(() => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([])
  })

  it('renders empty state when no devices', () => {
    render(<RadarComparisonChart deviceIds={[]} />)
    expect(screen.getByText(/Select devices to compare/i)).toBeDefined()
  })

  it('renders chart when devices are selected', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', modelName: 'RTX 4090', effectiveInt8Tops: 1321, topsPerDollar: 0.8, topsPerWatt: 4.4, perfPerDollar: 50, perfPerWatt: 275 }),
      makeMetricsRow({ deviceId: 'dev2', modelName: 'RTX 4080', effectiveInt8Tops: 1000, topsPerDollar: 0.7, topsPerWatt: 3.5, perfPerDollar: 40, perfPerWatt: 220 }),
    ])
    render(<RadarComparisonChart deviceIds={['dev1', 'dev2']} />)
    expect(screen.getByTestId('radarchart')).toBeDefined()
  })

  it('renders with single device', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', modelName: 'RTX 4090' }),
    ])
    render(<RadarComparisonChart deviceIds={['dev1']} />)
    expect(screen.getByTestId('radarchart')).toBeDefined()
  })
})

describe('TopDevicesRadar', () => {
  beforeEach(() => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([])
  })

  it('renders empty state when no data', () => {
    render(<TopDevicesRadar category="GPU" />)
    expect(screen.getByText(/No compute data for GPU/i)).toBeDefined()
  })

  it('renders chart when data exists', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', modelName: 'RTX 4090', effectiveInt8Tops: 1321 }),
      makeMetricsRow({ deviceId: 'dev2', modelName: 'RTX 4080', effectiveInt8Tops: 1000 }),
      makeMetricsRow({ deviceId: 'dev3', modelName: 'RX 7900', effectiveInt8Tops: 800 }),
    ])
    render(<TopDevicesRadar category="GPU" />)
    expect(screen.getByTestId('radarchart')).toBeDefined()
  })

  it('renders empty when all devices have 0 effectiveInt8Tops', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', modelName: 'RTX 4090', effectiveInt8Tops: 0 }),
    ])
    render(<TopDevicesRadar category="GPU" />)
    expect(screen.getByText(/No compute data for GPU/i)).toBeDefined()
  })
})

describe('PerfVsPriceChart', () => {
  beforeEach(() => {
    vi.mocked(getDevicesByCategory).mockReturnValue([])
  })

  it('renders empty state when no data', () => {
    render(<PerfVsPriceChart category="GPU" />)
    expect(screen.getByText(/No price\+performance data/i)).toBeDefined()
  })

  it('renders chart when devices have price and perfPerDollar', () => {
    vi.mocked(getDevicesByCategory).mockReturnValue([
      makeDeviceWithPrice({ deviceId: 'dev1', modelName: 'RTX 4090', latestPrice: 1599, perfPerDollar: 50 }),
      makeDeviceWithPrice({ deviceId: 'dev2', modelName: 'RTX 4080', latestPrice: 1199, perfPerDollar: 40 }),
    ])
    render(<PerfVsPriceChart category="GPU" />)
    expect(screen.getByTestId('composedchart')).toBeDefined()
  })

  it('filters out devices without latestPrice', () => {
    vi.mocked(getDevicesByCategory).mockReturnValue([
      makeDeviceWithPrice({ deviceId: 'dev1', modelName: 'RTX 4090', latestPrice: undefined }),
    ])
    render(<PerfVsPriceChart category="GPU" />)
    expect(screen.getByText(/No price\+performance data/i)).toBeDefined()
  })

  it('filters out devices without perfPerDollar', () => {
    vi.mocked(getDevicesByCategory).mockReturnValue([
      makeDeviceWithPrice({ deviceId: 'dev1', modelName: 'RTX 4090', latestPrice: 1599, perfPerDollar: 0 }),
    ])
    render(<PerfVsPriceChart category="GPU" />)
    expect(screen.getByText(/No price\+performance data/i)).toBeDefined()
  })
})

describe('TopsVsPriceChart', () => {
  beforeEach(() => {
    vi.mocked(getDevicesByCategory).mockReturnValue([])
  })

  it('renders empty state when no data', () => {
    render(<TopsVsPriceChart category="GPU" />)
    expect(screen.getByText(/No TOPS\+price data/i)).toBeDefined()
  })

  it('renders chart when devices have price and TOPS', () => {
    vi.mocked(getDevicesByCategory).mockReturnValue([
      makeDeviceWithPrice({ deviceId: 'dev1', modelName: 'RTX 4090', latestPrice: 1599, effectiveInt8Tops: 1321 }),
      makeDeviceWithPrice({ deviceId: 'dev2', modelName: 'RTX 4080', latestPrice: 1199, effectiveInt8Tops: 1000 }),
    ])
    render(<TopsVsPriceChart category="GPU" />)
    expect(screen.getByTestId('composedchart')).toBeDefined()
  })

  it('filters out devices without latestPrice', () => {
    vi.mocked(getDevicesByCategory).mockReturnValue([
      makeDeviceWithPrice({ deviceId: 'dev1', modelName: 'RTX 4090', latestPrice: undefined, effectiveInt8Tops: 1321 }),
    ])
    render(<TopsVsPriceChart category="GPU" />)
    expect(screen.getByText(/No TOPS\+price data/i)).toBeDefined()
  })

  it('filters out devices with 0 effectiveInt8Tops', () => {
    vi.mocked(getDevicesByCategory).mockReturnValue([
      makeDeviceWithPrice({ deviceId: 'dev1', modelName: 'RTX 4090', latestPrice: 1599, effectiveInt8Tops: 0 }),
    ])
    render(<TopsVsPriceChart category="GPU" />)
    expect(screen.getByText(/No TOPS\+price data/i)).toBeDefined()
  })
})
