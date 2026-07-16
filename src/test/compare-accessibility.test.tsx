import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ComparePage } from '@/pages/ComparePage'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

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

describe('ComparePage accessibility', () => {
  it('empty state renders with search input having aria-label', () => {
    render(<ComparePage />, { wrapper: Wrapper })
    const input = document.querySelector('input[aria-label="Search devices to compare"]')
    expect(input).toBeTruthy()
  })

  it('sets meta description for SEO', () => {
    render(<ComparePage />, { wrapper: Wrapper })
    const meta = document.querySelector('meta[name="description"]')
    expect(meta).toBeTruthy()
    expect(meta?.getAttribute('content')).toContain('Compare up to 6')
  })

  it('renders heading', () => {
    render(<ComparePage />, { wrapper: Wrapper })
    expect(document.querySelector('h1')).toBeTruthy()
  })
})
