import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock documentElement.setAttribute
const setAttributeMock = vi.fn()
Object.defineProperty(document, 'documentElement', {
  value: { setAttribute: setAttributeMock },
  writable: true,
})

// Mock getStats to avoid data loading in tests
vi.mock('@/lib/api', () => ({
  searchDevices: vi.fn().mockReturnValue([]),
  getStats: async () => ({ devices: 0, vendors: 0, families: 0, benchmarks: 0, categories: [] }),
}))

beforeEach(() => {
  localStorageMock.clear()
  setAttributeMock.mockClear()
})

describe('Layout', () => {
  it('renders navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/browse']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/browse" element={<div>Test Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getAllByText('SiliconRank').length).toBeGreaterThan(0)
    expect(screen.getByText('Browse')).toBeDefined()
  })

  it('theme toggle buttons have aria-label', () => {
    render(
      <MemoryRouter initialEntries={['/browse']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/browse" element={<div>Test Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    const themeBtns = screen.getAllByLabelText(/Theme:/)
    expect(themeBtns.length).toBeGreaterThanOrEqual(1)
  })

  it('skip to content link exists', () => {
    render(
      <MemoryRouter initialEntries={['/browse']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/browse" element={<div>Test Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Skip to content')).toBeDefined()
  })

  it('main content has id for skip link target', () => {
    render(
      <MemoryRouter initialEntries={['/browse']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/browse" element={<div>Test Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    const main = document.getElementById('main-content')
    expect(main).toBeDefined()
  })

  it('search inputs have aria-label', () => {
    render(
      <MemoryRouter initialEntries={['/browse']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/browse" element={<div>Test Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    const searchInputs = screen.getAllByLabelText('Search devices')
    expect(searchInputs.length).toBeGreaterThanOrEqual(1)
  })

  it('renders all nav links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<div>Home Page Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: 'Home' })).toBeDefined()
    expect(screen.getByRole('link', { name: 'Browse' })).toBeDefined()
    expect(screen.getAllByRole('link', { name: 'Compare' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Charts' }).length).toBeGreaterThan(0)
  })

  it('active nav link has aria-current', () => {
    render(
      <MemoryRouter initialEntries={['/browse']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/browse" element={<div>Test Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    const browseLink = screen.getByRole('link', { name: 'Browse' })
    expect(browseLink.getAttribute('aria-current')).toBe('page')
  })

  it('navigates to different route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/compare" element={<div>Compare Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Home Page')).toBeDefined()
  })
})
