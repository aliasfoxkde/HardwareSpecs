import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopPerformersReport } from '@/components/reports/TopPerformersReport'
import { DataGapsReport } from '@/components/reports/DataGapsReport'
import { LaunchTimelineReport } from '@/components/reports/LaunchTimelineReport'
import { MemoryAnalysisReport } from '@/components/reports/MemoryAnalysisReport'
import { PriceAnalysisReport } from '@/components/reports/PriceAnalysisReport'
import { ProcessNodeReport } from '@/components/reports/ProcessNodeReport'
import { VendorDeepDiveReport } from '@/components/reports/VendorDeepDiveReport'
import { CategoryCoverageChart } from '@/components/reports/CategoryCoverageChart'
import { CompletenessChart } from '@/components/reports/CompletenessChart'
import { VendorDistributionChart } from '@/components/reports/VendorDistributionChart'

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
  PieChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="piechart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ScatterChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="scatterchart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Scatter: () => <div data-testid="scatter" />,
  LineChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="linechart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Legend: () => <div data-testid="legend" />,
  ComposedChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="composedchart" data-count={data?.length ?? 0}>{children}</div>
  ),
}))

describe('Report Components', () => {
  describe('TopPerformersReport', () => {
    it('renders section heading', () => {
      render(<TopPerformersReport />)
      expect(screen.getByText('Top Performers')).toBeDefined()
    })

    it('renders TOPS/$ heading', () => {
      render(<TopPerformersReport />)
      expect(screen.getByText(/TOPS.*\$/i)).toBeDefined()
    })

    it('renders TOPS/W heading', () => {
      render(<TopPerformersReport />)
      expect(screen.getByText(/TOPS.*W/i)).toBeDefined()
    })
  })

  describe('DataGapsReport', () => {
    it('renders section', () => {
      render(<DataGapsReport />)
      expect(document.body.textContent).toBeTruthy()
    })

    it('renders data gaps heading', () => {
      render(<DataGapsReport />)
      expect(screen.getByText(/Data Gaps/i)).toBeDefined()
    })
  })

  describe('LaunchTimelineReport', () => {
    it('renders section', () => {
      render(<LaunchTimelineReport />)
      expect(document.body.textContent).toBeTruthy()
    })

    it('renders timeline heading', () => {
      render(<LaunchTimelineReport />)
      expect(screen.getByText(/Timeline/i)).toBeDefined()
    })
  })

  describe('MemoryAnalysisReport', () => {
    it('renders section', () => {
      render(<MemoryAnalysisReport />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('PriceAnalysisReport', () => {
    it('renders section', () => {
      render(<PriceAnalysisReport />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('ProcessNodeReport', () => {
    it('renders section', () => {
      render(<ProcessNodeReport />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('VendorDeepDiveReport', () => {
    it('renders section', () => {
      render(<VendorDeepDiveReport />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('CategoryCoverageChart', () => {
    it('renders section', () => {
      render(<CategoryCoverageChart />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('CompletenessChart', () => {
    it('renders section', () => {
      render(<CompletenessChart />)
      expect(document.body.textContent).toBeTruthy()
    })
  })

  describe('VendorDistributionChart', () => {
    it('renders section', () => {
      render(<VendorDistributionChart />)
      expect(document.body.textContent).toBeTruthy()
    })
  })
})
