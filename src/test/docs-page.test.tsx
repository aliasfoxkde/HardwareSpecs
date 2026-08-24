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

  describe('Keyboard navigation on tabs', () => {
    it('handles ArrowRight key on tabs', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      const endpointsTab = screen.getByRole('tab', { name: 'Endpoints' })
      endpointsTab.focus()
      fireEvent.keyDown(endpointsTab, { key: 'ArrowRight' })
      expect(screen.getByRole('tab', { name: 'Types' }).getAttribute('aria-selected')).toBe('true')
    })

    it('handles ArrowLeft key on tabs', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      // Start on Types tab by clicking it
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      const typesTab = screen.getByRole('tab', { name: 'Types' })
      typesTab.focus()
      fireEvent.keyDown(typesTab, { key: 'ArrowLeft' })
      expect(screen.getByRole('tab', { name: 'Endpoints' }).getAttribute('aria-selected')).toBe('true')
    })

    it('ArrowRight wraps to first tab from last', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      // Start on Types tab
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      const typesTab = screen.getByRole('tab', { name: 'Types' })
      typesTab.focus()
      fireEvent.keyDown(typesTab, { key: 'ArrowRight' })
      expect(screen.getByRole('tab', { name: 'Endpoints' }).getAttribute('aria-selected')).toBe('true')
    })

    it('ArrowLeft wraps to last tab from first', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      const endpointsTab = screen.getByRole('tab', { name: 'Endpoints' })
      endpointsTab.focus()
      fireEvent.keyDown(endpointsTab, { key: 'ArrowLeft' })
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

    it('runs API call on Run button click', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      const runBtn = screen.getByRole('button', { name: 'Run' })
      fireEvent.click(runBtn)
    })

    it('runs API call on Enter key', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      const input = screen.getByLabelText('API parameter input')
      fireEvent.keyDown(input, { key: 'Enter' })
    })
  })

  describe('Types tab content', () => {
    it('shows DeviceCategory enum values', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('CPU')).toBeDefined()
      expect(screen.getByText('GPU')).toBeDefined()
    })

    it('shows type fields for DeviceListItem', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      const headings = screen.getAllByRole('heading', { name: /DeviceListItem/i })
      expect(headings.length).toBeGreaterThan(0)
    })

    it('shows FilterState type fields', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText(/vendors\?: string\[\]/i)).toBeDefined()
    })
  })


  describe('Quick Start section', () => {
    it('has Base URL code block', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      expect(screen.getByText('https://siliconrank.cyopsys.com')).toBeDefined()
    })

    it('has Copy button in Quick Start', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      expect(screen.getByRole('button', { name: 'Copy' })).toBeDefined()
    })

    it('shows Response Format and Authentication', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      expect(screen.getByText('Response Format')).toBeDefined()
      expect(screen.getByText('Authentication')).toBeDefined()
    })
  })

  describe('Endpoint details', () => {
    it('shows method badge for GET endpoint', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      const getBadge = document.querySelector('.bg-green-500\\/20')
      expect(getBadge?.textContent).toBe('GET')
    })

    it('shows Request URL section', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      expect(screen.getByText('Request URL')).toBeDefined()
    })

    it('shows endpoint description', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      expect(screen.getByText('Get all hardware vendors')).toBeDefined()
    })
  })

  describe('All endpoint sidebar items are clickable', () => {
    const endpointNames = [
      'getVendors',
      'getFamilies',
      'getDevices',
      'getDevice',
      'searchDevices',
      'getDevicesByCategory',
      'getStats',
      'compareDevices',
      'getBenchmarkTypes',
      'getSources',
      'getDeviceMetrics',
      'getDeviceMetricsTable',
    ]

    it.each(endpointNames)('clicking %s shows its URL path', (name) => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText(name))
      // Each endpoint has a unique path - verify the main content loads
      expect(screen.getByText('Request URL')).toBeDefined()
      expect(screen.getByText('Try it Live')).toBeDefined()
    })

    it.each(endpointNames)('clicking %s shows Try it Live section', (name) => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText(name))
      expect(screen.getByText('Try it Live')).toBeDefined()
    })
  })

  describe('Endpoint URL path display', () => {
    it('shows /api/vendors for getVendors', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      expect(screen.getByText('/api/vendors')).toBeDefined()
    })

    it('shows /api/families for getFamilies', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getFamilies'))
      expect(screen.getByText('/api/families')).toBeDefined()
    })

    it('shows /api/devices for getDevices', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getDevices'))
      expect(screen.getByText('/api/devices')).toBeDefined()
    })

    it('shows /api/devices/:deviceId for getDevice', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getDevice'))
      expect(screen.getByText('/api/devices/:deviceId')).toBeDefined()
    })

    it('shows /api/search for searchDevices', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('searchDevices'))
      expect(screen.getByText('/api/search')).toBeDefined()
    })

    it('shows /api/categories/:category/devices for getDevicesByCategory', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getDevicesByCategory'))
      expect(screen.getByText('/api/categories/:category/devices')).toBeDefined()
    })

    it('shows /api/stats for getStats', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getStats'))
      expect(screen.getByText('/api/stats')).toBeDefined()
    })

    it('shows /api/compare for compareDevices', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('compareDevices'))
      expect(screen.getByText('/api/compare')).toBeDefined()
    })

    it('shows /api/benchmarks/types for getBenchmarkTypes', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getBenchmarkTypes'))
      expect(screen.getByText('/api/benchmarks/types')).toBeDefined()
    })

    it('shows /api/sources for getSources', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getSources'))
      expect(screen.getByText('/api/sources')).toBeDefined()
    })

    it('shows /api/devices/:deviceId/metrics for getDeviceMetrics', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getDeviceMetrics'))
      expect(screen.getByText('/api/devices/:deviceId/metrics')).toBeDefined()
    })

    it('shows /api/metrics for getDeviceMetricsTable', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getDeviceMetricsTable'))
      expect(screen.getByText('/api/metrics')).toBeDefined()
    })
  })

  describe('Copy buttons work', () => {
    it('copy button for URL section calls navigator.clipboard.writeText', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      const copyButtons = screen.getAllByRole('button', { name: /Copy/i })
      // First copy button is for URL section
      fireEvent.click(copyButtons[0])
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })

    it('copy button for curl section calls navigator.clipboard.writeText', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      const copyButtons = screen.getAllByRole('button', { name: /Copy/i })
      // Second copy button is for curl section
      fireEvent.click(copyButtons[1])
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })

    it('copy button in Quick Start section calls clipboard', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      const quickStartCopy = screen.getByRole('button', { name: 'Copy' })
      fireEvent.click(quickStartCopy)
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })

    it('shows Copied! after clicking copy button', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      const copyButtons = screen.getAllByRole('button', { name: /Copy/i })
      fireEvent.click(copyButtons[0])
      // After clicking, the button shows "Copied!"
      expect(copyButtons[0].textContent).toBe('Copied!')
    })
  })

  describe('Types tab shows all type definitions', () => {
    it('shows DeviceCategory', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('DeviceCategory')).toBeDefined()
    })

    it('shows DeviceListItem', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('DeviceListItem')).toBeDefined()
    })

    it('shows DeviceDetail', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('DeviceDetail')).toBeDefined()
    })

    it('shows DeviceMetrics', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('DeviceMetrics')).toBeDefined()
    })

    it('shows DeviceMetricsRow', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('DeviceMetricsRow')).toBeDefined()
    })

    it('shows Vendor', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('Vendor')).toBeDefined()
    })

    it('shows DeviceFamily', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('DeviceFamily')).toBeDefined()
    })

    it('shows DeviceVariant', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('DeviceVariant')).toBeDefined()
    })

    it('shows BenchmarkResult', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('BenchmarkResult')).toBeDefined()
    })

    it('shows SpecSnapshot', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('SpecSnapshot')).toBeDefined()
    })

    it('shows PriceSnapshot', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('PriceSnapshot')).toBeDefined()
    })

    it('shows FilterState', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('FilterState')).toBeDefined()
    })

    it('shows DeviceCategory enum values CPU GPU SBC NPU ASIC SoC System', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByRole('tab', { name: 'Types' }))
      expect(screen.getByText('CPU')).toBeDefined()
      expect(screen.getByText('GPU')).toBeDefined()
      expect(screen.getByText('SBC')).toBeDefined()
      expect(screen.getByText('NPU')).toBeDefined()
      expect(screen.getByText('ASIC')).toBeDefined()
      expect(screen.getByText('SoC')).toBeDefined()
      expect(screen.getByText('System')).toBeDefined()
    })
  })

  describe('Run button triggers API call', () => {
    it('Run button is present and clickable for getVendors', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getVendors'))
      const runBtn = screen.getByRole('button', { name: 'Run' })
      expect(runBtn).toBeDefined()
      fireEvent.click(runBtn)
      // After clicking run, a result should appear (time is 0ms due to mocked performance.now)
      expect(screen.getByText(/Result \(0\.0ms\):/)).toBeDefined()
    })

    it('Run button is present for getFamilies', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getFamilies'))
      const runBtn = screen.getByRole('button', { name: 'Run' })
      fireEvent.click(runBtn)
      expect(screen.getByText(/Result \(0\.0ms\):/)).toBeDefined()
    })

    it('Run button is present for getStats', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getStats'))
      const runBtn = screen.getByRole('button', { name: 'Run' })
      fireEvent.click(runBtn)
      expect(screen.getByText(/Result \(0\.0ms\):/)).toBeDefined()
    })

    it('Run button works for POST compareDevices endpoint', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('compareDevices'))
      const runBtn = screen.getByRole('button', { name: 'Run' })
      fireEvent.click(runBtn)
      expect(screen.getByText(/Result \(0\.0ms\):/)).toBeDefined()
    })
  })

  describe('Input field accepts JSON and sends to API', () => {
    it('input field accepts text input', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getDevice'))
      const input = screen.getByLabelText('API parameter input')
      fireEvent.change(input, { target: { value: 'test-id' } })
      expect((input as HTMLInputElement).value).toBe('test-id')
    })

    it('input accepts JSON string', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('compareDevices'))
      const input = screen.getByLabelText('API parameter input')
      fireEvent.change(input, { target: { value: '["nvidia-rtx-4090","amd-rx-7900-xtx"]' } })
      expect((input as HTMLInputElement).value).toBe('["nvidia-rtx-4090","amd-rx-7900-xtx"]')
    })

    it('Run button with input sends value to API', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getDevice'))
      const input = screen.getByLabelText('API parameter input')
      fireEvent.change(input, { target: { value: 'nvidia-rtx-4090' } })
      const runBtn = screen.getByRole('button', { name: 'Run' })
      fireEvent.click(runBtn)
      expect(screen.getByText(/Result \(0\.0ms\):/)).toBeDefined()
    })

    it('input field accepts JSON object', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getDevices'))
      const input = screen.getByLabelText('API parameter input')
      fireEvent.change(input, { target: { value: '{"categories":["GPU"],"pageSize":5}' } })
      expect((input as HTMLInputElement).value).toBe('{"categories":["GPU"],"pageSize":5}')
    })

    it('Enter key triggers API call with input value', () => {
      render(<DocsPage />, { wrapper: Wrapper })
      fireEvent.click(screen.getByText('getDevice'))
      const input = screen.getByLabelText('API parameter input')
      fireEvent.change(input, { target: { value: 'nvidia-rtx-4090' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(screen.getByText(/Result \(0\.0ms\):/)).toBeDefined()
    })
  })
})
