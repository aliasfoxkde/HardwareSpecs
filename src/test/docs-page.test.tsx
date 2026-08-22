import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    // Sidebar has h3 with "Endpoints" text
    expect(screen.getByRole('heading', { name: 'Endpoints' })).toBeDefined()
  })
})
