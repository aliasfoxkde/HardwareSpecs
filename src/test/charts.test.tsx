import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopTopsBarChart, TopTopsPerDollarChart, TopTopsPerWattChart } from '@/components/charts/PerformanceRankings'

// Mock recharts to avoid canvas issues in tests
vi.mock('recharts', () => ({
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="barchart" data-count={data.length}>{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive">{children}</div>,
  Cell: () => <div data-testid="cell" />,
}))

describe('PerformanceRankings', () => {
  describe('TopTopsBarChart', () => {
    it('renders bar chart with data', () => {
      render(<TopTopsBarChart limit={5} />)
      expect(screen.getByTestId('responsive')).toBeDefined()
    })
  })

  describe('TopTopsPerDollarChart', () => {
    it('renders chart', () => {
      render(<TopTopsPerDollarChart limit={5} />)
      expect(screen.getByTestId('responsive')).toBeDefined()
    })
  })

  describe('TopTopsPerWattChart', () => {
    it('renders chart', () => {
      render(<TopTopsPerWattChart limit={5} />)
      expect(screen.getByTestId('responsive')).toBeDefined()
    })
  })
})
