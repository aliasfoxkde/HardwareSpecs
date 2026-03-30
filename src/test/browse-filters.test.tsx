import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
