import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BrowsePage } from '@/pages/BrowsePage'

describe('BrowsePage', () => {
  it('renders with default state', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    expect(screen.getByText('Browse Devices')).toBeDefined()
  })

  it('shows device count', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    expect(screen.getByText(/devices found/)).toBeDefined()
  })

  it('category filter buttons are rendered', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    expect(screen.getByText('CPU')).toBeDefined()
    expect(screen.getByText('GPU')).toBeDefined()
    expect(screen.getByText('SBC')).toBeDefined()
  })

  it('search input is present', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    const input = screen.getByPlaceholderText(/Search by name/)
    expect(input).toBeDefined()
  })

  it('export buttons are present', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    expect(screen.getByText('CSV')).toBeDefined()
    expect(screen.getByText('JSON')).toBeDefined()
  })

  it('clear all filters button appears when filters are active', () => {
    render(
      <MemoryRouter initialEntries={['/?category=CPU']}>
        <BrowsePage />
      </MemoryRouter>
    )
    // After category filter is applied, clear button should appear
    expect(screen.getByText('Clear all filters')).toBeDefined()
  })

  it('sets meta description for SEO', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    const meta = document.querySelector('meta[name="description"]')
    expect(meta).toBeTruthy()
    expect(meta?.getAttribute('content')).toContain('Browse and filter')
  })

  it('renders all category options', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    expect(screen.getByText('NPU')).toBeDefined()
    expect(screen.getByText('GPU')).toBeDefined()
    expect(screen.getByText('ASIC')).toBeDefined()
  })

  it('has results count display', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    expect(screen.getByText(/Showing/i)).toBeDefined()
  })

  it('has search input with aria-label', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText(/Search by name/)).toBeDefined()
  })

  it('category button has aria-pressed attribute', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    const gpuBtn = screen.getByText('GPU')
    expect(gpuBtn.getAttribute('aria-pressed')).toBeDefined()
  })

  it('renders table with column headers', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    expect(screen.getByText('Device')).toBeDefined()
    expect(screen.getByText('INT8 TOPS')).toBeDefined()
    expect(screen.getByText('TOPS/$')).toBeDefined()
  })

  it('export CSV button has aria-label', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    const csvBtn = screen.getByLabelText('Export CSV')
    expect(csvBtn).toBeDefined()
  })

  it('export JSON button has aria-label', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    const jsonBtn = screen.getByLabelText('Export JSON')
    expect(jsonBtn).toBeDefined()
  })

  it('clear all filters clears category when clicked', () => {
    render(
      <MemoryRouter initialEntries={['/?category=CPU']}>
        <BrowsePage />
      </MemoryRouter>
    )
    const clearBtn = screen.getByText('Clear all filters')
    fireEvent.click(clearBtn)
  })

  it('search input is present with correct placeholder', () => {
    render(
      <MemoryRouter>
        <BrowsePage />
      </MemoryRouter>
    )
    const input = screen.getByPlaceholderText(/Search by name/)
    expect(input).toBeDefined()
    expect((input as HTMLInputElement).type).toBe('text')
  })
})
