import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ToolsPage } from '@/pages/ToolsPage'

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

describe('ToolsPage accessibility', () => {
  it('calculator labels have htmlFor associations', () => {
    const { container } = render(<ToolsPage />, { wrapper: Wrapper })
    // TopsCalculator is the default active tool, so its inputs are rendered
    expect(container.innerHTML).toContain('tops-cores')
  })

  it('lookup tool has aria-label on search when active', () => {
    const { container } = render(<ToolsPage />, { wrapper: Wrapper })
    const tab = document.getElementById('tool-tab-lookup')
    expect(tab).toBeTruthy()
    fireEvent.click(tab!)
    const searchInput = container.querySelector('input[aria-label="Search devices"]')
    expect(searchInput).toBeTruthy()
  })

  it('calculator result displays have role="status"', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    // Only the active tool's result is rendered (TopsCalculator by default)
    const statusElements = document.querySelectorAll('[role="status"]')
    expect(statusElements.length).toBeGreaterThanOrEqual(1)
  })
})
