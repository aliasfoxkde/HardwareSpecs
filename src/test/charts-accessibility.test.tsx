import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChartsPage } from '@/pages/ChartsPage'

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
