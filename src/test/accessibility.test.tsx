import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ChartsPage } from '@/pages/ChartsPage'
import { ToolsPage } from '@/pages/ToolsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { DocsPage } from '@/pages/DocsPage'
import { Layout } from '@/components/layout/Layout'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

// Mock matchMedia for all tests (Layout uses useTheme which calls matchMedia)
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

describe('ARIA tab roles', () => {
  it('ChartsPage has proper tablist, tab, and tabpanel roles', () => {
    render(<ChartsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBeGreaterThanOrEqual(2)
    const selected = tabs.find(t => t.getAttribute('aria-selected') === 'true')
    expect(selected).toBeTruthy()
    for (const tab of tabs) {
      expect(tab).toHaveAttribute('aria-controls')
    }
    const panels = screen.getAllByRole('tabpanel')
    expect(panels.length).toBeGreaterThanOrEqual(1)
  })

  it('ToolsPage has proper tablist, tab, and tabpanel roles', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBeGreaterThanOrEqual(2)
    const selected = tabs.find(t => t.getAttribute('aria-selected') === 'true')
    expect(selected).toBeTruthy()
    for (const tab of tabs) {
      expect(tab).toHaveAttribute('aria-controls')
    }
    const panels = screen.getAllByRole('tabpanel')
    expect(panels.length).toBeGreaterThanOrEqual(1)
  })

  it('ReportsPage has proper tablist, tab, and tabpanel roles', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBeGreaterThanOrEqual(2)
    const selected = tabs.find(t => t.getAttribute('aria-selected') === 'true')
    expect(selected).toBeTruthy()
    for (const tab of tabs) {
      expect(tab).toHaveAttribute('aria-controls')
    }
    const panels = screen.getAllByRole('tabpanel')
    expect(panels.length).toBeGreaterThanOrEqual(1)
  })

  it('DocsPage has proper tablist, tab, and tabpanel roles', () => {
    render(<DocsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(2)
    const selected = tabs.find(t => t.getAttribute('aria-selected') === 'true')
    expect(selected).toBeTruthy()
    for (const tab of tabs) {
      expect(tab).toHaveAttribute('aria-controls')
    }
    // DocsPage renders both panels (one hidden) — query DOM directly
    const panels = document.querySelectorAll('[role="tabpanel"]')
    expect(panels.length).toBe(2)
  })
})

describe('Layout accessibility', () => {
  it('Layout has a skip-to-content link', () => {
    render(<Layout />, { wrapper: Wrapper })
    const link = document.querySelector('a[href="#main-content"]')
    expect(link).toBeTruthy()
  })

  it('main content area has id="main-content"', () => {
    render(<Layout />, { wrapper: Wrapper })
    const main = document.getElementById('main-content')
    expect(main).toBeTruthy()
  })
})
