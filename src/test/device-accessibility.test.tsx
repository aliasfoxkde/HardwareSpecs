import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { DevicePage } from '@/pages/DevicePage'

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
  return (
    <MemoryRouter initialEntries={['/device/nvidia-rtx-5090']}>
      <Routes>
        <Route path="/device/:deviceId" element={children} />
      </Routes>
    </MemoryRouter>
  )
}

describe('DevicePage accessibility', () => {
  it('breadcrumb has aria-label', () => {
    render(<DevicePage />, { wrapper: Wrapper })
    const nav = document.querySelector('nav[aria-label="Breadcrumb"]')
    expect(nav).toBeTruthy()
  })

  it('specifications section has aria-label on table', () => {
    render(<DevicePage />, { wrapper: Wrapper })
    const table = document.querySelector('[aria-label="Device specifications"]')
    expect(table).toBeTruthy()
  })

  it('compute capabilities section has aria-label', () => {
    render(<DevicePage />, { wrapper: Wrapper })
    const table = document.querySelector('[aria-label="Compute capabilities"]')
    expect(table).toBeTruthy()
  })

  it('source and buy links have aria-label', () => {
    render(<DevicePage />, { wrapper: Wrapper })
    const sourceLink = document.querySelector('a[aria-label^="Source:"]')
    const buyLink = document.querySelector('a[aria-label^="Buy "]')
    expect(sourceLink || buyLink).toBeTruthy()
  })
})
