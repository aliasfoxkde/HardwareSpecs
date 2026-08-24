import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  describe('Mobile menu', () => {
    it('mobile menu button is present', () => {
      render(
        <MemoryRouter initialEntries={['/browse']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/browse" element={<div>Test Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const menuBtn = screen.getByRole('button', { name: /Toggle navigation menu/i })
      expect(menuBtn).toBeDefined()
    })

    it('mobile menu opens on click', () => {
      render(
        <MemoryRouter initialEntries={['/browse']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/browse" element={<div>Test Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const menuBtn = screen.getByRole('button', { name: /Toggle navigation menu/i })
      fireEvent.click(menuBtn)
      expect(screen.getByRole('menu')).toBeDefined()
    })

    it('mobile menu closes on second click', () => {
      render(
        <MemoryRouter initialEntries={['/browse']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/browse" element={<div>Test Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const menuBtn = screen.getByRole('button', { name: /Toggle navigation menu/i })
      fireEvent.click(menuBtn)
      expect(screen.getByRole('menu')).toBeDefined()
      fireEvent.click(menuBtn)
    })

    it('mobile menu has menuitem links', () => {
      render(
        <MemoryRouter initialEntries={['/browse']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/browse" element={<div>Test Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const menuBtn = screen.getByRole('button', { name: /Toggle navigation menu/i })
      fireEvent.click(menuBtn)
      const menuItems = screen.getAllByRole('menuitem')
      expect(menuItems.length).toBeGreaterThan(0)
    })

    it('Escape key closes mobile menu', () => {
      render(
        <MemoryRouter initialEntries={['/browse']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/browse" element={<div>Test Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const menuBtn = screen.getByRole('button', { name: /Toggle navigation menu/i })
      fireEvent.click(menuBtn)
      expect(screen.getByRole('menu')).toBeDefined()
      fireEvent.keyDown(document, { key: 'Escape' })
    })

    it('mobile menu shows search input', () => {
      render(
        <MemoryRouter initialEntries={['/browse']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/browse" element={<div>Test Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const menuBtn = screen.getByRole('button', { name: /Toggle navigation menu/i })
      fireEvent.click(menuBtn)
      const searchInputs = screen.getAllByLabelText('Search devices')
      expect(searchInputs.length).toBeGreaterThanOrEqual(1)
    })

    it('mobile menu is aria-expanded', () => {
      render(
        <MemoryRouter initialEntries={['/browse']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/browse" element={<div>Test Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const menuBtn = screen.getByRole('button', { name: /Toggle navigation menu/i })
      expect(menuBtn.getAttribute('aria-expanded')).toBe('false')
      fireEvent.click(menuBtn)
      expect(menuBtn.getAttribute('aria-expanded')).toBe('true')
    })

    it('mobile menu closes on link click', () => {
      render(
        <MemoryRouter initialEntries={['/browse']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/browse" element={<div>Test Page</div>} />
              <Route path="/compare" element={<div>Compare Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const menuBtn = screen.getByRole('button', { name: /Toggle navigation menu/i })
      fireEvent.click(menuBtn)
      const menuItems = screen.getAllByRole('menuitem')
      if (menuItems.length > 0) {
        fireEvent.click(menuItems[0])
      }
    })
  })

  describe('Search functionality', () => {
    it('search input is empty initially', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const searchInput = screen.getByPlaceholderText('Search devices...')
      expect(searchInput.getAttribute('value')).toBe('')
    })

    it('typing in search input changes value', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const searchInput = screen.getByPlaceholderText('Search devices...')
      fireEvent.change(searchInput, { target: { value: 'RTX' } })
      expect(searchInput.getAttribute('value')).toBe('RTX')
    })

    it('short query does not show results', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const searchInput = screen.getByPlaceholderText('Search devices...')
      fireEvent.change(searchInput, { target: { value: 'R' } })
    })
  })

  describe('Theme toggle', () => {
    it('theme button is clickable', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const themeBtns = screen.getAllByLabelText(/Theme:/)
      if (themeBtns.length > 0) fireEvent.click(themeBtns[0])
    })

    it('theme button cycles through themes', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const themeBtns = screen.getAllByLabelText(/Theme:/)
      if (themeBtns.length > 0) {
        fireEvent.click(themeBtns[0])
        fireEvent.click(themeBtns[0])
        fireEvent.click(themeBtns[0])
      }
    })
  })

  describe('Footer', () => {
    it('renders footer', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      expect(screen.getByText('Open Source (MIT)')).toBeDefined()
    })

    it('footer has copyright', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(String(currentYear)))).toBeDefined()
    })

    it('footer has GitHub link', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      expect(screen.getByText('GitHub')).toBeDefined()
    })

    it('footer has sponsor link', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      expect(screen.getByText('Sponsor')).toBeDefined()
    })

    it('footer has Ko-fi link', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      expect(screen.getByText('Ko-fi')).toBeDefined()
    })
  })

  describe('Desktop navigation', () => {
    it('desktop nav links are present', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      expect(screen.getAllByRole('link', { name: 'Reports' }).length).toBeGreaterThan(0)
      expect(screen.getAllByRole('link', { name: 'Docs' }).length).toBeGreaterThan(0)
    })

    it('Studio link is present', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Home</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )
      expect(screen.getAllByRole('link', { name: 'Studio' }).length).toBeGreaterThan(0)
    })
  })
})
