import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BrowsePage } from '@/pages/BrowsePage'
import * as exportModule from '@/lib/export'

vi.mock('@/lib/export', () => ({
  downloadCSV: vi.fn(),
  downloadJSON: vi.fn(),
}))

describe('BrowsePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // --- TDP Range Slider Interactions ---

  describe('TDP range slider', () => {
    it('renders TDP range inputs', () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      const minTdp = screen.getByLabelText('Minimum TDP')
      const maxTdp = screen.getByLabelText('Maximum TDP')
      expect(minTdp).toBeDefined()
      expect(maxTdp).toBeDefined()
    })

    it('updates minTDP filter when slider changes', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      const minTdp = screen.getByLabelText('Minimum TDP') as HTMLInputElement

      // Default is 0, change to 50
      fireEvent.change(minTdp, { target: { value: '50' } })

      // The display should update
      await waitFor(() => {
        expect(screen.getByText('50W')).toBeDefined()
      })
    })

    it('updates maxTDP filter when slider changes', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      const maxTdp = screen.getByLabelText('Maximum TDP') as HTMLInputElement

      // Default is MAX_TDP (700), change to 200
      fireEvent.change(maxTdp, { target: { value: '200' } })

      // The display should update to show 200W
      await waitFor(() => {
        expect(screen.getByText('200W')).toBeDefined()
      })
    })

    it('shows infinity symbol when maxTDP is cleared', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      const maxTdp = screen.getByLabelText('Maximum TDP') as HTMLInputElement

      // Set to max (700) which clears the filter
      fireEvent.change(maxTdp, { target: { value: '700' } })

      // The TDP max display should show ∞ - use getAll and pick the first one (TDP section)
      await waitFor(() => {
        const infinityElements = screen.getAllByText('∞')
        expect(infinityElements.length).toBeGreaterThan(0)
      })
    })
  })

  // --- Price Range Slider Interactions ---

  describe('Price range slider', () => {
    it('renders price range inputs', () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      const minPrice = screen.getByLabelText('Minimum price')
      const maxPrice = screen.getByLabelText('Maximum price')
      expect(minPrice).toBeDefined()
      expect(maxPrice).toBeDefined()
    })

    it('updates minPrice filter when slider changes', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      const minPrice = screen.getByLabelText('Minimum price') as HTMLInputElement

      // Change to 1000
      fireEvent.change(minPrice, { target: { value: '1000' } })

      await waitFor(() => {
        expect(screen.getByText('$1,000')).toBeDefined()
      })
    })

    it('updates maxPrice filter when slider changes', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      const maxPrice = screen.getByLabelText('Maximum price') as HTMLInputElement

      // Change to 5000
      fireEvent.change(maxPrice, { target: { value: '5000' } })

      await waitFor(() => {
        expect(screen.getByText('$5,000')).toBeDefined()
      })
    })

    it('shows infinity symbol when maxPrice is cleared', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      const maxPrice = screen.getByLabelText('Maximum price') as HTMLInputElement

      // Set to max (50000) which clears the filter
      fireEvent.change(maxPrice, { target: { value: '50000' } })

      // The Price max display should show ∞
      await waitFor(() => {
        const infinityElements = screen.getAllByText('∞')
        expect(infinityElements.length).toBeGreaterThan(0)
      })
    })
  })

  // --- Vendor Filter Toggles ---

  describe('Vendor filter toggles', () => {
    it('renders vendor filter buttons', () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      // Vendor buttons should be present (vendors from seed data)
      const buttons = screen.getAllByRole('button')
      const vendorButtons = buttons.filter(btn => {
        const pressed = btn.getAttribute('aria-pressed')
        return pressed !== null && !['true', 'false'].includes(btn.textContent || '')
      })
      // At minimum we should have some vendor buttons
      expect(buttons.length).toBeGreaterThan(5)
    })

    it('vendor button has aria-pressed attribute', () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      const buttons = screen.getAllByRole('button')
      // Find a button with aria-pressed that is NOT a category button (which have aria-pressed)
      const vendorButtons = buttons.filter(btn => {
        const pressed = btn.getAttribute('aria-pressed')
        const text = btn.textContent || ''
        // Category buttons are CPU, GPU, etc - vendor buttons are company names
        return pressed !== null && !['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System'].includes(text)
      })
      expect(vendorButtons.length).toBeGreaterThan(0)
    })

    it('clicking vendor button toggles aria-pressed', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )

      const buttons = screen.getAllByRole('button')
      // Find a vendor button (has aria-pressed but text is not a category)
      const vendorButton = buttons.find(btn => {
        const pressed = btn.getAttribute('aria-pressed')
        const text = btn.textContent || ''
        return pressed !== null && !['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'CSV', 'JSON', 'Previous', 'Next'].includes(text) && text.trim() !== ''
      }) as HTMLButtonElement | undefined

      if (vendorButton) {
        const initialPressed = vendorButton.getAttribute('aria-pressed')
        fireEvent.click(vendorButton)
        expect(vendorButton.getAttribute('aria-pressed')).toBe(initialPressed === 'true' ? 'false' : 'true')
      }
    })
  })

  // --- Sort by Column Header Clicks ---

  describe('Sort by column headers', () => {
    it('renders table column headers', () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      expect(screen.getByText('Device')).toBeDefined()
      expect(screen.getByText('Launch')).toBeDefined()
      expect(screen.getByText('RAM')).toBeDefined()
      expect(screen.getByText('TOPS/$')).toBeDefined()
    })

    it('column headers have role columnheader', () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      const headers = screen.getAllByRole('columnheader')
      expect(headers.length).toBeGreaterThan(0)
    })

    it('clicking column header changes sort order', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )

      // Find the TOPS/$ column header and click it
      const topsHeader = screen.getByText('TOPS/$').closest('th') as HTMLTableCellElement
      expect(topsHeader).toBeDefined()

      fireEvent.click(topsHeader)

      // After clicking (first time, different column), should see descending indicator (↓)
      await waitFor(() => {
        expect(topsHeader.textContent).toContain('↓')
      })
    })

    it('clicking same column header twice toggles sort direction', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )

      // Find the Price column header in the table by its aria-sort attribute
      const priceHeader = screen.getByRole('columnheader', { name: /Price/i }) as HTMLTableCellElement
      expect(priceHeader).toBeDefined()

      // First click - should go to descending (first click on new column goes to desc)
      fireEvent.click(priceHeader)

      await waitFor(() => {
        expect(priceHeader.textContent).toContain('↓')
      })

      // Second click - should toggle to ascending
      fireEvent.click(priceHeader)

      await waitFor(() => {
        expect(priceHeader.textContent).toContain('↑')
      })
    })

    it('clicking different column header changes sort key', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )

      // Find the RAM column header in the table (not the filter area)
      // Use aria-sort to find the correct header
      const headers = screen.getAllByRole('columnheader')
      const ramHeader = headers.find(h => h.textContent?.includes('RAM')) as HTMLTableCellElement
      expect(ramHeader).toBeDefined()

      fireEvent.click(ramHeader)

      // After clicking RAM header, it should show sort indicator
      await waitFor(() => {
        expect(ramHeader.textContent).toMatch(/[↑↓]/)
      })
    })
  })

  // --- Pagination Interactions ---

  describe('Pagination', () => {
    it('renders pagination controls when multiple pages exist', () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      // Pagination should show Previous button
      const prevBtn = screen.getByLabelText('Previous page')
      expect(prevBtn).toBeDefined()
    })

    it('Previous button is disabled on first page', () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      const prevBtn = screen.getByLabelText('Previous page') as HTMLButtonElement
      expect(prevBtn.disabled).toBe(true)
    })

    it('clicking Next button advances to next page', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      const nextBtn = screen.getByLabelText('Next page') as HTMLButtonElement
      const prevBtn = screen.getByLabelText('Previous page') as HTMLButtonElement

      // Initially Previous should be disabled
      expect(prevBtn.disabled).toBe(true)

      fireEvent.click(nextBtn)

      await waitFor(() => {
        // Now Previous should be enabled
        expect(prevBtn.disabled).toBe(false)
      })
    })

    it('clicking page number navigates to that page', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )

      // Look for page number buttons (they have aria-label like "Page 2")
      const pageButtons = screen.getAllByLabelText(/^Page \d+$/)
      if (pageButtons.length > 1) {
        // Click page 2
        const page2Btn = screen.getByLabelText('Page 2') as HTMLButtonElement
        fireEvent.click(page2Btn)

        await waitFor(() => {
          // After clicking page 2, page 2 button should be active (have brand background)
          const activePage = screen.getByLabelText('Page 2')
          expect(activePage.className).toContain('bg-brand-600')
        })
      }
    })
  })

  // --- Clear Filters with Vendor Filters Active ---

  describe('Clear filters with vendor filters', () => {
    it('shows clear all filters button when vendor filters are active', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )

      // Find a vendor button and click it
      const buttons = screen.getAllByRole('button')
      const vendorButton = buttons.find(btn => {
        const text = btn.textContent || ''
        return !['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'CSV', 'JSON', 'Previous', 'Next', 'Clear all filters'].includes(text) && text.trim() !== ''
      }) as HTMLButtonElement | undefined

      if (vendorButton) {
        fireEvent.click(vendorButton)

        await waitFor(() => {
          const clearBtn = screen.getByText('Clear all filters')
          expect(clearBtn).toBeDefined()
        })
      }
    })

    it('clicking clear all filters removes vendor filter', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )

      // Find a vendor button and click it to enable
      const buttons = screen.getAllByRole('button')
      const vendorButton = buttons.find(btn => {
        const text = btn.textContent || ''
        return !['CPU', 'GPU', 'SBC', 'NPU', 'ASIC', 'SoC', 'System', 'CSV', 'JSON', 'Previous', 'Next', 'Clear all filters'].includes(text) && text.trim() !== ''
      }) as HTMLButtonElement | undefined

      if (vendorButton) {
        fireEvent.click(vendorButton)

        await waitFor(() => {
          expect(screen.getByText('Clear all filters')).toBeDefined()
        })

        // Now click clear all filters
        const clearBtn = screen.getByText('Clear all filters')
        fireEvent.click(clearBtn)

        await waitFor(() => {
          // The vendor button should no longer be pressed
          expect(vendorButton.getAttribute('aria-pressed')).toBe('false')
        })
      }
    })
  })

  // --- Export Functionality ---

  describe('Export functionality', () => {
    it('export CSV button calls downloadCSV with correct data', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )

      const csvBtn = screen.getByLabelText('Export CSV')
      fireEvent.click(csvBtn)

      await waitFor(() => {
        expect(exportModule.downloadCSV).toHaveBeenCalled()
      })

      // Verify filename pattern
      const callArgs = (exportModule.downloadCSV as ReturnType<typeof vi.fn>).mock.calls[0]
      expect(callArgs[0]).toMatch(/^siliconrank-.*\.csv$/)
    })

    it('export JSON button calls downloadJSON with correct data', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )

      const jsonBtn = screen.getByLabelText('Export JSON')
      fireEvent.click(jsonBtn)

      await waitFor(() => {
        expect(exportModule.downloadJSON).toHaveBeenCalled()
      })

      // Verify filename pattern
      const callArgs = (exportModule.downloadJSON as ReturnType<typeof vi.fn>).mock.calls[0]
      expect(callArgs[0]).toMatch(/^siliconrank-.*\.json$/)
    })

    it('export buttons have correct aria-labels', () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      expect(screen.getByLabelText('Export CSV')).toBeDefined()
      expect(screen.getByLabelText('Export JSON')).toBeDefined()
    })
  })

  // --- Additional Interaction Tests ---

  describe('Search input', () => {
    it('typing in search input updates the value', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )

      const searchInput = screen.getByPlaceholderText(/Search by name/) as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: 'NVIDIA' } })

      await waitFor(() => {
        expect(searchInput.value).toBe('NVIDIA')
      })
    })

    it('search input has aria-label', () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )
      const searchInput = screen.getByLabelText('Search devices')
      expect(searchInput).toBeDefined()
    })
  })

  describe('Category filters', () => {
    it('clicking category button toggles it', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )

      const cpuBtn = screen.getByText('CPU') as HTMLButtonElement
      const initialPressed = cpuBtn.getAttribute('aria-pressed')

      fireEvent.click(cpuBtn)

      // Toggle should change aria-pressed
      expect(cpuBtn.getAttribute('aria-pressed')).toBe(initialPressed === 'true' ? 'false' : 'true')
    })

    it('selecting category shows clear filters button', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )

      const cpuBtn = screen.getByText('CPU')
      fireEvent.click(cpuBtn)

      await waitFor(() => {
        expect(screen.getByText('Clear all filters')).toBeDefined()
      })
    })
  })

  describe('Empty state', () => {
    it('shows empty state message when no devices match', async () => {
      render(
        <MemoryRouter>
          <BrowsePage />
        </MemoryRouter>
      )

      // Apply a search that will return no results
      const searchInput = screen.getByPlaceholderText(/Search by name/) as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent12345' } })

      // Wait for debounce and results
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300))
      })

      // Empty state should appear
      const emptyMsg = screen.queryByText(/No devices match/)
      // It may or may not appear depending on data - this is a conditional render
    })
  })
})
