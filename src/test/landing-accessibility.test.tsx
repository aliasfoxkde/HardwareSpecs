import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'

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

describe('LandingPage accessibility', () => {
  it('Particles canvas has aria-hidden', () => {
    render(<LandingPage />, { wrapper: Wrapper })
    const canvas = document.querySelector('canvas[aria-hidden="true"]')
    expect(canvas).toBeTruthy()
  })

  it('category card links have aria-label', () => {
    render(<LandingPage />, { wrapper: Wrapper })
    const categoryLink = document.querySelector('a[aria-label*="devices"]')
    expect(categoryLink).toBeTruthy()
  })

  it('top value device links have aria-label', () => {
    render(<LandingPage />, { wrapper: Wrapper })
    const valueLink = document.querySelector('a[aria-label*="TOPS per dollar"]')
    expect(valueLink).toBeTruthy()
  })

  it('top GPU links have aria-label', () => {
    render(<LandingPage />, { wrapper: Wrapper })
    const gpuLink = document.querySelector('a[aria-label*="TOPS"]')
    expect(gpuLink).toBeTruthy()
  })
})
