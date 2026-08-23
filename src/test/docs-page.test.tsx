import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { DocsPage } from '@/pages/DocsPage'

// Mock clipboard
vi.stubGlobal('navigator', {
  clipboard: { writeText: vi.fn() },
})

function Wrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

describe('DocsPage', () => {
  beforeEach(() => {
    vi.spyOn(performance, 'now').mockReturnValue(10)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic rendering', () => {
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

    it('renders Quick Start section', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      expect(screen.getByText(/Quick Start/i)).toBeDefined()
      expect(screen.getByText(/Base URL/i)).toBeDefined()
    })

    it('shows correct default tab', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      expect(screen.getByRole('tab', { name: 'Endpoints' }).getAttribute('aria-selected')).toBe('true')
    })

    it('renders HTTP method badges', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      expect(screen.getAllByText('GET').length).toBeGreaterThan(0)
      expect(screen.getAllByText('POST').length).toBeGreaterThan(0)
    })
  })

  describe('Tab switching', () => {
    it('switches to types tab on click', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('DeviceCategory')).toBeDefined()
    })

    it('switches back to endpoints tab', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      fireEvent.click(screen.getByRole('tab', { name: 'Endpoints' }))
      expect(screen.getByRole('tab', { name: 'Endpoints' }).getAttribute('aria-selected')).toBe('true')
    })

    it('types tab shows type definitions', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('DeviceListItem')).toBeDefined()
    })
  })

  describe('Endpoint selection', () => {
    it('shows empty state when no endpoint selected', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      expect(screen.getByText(/Select an endpoint from the sidebar/i)).toBeDefined()
    })

    it('shows endpoint details when clicked', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      expect(screen.getByText('/api/vendors')).toBeDefined()
      expect(screen.getByText('Get all hardware vendors')).toBeDefined()
    })

    it('shows parameters section for getDevices', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getDevices'))
      expect(screen.getByText('Parameters')).toBeDefined()
    })

    it('does not show parameters for getVendors', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      expect(screen.queryByText('Parameters')).toBeNull()
    })

    it('shows curl example', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      expect(screen.getByText('cURL')).toBeDefined()
    })

    it('shows response format section', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      // Use getAllByText since there may be multiple
      expect(screen.getAllByText(/Response Format/i).length).toBeGreaterThan(0)
    })

    it('selects different endpoint updates content', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getDevices'))
      expect(screen.getByText('/api/devices')).toBeDefined()
      fireEvent.click(screen.getByText('getStats'))
      expect(screen.getByText('/api/stats')).toBeDefined()
    })
  })

  describe('Keyboard navigation', () => {
    it('handles ArrowRight key on tabs', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      const endpointsTab = screen.getByRole('tab', { name: 'Endpoints' })
      endpointsTab.focus()
      fireEvent.keyDown(endpointsTab, { key: 'ArrowRight' })
      expect(screen.getByRole('tab', { name: 'Types' }).getAttribute('aria-selected')).toBe('true')
    })
  })

  describe('Copy buttons', () => {
    it('has copy buttons', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      expect(screen.getAllByRole('button', { name: /Copy/i }).length).toBeGreaterThan(0)
    })
  })

  describe('Try it Live section', () => {
    it('shows live example section when endpoint selected', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      expect(screen.getByText('Try it Live')).toBeDefined()
    })

    it('shows input for endpoint with params', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getDevices'))
      expect(screen.getByLabelText('API parameter input')).toBeDefined()
    })

    it('shows placeholder for required param on getDevice', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getDevice'))
      expect(screen.getByPlaceholderText(/deviceId/i)).toBeDefined()
    })

    it('shows "No parameters needed" for getStats', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getStats'))
      expect(screen.getByPlaceholderText('No parameters needed')).toBeDefined()
    })
  })
})
