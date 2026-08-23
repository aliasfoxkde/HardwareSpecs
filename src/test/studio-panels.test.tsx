import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from '@/components/studio/StatCard'
import { RankingPanel } from '@/components/studio/RankingPanel'
import { ScatterPanel } from '@/components/studio/ScatterPanel'
import { DistributionPanel } from '@/components/studio/DistributionPanel'
import { DataQualityPanel } from '@/components/studio/DataQualityPanel'
import { CorrelationPanel } from '@/components/studio/CorrelationPanel'
import type { DeviceMetricsRow } from '@/lib/api'

// Mock recharts
vi.mock('recharts', () => ({
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="barchart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  ScatterChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="scatterchart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Scatter: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="scatter" data-count={data?.length ?? 0}>{children}</div>
  ),
  ComposedChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="composedchart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
}))

const mockRow: DeviceMetricsRow = {
  deviceId: 'test-1',
  modelName: 'Test Chip',
  vendorId: 'nvidia',
  vendorName: 'NVIDIA',
  familyName: 'Test Family',
  categoryName: 'GPU',
  architecture: 'Test Arch',
  launchDate: '2024-01-01',
  processNm: 4,
  cores: 16896,
  threads: null,
  memoryCapacityGB: 24,
  memoryType: 'GDDR6X',
  memoryBandwidthGBps: 1000,
  formFactor: null,
  status: 'Active',
  tmus: null,
  rops: null,
  tensorCores: 16896,
  rtCores: null,
  baseClockMhz: 2000,
  boostClockMhz: 2500,
  memoryBusWidth: '384-bit',
  effectiveInt8Tops: 100,
  effectiveInt8TopsConfidence: 0.9,
  fp16Tflops: 50,
  fp32Tflops: 25,
  fp4Tflops: null,
  fp8Tflops: null,
  tdpWatts: 300,
  latestPrice: 1000,
  dataCompleteness: 0.8,
  topsPerDollar: 0.1,
  topsPerWatt: 0.33,
  perfPerDollar: null,
  perfPerWatt: null,
  topBenchmarkScore: null,
  topBenchmarkType: null,
}

const mockData: DeviceMetricsRow[] = [
  { ...mockRow, deviceId: 'gpu-1', modelName: 'RTX 5090', effectiveInt8Tops: 500, fp16Tflops: 250, fp32Tflops: 125, tdpWatts: 450, latestPrice: 1999, topsPerDollar: 0.25, topsPerWatt: 1.1, dataCompleteness: 0.9 },
  { ...mockRow, deviceId: 'gpu-2', modelName: 'RTX 5080', effectiveInt8Tops: 300, fp16Tflops: 150, fp32Tflops: 75, tdpWatts: 350, latestPrice: 999, topsPerDollar: 0.3, topsPerWatt: 0.86, dataCompleteness: 0.85 },
]

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total Devices" value="437" />)
    expect(screen.getByText('Total Devices')).toBeDefined()
    expect(screen.getByText('437')).toBeDefined()
  })
})

describe('RankingPanel', () => {
  it('renders heading', () => {
    render(<RankingPanel data={mockData} />)
    expect(screen.getByText('Top 10 by TOPS')).toBeDefined()
  })

  it('renders with empty data', () => {
    render(<RankingPanel data={[]} />)
    expect(screen.getByText('Top 10 by TOPS')).toBeDefined()
  })
})

describe('ScatterPanel', () => {
  it('renders with data', () => {
    render(<ScatterPanel data={mockData} />)
    expect(screen.getByTestId('responsive')).toBeDefined()
  })

  it('renders empty state when no price data', () => {
    render(<ScatterPanel data={[]} />)
    expect(screen.getByText(/No price/i)).toBeDefined()
  })
})

describe('DistributionPanel', () => {
  it('renders headings', () => {
    render(<DistributionPanel data={mockData} />)
    expect(screen.getByText(/INT8 TOPS Distribution/i)).toBeDefined()
    expect(screen.getByText(/TDP Distribution/i)).toBeDefined()
    expect(screen.getByText(/Price Distribution/i)).toBeDefined()
  })

  it('renders device count', () => {
    render(<DistributionPanel data={mockData} />)
    expect(screen.getByText(/Showing \d+ devices/i)).toBeDefined()
  })
})

describe('DataQualityPanel', () => {
  it('renders quality categories', () => {
    render(<DataQualityPanel data={mockData} />)
    expect(screen.getByText(/High/i)).toBeDefined()
    expect(screen.getByText(/Medium/i)).toBeDefined()
    expect(screen.getByText(/Low/i)).toBeDefined()
  })

  it('renders field coverage', () => {
    render(<DataQualityPanel data={mockData} />)
    expect(screen.getByText(/Field Coverage/i)).toBeDefined()
  })

  it('renders completeness average', () => {
    render(<DataQualityPanel data={mockData} />)
    expect(screen.getByText(/Average completeness/i)).toBeDefined()
  })
})

describe('CorrelationPanel', () => {
  it('renders empty state when insufficient data', () => {
    render(<CorrelationPanel data={[]} />)
    expect(screen.getByText(/Insufficient data/i)).toBeDefined()
  })

  it('renders empty state with minimal data', () => {
    render(<CorrelationPanel data={[mockRow]} />)
    expect(screen.getByText(/Insufficient data/i)).toBeDefined()
  })
})
