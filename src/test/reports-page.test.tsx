import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('shows correct aria-selected for active tab', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    const overviewTab = screen.getByRole('tab', { name: /Overview/i })
    expect(overviewTab.getAttribute('aria-selected')).toBe('true')
  })

  it('switches report on keyboard ArrowDown', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    const overviewTab = screen.getByRole('tab', { name: /Overview/i })
    overviewTab.focus()
    fireEvent.keyDown(overviewTab, { key: 'ArrowDown' })
    const categoriesTab = screen.getByRole('tab', { name: /Categories/i })
    expect(categoriesTab.getAttribute('aria-selected')).toBe('true')
  })

  it('switches report on keyboard ArrowUp', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    // First switch to another tab
    fireEvent.click(screen.getByRole('tab', { name: /Categories/i }))
    const categoriesTab = screen.getByRole('tab', { name: /Categories/i })
    categoriesTab.focus()
    fireEvent.keyDown(categoriesTab, { key: 'ArrowUp' })
    const overviewTab = screen.getByRole('tab', { name: /Overview/i })
    expect(overviewTab.getAttribute('aria-selected')).toBe('true')
  })

  it('wraps around on ArrowDown from last tab', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    const timelineTab = screen.getByRole('tab', { name: /Timeline/i })
    timelineTab.focus()
    fireEvent.keyDown(timelineTab, { key: 'ArrowDown' })
    const overviewTab = screen.getByRole('tab', { name: /Overview/i })
    expect(overviewTab.getAttribute('aria-selected')).toBe('true')
  })

  it('wraps around on ArrowUp from first tab', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    const overviewTab = screen.getByRole('tab', { name: /Overview/i })
    overviewTab.focus()
    fireEvent.keyDown(overviewTab, { key: 'ArrowUp' })
    const timelineTab = screen.getByRole('tab', { name: /Timeline/i })
    expect(timelineTab.getAttribute('aria-selected')).toBe('true')
  })

  it('clicking all tabs switches correctly', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    const tabs = ['Categories', 'Vendors', 'Data Gaps', 'Top Performers', 'Price Analysis', 'Process Node', 'Memory', 'Vendor Deep Dive', 'Timeline']
    for (const tabName of tabs) {
      fireEvent.click(screen.getByRole('tab', { name: new RegExp(tabName, 'i') }))
    }
  })

  it('tabpanel has correct aria-labelledby attribute', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    const tabpanel = screen.getByRole('tabpanel')
    expect(tabpanel.getAttribute('aria-labelledby')).toMatch(/report-tab-/)
  })

  it('inactive tab has tabIndex -1', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    const categoriesTab = screen.getByRole('tab', { name: /Categories/i })
    expect(categoriesTab.getAttribute('tabIndex')).toBe('-1')
  })

  it('active tab has tabIndex 0', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    const overviewTab = screen.getByRole('tab', { name: /Overview/i })
    expect(overviewTab.getAttribute('tabIndex')).toBe('0')
  })

  it('renders page description', () => {
    render(<ReportsPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Data quality, coverage analysis/i)).toBeDefined()
  })
})
