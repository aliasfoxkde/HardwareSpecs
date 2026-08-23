import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DistributionPanel } from '@/components/studio/DistributionPanel'

// Mock recharts
vi.mock('recharts', () => ({
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="barchart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive">{children}</div>
  ),
}))

/* eslint-disable @typescript-eslint/no-explicit-any */
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

describe('DistributionPanel', () => {
  it('renders with empty data', () => {
    render(<DistributionPanel data={[]} />)
    expect(screen.getByText(/INT8 TOPS Distribution/i)).toBeDefined()
    expect(screen.getByText(/TDP Distribution/i)).toBeDefined()
    expect(screen.getByText(/Price Distribution/i)).toBeDefined()
    expect(screen.getByText(/Showing 0 devices with TOPS data, 0 total/i)).toBeDefined()
  })

  it('renders with data having TOPS values', () => {
    render(<DistributionPanel data={[
      makeMetricsRow({ deviceId: 'dev1', effectiveInt8Tops: 500, tdpWatts: 300, latestPrice: 1000 }),
      makeMetricsRow({ deviceId: 'dev2', effectiveInt8Tops: 100, tdpWatts: 150, latestPrice: 500 }),
    ]} />)
    expect(screen.getByText(/Showing 2 devices with TOPS data, 2 total/i)).toBeDefined()
  })

  it('renders with data having no TOPS values', () => {
    render(<DistributionPanel data={[
      makeMetricsRow({ deviceId: 'dev1', effectiveInt8Tops: 0, tdpWatts: 300, latestPrice: 1000 }),
    ]} />)
    expect(screen.getByText(/Showing 0 devices with TOPS data, 1 total/i)).toBeDefined()
  })

  it('renders different TDP buckets', () => {
    render(<DistributionPanel data={[
      makeMetricsRow({ deviceId: 'dev1', effectiveInt8Tops: 100, tdpWatts: 40 }),
      makeMetricsRow({ deviceId: 'dev2', effectiveInt8Tops: 200, tdpWatts: 75 }),
      makeMetricsRow({ deviceId: 'dev3', effectiveInt8Tops: 300, tdpWatts: 150 }),
      makeMetricsRow({ deviceId: 'dev4', effectiveInt8Tops: 400, tdpWatts: 280 }),
      makeMetricsRow({ deviceId: 'dev5', effectiveInt8Tops: 500, tdpWatts: 400 }),
    ]} />)
    expect(screen.getByText(/Showing 5 devices with TOPS data, 5 total/i)).toBeDefined()
  })

  it('renders different price buckets', () => {
    render(<DistributionPanel data={[
      makeMetricsRow({ deviceId: 'dev1', effectiveInt8Tops: 100, latestPrice: 50 }),
      makeMetricsRow({ deviceId: 'dev2', effectiveInt8Tops: 200, latestPrice: 200 }),
      makeMetricsRow({ deviceId: 'dev3', effectiveInt8Tops: 300, latestPrice: 400 }),
      makeMetricsRow({ deviceId: 'dev4', effectiveInt8Tops: 400, latestPrice: 750 }),
      makeMetricsRow({ deviceId: 'dev5', effectiveInt8Tops: 500, latestPrice: 1500 }),
    ]} />)
    expect(screen.getByText(/Showing 5 devices with TOPS data, 5 total/i)).toBeDefined()
  })

  it('handles null tdpWatts and latestPrice', () => {
    render(<DistributionPanel data={[
      makeMetricsRow({ deviceId: 'dev1', effectiveInt8Tops: 100, tdpWatts: null, latestPrice: null }),
    ]} />)
    expect(screen.getByText(/Showing 1 devices with TOPS data, 1 total/i)).toBeDefined()
  })

  it('renders high TOPS bucket (>1000)', () => {
    render(<DistributionPanel data={[
      makeMetricsRow({ deviceId: 'dev1', effectiveInt8Tops: 1500 }),
    ]} />)
    expect(screen.getByText(/Showing 1 devices with TOPS data, 1 total/i)).toBeDefined()
  })

  it('renders high price bucket (>1000)', () => {
    render(<DistributionPanel data={[
      makeMetricsRow({ deviceId: 'dev1', effectiveInt8Tops: 100, latestPrice: 2000 }),
    ]} />)
    expect(screen.getByText(/Showing 1 devices with TOPS data, 1 total/i)).toBeDefined()
  })

  it('renders high TDP bucket (>350W)', () => {
    render(<DistributionPanel data={[
      makeMetricsRow({ deviceId: 'dev1', effectiveInt8Tops: 100, tdpWatts: 500 }),
    ]} />)
    expect(screen.getByText(/Showing 1 devices with TOPS data, 1 total/i)).toBeDefined()
  })
})
