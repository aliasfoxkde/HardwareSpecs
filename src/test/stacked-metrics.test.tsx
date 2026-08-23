import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MultiMetricComparison, PricePerfStacked } from '@/components/charts/StackedMetrics'

// Mock recharts
vi.mock('recharts', () => ({
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="barchart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive">{children}</div>
  ),
  Legend: () => <div data-testid="legend" />,
}))

vi.mock('@/lib/api', () => ({
  getDeviceMetricsTable: vi.fn().mockReturnValue([]),
}))

import { getDeviceMetricsTable } from '@/lib/api'

/* eslint-disable @typescript-eslint/no-explicit-any */
function makeMetricsRow(overrides: any = {}): any {
  return {
    deviceId: overrides.deviceId ?? 'dev1',
    modelName: overrides.modelName ?? 'Test Device',
    categoryName: overrides.categoryName ?? 'GPU',
    vendorName: 'NVIDIA',
    effectiveInt8Tops: overrides.effectiveInt8Tops ?? 500,
    effectiveInt8TopsConfidence: 0.9,
    topsPerDollar: overrides.topsPerDollar ?? null,
    topsPerWatt: 3.0,
    perfPerDollar: overrides.perfPerDollar ?? null,
    perfPerWatt: 200,
    fp16Tflops: overrides.fp16Tflops ?? null,
    fp32Tflops: overrides.fp32Tflops ?? null,
    fp4Tflops: null,
    fp8Tflops: null,
    dataCompleteness: 0.8,
    latestPrice: overrides.latestPrice ?? null,
    tdpWatts: 300,
    memoryCapacityGB: 24,
    topBenchmarkScore: null,
    topBenchmarkType: null,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('MultiMetricComparison', () => {
  beforeEach(() => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([])
  })

  it('renders empty state when no data', () => {
    render(<MultiMetricComparison category="GPU" />)
    expect(screen.getByText(/No compute data for GPU/i)).toBeDefined()
  })

  it('renders chart when devices have compute data', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', modelName: 'RTX 4090', effectiveInt8Tops: 1321, fp16Tflops: 82.58 }),
      makeMetricsRow({ deviceId: 'dev2', modelName: 'RTX 4080', effectiveInt8Tops: 1000, fp16Tflops: 50 }),
    ])
    render(<MultiMetricComparison category="GPU" />)
    expect(screen.getByTestId('barchart')).toBeDefined()
  })

  it('renders with devices having only INT8 TOPS', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', effectiveInt8Tops: 500, fp16Tflops: null, fp32Tflops: null }),
    ])
    render(<MultiMetricComparison category="GPU" />)
    expect(screen.getByTestId('barchart')).toBeDefined()
  })

  it('renders with fp16 only', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', effectiveInt8Tops: 0, fp16Tflops: 50 }),
    ])
    render(<MultiMetricComparison category="GPU" />)
    expect(screen.getByTestId('barchart')).toBeDefined()
  })

  it('renders with fp32 only', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', effectiveInt8Tops: 0, fp16Tflops: null, fp32Tflops: 30 }),
    ])
    render(<MultiMetricComparison category="GPU" />)
    expect(screen.getByTestId('barchart')).toBeDefined()
  })

  it('filters by category', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', categoryName: 'GPU', effectiveInt8Tops: 500 }),
      makeMetricsRow({ deviceId: 'dev2', categoryName: 'CPU', effectiveInt8Tops: 300 }),
    ])
    render(<MultiMetricComparison category="GPU" />)
    expect(screen.getByTestId('barchart')).toBeDefined()
  })

  it('limits to 15 devices', () => {
    const rows = Array.from({ length: 20 }, (_, i) =>
      makeMetricsRow({ deviceId: `dev${i}`, modelName: `Device ${i}`, effectiveInt8Tops: 500 - i })
    )
    vi.mocked(getDeviceMetricsTable).mockReturnValue(rows)
    render(<MultiMetricComparison category="GPU" />)
    expect(screen.getByTestId('barchart')).toBeDefined()
  })
})

describe('PricePerfStacked', () => {
  beforeEach(() => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([])
  })

  it('renders empty state when no data', () => {
    render(<PricePerfStacked category="GPU" />)
    expect(screen.getByText(/No value data for GPU/i)).toBeDefined()
  })

  it('renders chart when devices have price and value metrics', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', modelName: 'RTX 4090', latestPrice: 1599, topsPerDollar: 0.8 }),
      makeMetricsRow({ deviceId: 'dev2', modelName: 'RTX 4080', latestPrice: 1199, topsPerDollar: 0.7 }),
    ])
    render(<PricePerfStacked category="GPU" />)
    expect(screen.getByTestId('barchart')).toBeDefined()
  })

  it('renders with perfPerDollar instead of topsPerDollar', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', latestPrice: 1599, topsPerDollar: null, perfPerDollar: 50 }),
    ])
    render(<PricePerfStacked category="GPU" />)
    expect(screen.getByTestId('barchart')).toBeDefined()
  })

  it('filters out devices without price', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', latestPrice: null, topsPerDollar: 0.8 }),
    ])
    render(<PricePerfStacked category="GPU" />)
    expect(screen.getByText(/No value data for GPU/i)).toBeDefined()
  })

  it('filters out devices without value metrics', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', latestPrice: 1599, topsPerDollar: null, perfPerDollar: null }),
    ])
    render(<PricePerfStacked category="GPU" />)
    expect(screen.getByText(/No value data for GPU/i)).toBeDefined()
  })

  it('filters by category', () => {
    vi.mocked(getDeviceMetricsTable).mockReturnValue([
      makeMetricsRow({ deviceId: 'dev1', categoryName: 'GPU', latestPrice: 1599, topsPerDollar: 0.8 }),
      makeMetricsRow({ deviceId: 'dev2', categoryName: 'CPU', latestPrice: 500, topsPerDollar: 0.5 }),
    ])
    render(<PricePerfStacked category="GPU" />)
    expect(screen.getByTestId('barchart')).toBeDefined()
  })

  it('limits to 15 devices', () => {
    const rows = Array.from({ length: 20 }, (_, i) =>
      makeMetricsRow({ deviceId: `dev${i}`, modelName: `Device ${i}`, latestPrice: 1000 + i, topsPerDollar: 0.5 })
    )
    vi.mocked(getDeviceMetricsTable).mockReturnValue(rows)
    render(<PricePerfStacked category="GPU" />)
    expect(screen.getByTestId('barchart')).toBeDefined()
  })
})
