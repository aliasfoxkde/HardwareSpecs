import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BrowsePage } from '@/pages/BrowsePage'

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

describe('BrowsePage accessibility', () => {
  it('search input has aria-label', () => {
    render(<BrowsePage />, { wrapper: Wrapper })
    const input = screen.getByLabelText('Search devices')
    expect(input).toBeDefined()
  })

  it('device count has role="status"', () => {
    render(<BrowsePage />, { wrapper: Wrapper })
    const status = document.querySelector('[role="status"][aria-live="polite"]')
    expect(status).toBeTruthy()
  })

  it('table has aria-label', () => {
    render(<BrowsePage />, { wrapper: Wrapper })
    const table = document.querySelector('table[aria-label="Device list"]')
    expect(table).toBeTruthy()
  })

  it('category buttons have aria-pressed', () => {
    render(<BrowsePage />, { wrapper: Wrapper })
    const buttons = screen.getAllByRole('button')
    const cpuButton = buttons.find(b => b.textContent === 'CPU')
    expect(cpuButton).toBeDefined()
    expect(cpuButton?.getAttribute('aria-pressed')).toBe('false')
  })

  it('export buttons have aria-label', () => {
    render(<BrowsePage />, { wrapper: Wrapper })
    expect(screen.getByLabelText('Export CSV')).toBeDefined()
    expect(screen.getByLabelText('Export JSON')).toBeDefined()
  })

  it('range sliders have aria-label', () => {
    render(<BrowsePage />, { wrapper: Wrapper })
    expect(screen.getByLabelText('Minimum TDP')).toBeDefined()
    expect(screen.getByLabelText('Maximum TDP')).toBeDefined()
    expect(screen.getByLabelText('Minimum price')).toBeDefined()
    expect(screen.getByLabelText('Maximum price')).toBeDefined()
  })
})
