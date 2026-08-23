import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RadarComparisonChart, TopDevicesRadar } from '@/components/charts/RadarComparison'
import { PerfVsPriceChart, TopsVsPriceChart } from '@/components/charts/ScatterWithRegression'
import type { DeviceCategory } from '@/types'

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

// Mock API
vi.mock('@/lib/api', () => ({
  getDeviceMetricsTable: vi.fn().mockReturnValue([]),
  getDevicesByCategory: vi.fn().mockReturnValue([]),
}))

describe('RadarComparisonChart', () => {
  it('renders empty state when no devices', () => {
    render(<RadarComparisonChart deviceIds={[]} />)
    expect(screen.getByText(/Select devices to compare/i)).toBeDefined()
  })
})

describe('TopDevicesRadar', () => {
  it('renders empty state when no data', () => {
    render(<TopDevicesRadar category="GPU" />)
    expect(screen.getByText(/No compute data for GPU/i)).toBeDefined()
  })
})

describe('PerfVsPriceChart', () => {
  it('renders empty state when no data', () => {
    render(<PerfVsPriceChart category="GPU" />)
    expect(screen.getByText(/No price\+performance data/i)).toBeDefined()
  })
})

describe('TopsVsPriceChart', () => {
  it('renders empty state when no data', () => {
    render(<TopsVsPriceChart category="GPU" />)
    expect(screen.getByText(/No TOPS\+price data/i)).toBeDefined()
  })
})
