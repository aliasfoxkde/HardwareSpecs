import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

describe('Reduced motion support', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
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

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('LandingPage renders with reduced motion preference', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<LandingPage />, { wrapper: Wrapper })
    expect(screen.getByText('Compare Every Chip.')).toBeInTheDocument()
  })

  it('LandingPage renders without reduced motion preference', () => {
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

    render(<LandingPage />, { wrapper: Wrapper })
    expect(screen.getByText('Compare Every Chip.')).toBeInTheDocument()
  })

  it('matchMedia API is available for reduced motion detection', () => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    expect(mql).toBeDefined()
    expect(typeof mql.matches).toBe('boolean')
  })
})
