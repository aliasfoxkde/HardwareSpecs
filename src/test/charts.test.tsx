import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChartsPage } from '@/pages/ChartsPage'
import * as api from '@/lib/api'

// Mock recharts to avoid canvas issues in tests
vi.mock('recharts', () => ({
  BarChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
    <div data-testid="barchart" data-count={data?.length ?? 0}>{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="piechart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  ScatterChart: ({ children }: { children: React.ReactNode }) => <div data-testid="scatterchart">{children}</div>,
  Scatter: () => <div data-testid="scatter" />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="linechart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  ZAxis: () => <div data-testid="z-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  RadarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="radarchart">{children}</div>,
  Radar: () => <div data-testid="radar" />,
  PolarGrid: () => <div data-testid="polargrid" />,
  PolarAngleAxis: () => <div data-testid="polarangleaxis" />,
  PolarRadiusAxis: () => <div data-testid="polarradiusaxis" />,
  ComposedChart: ({ children }: { children: React.ReactNode }) => <div data-testid="composedchart">{children}</div>,
  Area: () => <div data-testid="area" />,
}))

// Mock the API module
vi.spyOn(api, 'getVendors').mockReturnValue([])
vi.spyOn(api, 'getDevicesByCategory').mockReturnValue([])
vi.spyOn(api, 'getDeviceMetricsTable').mockReturnValue([])

describe('ChartsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(api.getVendors as ReturnType<typeof vi.spyOn>).mockReturnValue([])
    ;(api.getDevicesByCategory as ReturnType<typeof vi.spyOn>).mockReturnValue([])
    ;(api.getDeviceMetricsTable as ReturnType<typeof vi.spyOn>).mockReturnValue([])
  })

  describe('page header and description', () => {
    it('renders page header', () => {
      render(<ChartsPage />)
      expect(screen.getByRole('heading', { name: 'Charts & Visualizations' })).toBeDefined()
    })

    it('renders page description', () => {
      render(<ChartsPage />)
      expect(screen.getByText('Interactive charts for hardware performance, pricing, and efficiency.')).toBeDefined()
    })
  })

  describe('category buttons', () => {
    it('renders all 7 category buttons', () => {
      render(<ChartsPage />)
      const categories = ['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System']
      categories.forEach(cat => {
        expect(screen.getByRole('button', { name: cat })).toBeDefined()
      })
    })

    it('clicking CPU category button sets it as active', () => {
      render(<ChartsPage />)
      const cpuButton = screen.getByRole('button', { name: 'CPU' })
      fireEvent.click(cpuButton)
      expect(cpuButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('clicking GPU category button sets it as active', () => {
      render(<ChartsPage />)
      const gpuButton = screen.getByRole('button', { name: 'GPU' })
      fireEvent.click(gpuButton)
      expect(gpuButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('clicking SBC category button sets it as active', () => {
      render(<ChartsPage />)
      const sbcButton = screen.getByRole('button', { name: 'SBC' })
      fireEvent.click(sbcButton)
      expect(sbcButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('clicking NPU category button sets it as active', () => {
      render(<ChartsPage />)
      const npuButton = screen.getByRole('button', { name: 'NPU' })
      fireEvent.click(npuButton)
      expect(npuButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('clicking ASIC category button sets it as active', () => {
      render(<ChartsPage />)
      const asicButton = screen.getByRole('button', { name: 'ASIC' })
      fireEvent.click(asicButton)
      expect(asicButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('clicking SoC category button sets it as active', () => {
      render(<ChartsPage />)
      const socButton = screen.getByRole('button', { name: 'SoC' })
      fireEvent.click(socButton)
      expect(socButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('clicking System category button sets it as active', () => {
      render(<ChartsPage />)
      const systemButton = screen.getByRole('button', { name: 'System' })
      fireEvent.click(systemButton)
      expect(systemButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('tab clicks', () => {
    it('clicking Overview tab activates it', () => {
      render(<ChartsPage />)
      const overviewTab = screen.getByRole('tab', { name: 'Overview' })
      fireEvent.click(overviewTab)
      expect(overviewTab).toHaveAttribute('aria-selected', 'true')
    })

    it('clicking Performance tab activates it', () => {
      render(<ChartsPage />)
      const performanceTab = screen.getByRole('tab', { name: 'Performance' })
      fireEvent.click(performanceTab)
      expect(performanceTab).toHaveAttribute('aria-selected', 'true')
    })

    it('clicking Value tab activates it', () => {
      render(<ChartsPage />)
      const valueTab = screen.getByRole('tab', { name: 'Value' })
      fireEvent.click(valueTab)
      expect(valueTab).toHaveAttribute('aria-selected', 'true')
    })

    it('clicking Efficiency tab activates it', () => {
      render(<ChartsPage />)
      const efficiencyTab = screen.getByRole('tab', { name: 'Efficiency' })
      fireEvent.click(efficiencyTab)
      expect(efficiencyTab).toHaveAttribute('aria-selected', 'true')
    })

    it('clicking Trends tab activates it', () => {
      render(<ChartsPage />)
      const trendsTab = screen.getByRole('tab', { name: 'Trends' })
      fireEvent.click(trendsTab)
      expect(trendsTab).toHaveAttribute('aria-selected', 'true')
    })

    it('clicking Compare tab activates it', () => {
      render(<ChartsPage />)
      const compareTab = screen.getByRole('tab', { name: 'Compare' })
      fireEvent.click(compareTab)
      expect(compareTab).toHaveAttribute('aria-selected', 'true')
    })

    it('clicking Report tab activates it', () => {
      render(<ChartsPage />)
      const reportTab = screen.getByRole('tab', { name: 'Report' })
      fireEvent.click(reportTab)
      expect(reportTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('tab keyboard navigation', () => {
    it('ArrowRight navigates to next tab', () => {
      render(<ChartsPage />)
      const overviewTab = screen.getByRole('tab', { name: 'Overview' })
      overviewTab.focus()
      fireEvent.keyDown(overviewTab, { key: 'ArrowRight' })
      const performanceTab = screen.getByRole('tab', { name: 'Performance' })
      expect(performanceTab).toHaveAttribute('aria-selected', 'true')
    })

    it('ArrowLeft navigates to previous tab', () => {
      render(<ChartsPage />)
      const performanceTab = screen.getByRole('tab', { name: 'Performance' })
      // First click Performance to set it active
      fireEvent.click(performanceTab)
      // Now focus and press ArrowLeft
      performanceTab.focus()
      fireEvent.keyDown(performanceTab, { key: 'ArrowLeft' })
      const overviewTab = screen.getByRole('tab', { name: 'Overview' })
      expect(overviewTab).toHaveAttribute('aria-selected', 'true')
    })

    it('ArrowRight wraps around from last tab to first', () => {
      render(<ChartsPage />)
      const reportTab = screen.getByRole('tab', { name: 'Report' })
      // First click Report to set it active
      fireEvent.click(reportTab)
      // Now focus and press ArrowRight
      reportTab.focus()
      fireEvent.keyDown(reportTab, { key: 'ArrowRight' })
      const overviewTab = screen.getByRole('tab', { name: 'Overview' })
      expect(overviewTab).toHaveAttribute('aria-selected', 'true')
    })

    it('ArrowLeft wraps around from first tab to last', () => {
      render(<ChartsPage />)
      const overviewTab = screen.getByRole('tab', { name: 'Overview' })
      // First click Overview to set it active
      fireEvent.click(overviewTab)
      // Now focus and press ArrowLeft
      overviewTab.focus()
      fireEvent.keyDown(overviewTab, { key: 'ArrowLeft' })
      const reportTab = screen.getByRole('tab', { name: 'Report' })
      expect(reportTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  describe('active tab aria-selected', () => {
    it('Overview tab has aria-selected true when active', () => {
      render(<ChartsPage />)
      const overviewTab = screen.getByRole('tab', { name: 'Overview' })
      expect(overviewTab).toHaveAttribute('aria-selected', 'true')
    })

    it('non-active tabs have aria-selected false', () => {
      render(<ChartsPage />)
      const performanceTab = screen.getByRole('tab', { name: 'Performance' })
      const valueTab = screen.getByRole('tab', { name: 'Value' })
      expect(performanceTab).toHaveAttribute('aria-selected', 'false')
      expect(valueTab).toHaveAttribute('aria-selected', 'false')
    })
  })
})
