import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ReportsPage } from '@/pages/ReportsPage'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

describe('ReportsPage', () => {
  it('renders page header', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /reports/i })).toBeDefined()
  })

  it('renders page heading', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: 'Reports' })).toBeDefined()
  })

  it('renders all report tabs', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('tab', { name: /Overview/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Categories/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Vendors/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Data Gaps/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Top Performers/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Price Analysis/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Process Node/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Memory/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Vendor Deep Dive/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Timeline/i })).toBeDefined()
  })

  it('shows Overview report by default', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('tabpanel')).toBeDefined()
  })

  it('switches to Top Performers tab on click', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('tab', { name: /Top Performers/i }))
  })

  it('switches to Data Gaps tab on click', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('tab', { name: /Data Gaps/i }))
  })

  it('switches to Price Analysis tab on click', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('tab', { name: /Price Analysis/i }))
  })

  it('switches to Categories tab on click', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('tab', { name: /Categories/i }))
  })

  it('has accessible tabpanel with aria-labelledby', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    const tabpanel = screen.getByRole('tabpanel')
    expect(tabpanel.id).toMatch(/report-panel/)
  })

  it('renders tablist with aria-label', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('tablist', { name: /Report selection/i })).toBeDefined()
  })
})
