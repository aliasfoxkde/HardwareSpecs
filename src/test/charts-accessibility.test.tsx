import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChartsPage } from '@/pages/ChartsPage'
import { PriceTdpHeatmap } from '@/components/charts/HeatmapChart'
import { InfographicPanel } from '@/components/charts/InfographicPanel'

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

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('ChartsPage accessibility', () => {
  it('category buttons have aria-pressed', () => {
    render(<ChartsPage />, { wrapper: Wrapper })
    const gpuButton = screen.getByRole('button', { name: 'GPU' })
    expect(gpuButton).toBeDefined()
    expect(gpuButton.getAttribute('aria-pressed')).toBe('true')
  })

  it('inactive category has aria-pressed="false"', () => {
    render(<ChartsPage />, { wrapper: Wrapper })
    const cpuButton = screen.getByRole('button', { name: 'CPU' })
    expect(cpuButton.getAttribute('aria-pressed')).toBe('false')
  })

  it('tab buttons have proper ARIA roles', () => {
    render(<ChartsPage />, { wrapper: Wrapper })
    const tablist = document.querySelector('[role="tablist"][aria-label="Chart tabs"]')
    expect(tablist).toBeTruthy()
    const tabs = tablist?.querySelectorAll('[role="tab"]')
    expect(tabs?.length).toBe(7)
  })
})

describe('HeatmapChart accessibility', () => {
  it('PriceTdpHeatmap has role="img" with descriptive aria-label', () => {
    render(<PriceTdpHeatmap category="GPU" />, { wrapper: Wrapper })
    const heatmap = document.querySelector('[role="img"][aria-label*="Price vs TDP heatmap"]')
    expect(heatmap).toBeTruthy()
  })

  it('VendorPerfHeatmap has role="table" with aria-label', () => {
    render(<ChartsPage />, { wrapper: Wrapper })
    const table = document.querySelector('[role="table"][aria-label*="Vendor performance heatmap"]')
    expect(table).toBeTruthy()
  })

  it('VendorPerfHeatmap header cells have role="columnheader"', () => {
    render(<ChartsPage />, { wrapper: Wrapper })
    const columnHeaders = document.querySelectorAll('[role="table"] [role="columnheader"]')
    expect(columnHeaders.length).toBe(5)
  })

  it('VendorPerfHeatmap data cells have role="cell"', () => {
    render(<ChartsPage />, { wrapper: Wrapper })
    const cells = document.querySelectorAll('[role="table"] [role="cell"]')
    expect(cells.length).toBeGreaterThanOrEqual(5) // at least 1 vendor row × 5 cells
  })
})

describe('InfographicPanel accessibility', () => {
  it('InfographicPanel has role="img" with aria-label', () => {
    render(<InfographicPanel category="GPU" />, { wrapper: Wrapper })
    const panel = document.querySelector('[role="img"][aria-label*="infographic statistics"]')
    expect(panel).toBeTruthy()
  })
})
