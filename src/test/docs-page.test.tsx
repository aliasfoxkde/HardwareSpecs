import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { DocsPage } from '@/pages/DocsPage'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

describe('DocsPage', () => {
  it('renders page header', () => {
    render(<DocsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: 'API Documentation' })).toBeDefined()
  })

  it('renders sidebar with endpoint list', () => {
    render(<DocsPage />, { wrapper: Wrapper })
    expect(screen.getByText('getVendors')).toBeDefined()
    expect(screen.getByText('getDevices')).toBeDefined()
  })

  it('renders doc tabs', () => {
    render(<DocsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('tab', { name: 'Endpoints' })).toBeDefined()
    expect(screen.getByRole('tab', { name: 'Types' })).toBeDefined()
  })

  it('renders sidebar endpoints section', () => {
    render(<DocsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: 'Endpoints' })).toBeDefined()
  })

  it('switches to types tab on click', () => {
    render(<DocsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
    // Types tab shows type definitions - look for Vendor type which is first
    expect(screen.getByText('Vendor')).toBeDefined()
  })

  it('renders Quick Start section', () => {
    render(<DocsPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Quick Start/i)).toBeDefined()
    expect(screen.getByText(/Base URL/i)).toBeDefined()
  })

  it('renders response format info', () => {
    render(<DocsPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Response Format/i)).toBeDefined()
  })

  it('has accessible tabs with aria-selected', () => {
    render(<DocsPage />, { wrapper: Wrapper })
    const endpointsTab = screen.getByRole('tab', { name: 'Endpoints' })
    expect(endpointsTab.getAttribute('aria-selected')).toBe('true')
  })

  it('switches back to endpoints tab', () => {
    render(<DocsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
    fireEvent.click(screen.getByRole('tab', { name: 'Endpoints' }))
    expect(screen.getByRole('tab', { name: 'Endpoints' }).getAttribute('aria-selected')).toBe('true')
  })
})
