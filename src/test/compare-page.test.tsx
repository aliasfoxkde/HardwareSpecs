import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ComparePage } from '@/pages/ComparePage'

// Mock API functions
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api')
  return {
    ...actual,
    searchDevices: vi.fn().mockReturnValue([]),
    compareDevices: vi.fn().mockReturnValue([]),
    getDeviceMetrics: vi.fn().mockReturnValue(null),
  }
})

// Mock export
vi.mock('@/lib/export', () => ({
  downloadCSV: vi.fn(),
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('ComparePage', () => {
  it('renders empty state heading', () => {
    render(<ComparePage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /compare/i })).toBeDefined()
  })

  it('renders search placeholder', () => {
    render(<ComparePage />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText(/Search for a device/i)).toBeDefined()
  })

  it('renders description text', () => {
    render(<ComparePage />, { wrapper: Wrapper })
    expect(screen.getByText(/Select devices to compare/i)).toBeDefined()
  })

  it('renders with URL params (empty selection)', () => {
    render(<MemoryRouter initialEntries={['/compare']}><ComparePage /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /compare/i })).toBeDefined()
  })

  it('renders empty comparison table when no devices selected', () => {
    render(<ComparePage />, { wrapper: Wrapper })
    // Should show instructions to add devices
    expect(screen.getByText(/Select devices to compare/i)).toBeDefined()
  })

  it('has accessible structure', () => {
    render(<ComparePage />, { wrapper: Wrapper })
    const heading = screen.getByRole('heading', { name: /compare/i })
    expect(heading).toBeDefined()
  })
})
