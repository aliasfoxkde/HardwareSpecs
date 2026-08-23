import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ComparePage } from '@/pages/ComparePage'
import type { DeviceListItem, DeviceDetail, DeviceMetrics } from '@/lib/api'

/* eslint-disable @typescript-eslint/no-explicit-any */
const makeSearchResult = (id: string, name: string, vendor = 'NVIDIA'): DeviceListItem => ({
  device: { deviceId: id, modelName: name, category: 'GPU' as any, familyId: 'f1', vendorId: 'nvidia', architecture: 'Ada Lovelace', launchDate: '2023-01-01', tdpWatts: 300, cores: 16384, threads: 16384, memoryCapacityGB: 24, memoryType: 'GDDR6X', processNm: 5 } as any,
  vendor: { vendorId: 'nvidia', name: vendor, website: 'https://nvidia.com', country: 'US' } as any,
  family: { familyId: 'f1', name: 'GeForce RTX 4090', category: 'GPU' as any, vendorId: 'nvidia', architecture: 'Ada Lovelace', deviceIds: [id] } as any,
  metrics: { effectiveInt8Tops: 1321, topsPerDollar: 0.83, topsPerWatt: 4.4, perfPerDollar: 50, perfPerWatt: 275, dataCompleteness: 0.9 },
}) as DeviceListItem
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
const makeComparedDevice = (id: string, name: string, price = 1599): DeviceDetail => ({
  device: { deviceId: id, modelName: name, category: 'GPU' as any, familyId: 'f1', vendorId: 'nvidia', architecture: 'Ada Lovelace', launchDate: '2023-01-01', tdpWatts: 300, cores: 16384, threads: 16384, memoryCapacityGB: 24, memoryType: 'GDDR6X', processNm: 5 } as any,
  vendor: { vendorId: 'nvidia', name: 'NVIDIA', website: 'https://nvidia.com', country: 'US' } as any,
  family: { familyId: 'f1', name: 'GeForce RTX 4090', category: 'GPU' as any, vendorId: 'nvidia', architecture: 'Ada Lovelace', deviceIds: [id] } as any,
  specs: [{ int8Tops: 1321 }, { fp16Tflops: 82.58 }, { fp32Tflops: 82.58 }] as any,
  prices: [{ priceUsd: price, observedAt: '2024-01-15', sourceId: 'test', condition: 'new' as any }] as any,
  benchmarks: [{ benchmarkTypeId: 'synthetic-int8', rawScore: 1321 }] as any,
  metrics: { effectiveInt8Tops: 1321, topsPerDollar: 0.83, topsPerWatt: 4.4, perfPerDollar: 50, perfPerWatt: 275, dataCompleteness: 0.9 },
}) as DeviceDetail
/* eslint-enable @typescript-eslint/no-explicit-any */

const FULL_METRICS: DeviceMetrics = {
  deviceId: 'dev1',
  effectiveInt8Tops: 1321,
  effectiveInt8TopsConfidence: 0.95,
  topsPerDollar: 0.83,
  topsPerWatt: 4.4,
  perfPerDollar: 50,
  perfPerWatt: 275,
  fp16Tflops: 82.58,
  fp32Tflops: 82.58,
  fp4Tflops: null,
  fp8Tflops: null,
  dataCompleteness: 0.9,
  latestPrice: 1599,
  tdpWatts: 300,
  topBenchmarkScore: 1321,
  topBenchmarkType: 'synthetic-int8',
}

const MOCK_SEARCH_RESULTS: DeviceListItem[] = [
  makeSearchResult('dev1', 'NVIDIA GeForce RTX 4090'),
  makeSearchResult('dev2', 'NVIDIA GeForce RTX 4080'),
  makeSearchResult('dev3', 'AMD Radeon RX 7900 XTX', 'AMD'),
]

const MOCK_COMPARE_RESULT: DeviceDetail[] = [
  makeComparedDevice('dev1', 'NVIDIA GeForce RTX 4090', 1599),
  makeComparedDevice('dev2', 'NVIDIA GeForce RTX 4080', 1199),
]

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual('@/lib/api')
  return {
    ...actual,
    searchDevices: vi.fn(),
    compareDevices: vi.fn(),
    getDeviceMetrics: vi.fn(),
  }
})

vi.mock('@/lib/export', () => ({
  downloadCSV: vi.fn(),
}))

import { searchDevices, compareDevices, getDeviceMetrics } from '@/lib/api'
import { downloadCSV } from '@/lib/export'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('ComparePage', () => {
  afterEach(() => {
    vi.mocked(searchDevices).mockReset()
    vi.mocked(compareDevices).mockReset()
    vi.mocked(getDeviceMetrics).mockReset()
    vi.mocked(downloadCSV).mockReset()
  })

  describe('Empty State', () => {
    beforeEach(() => {
      vi.mocked(searchDevices).mockReturnValue([])
      vi.mocked(compareDevices).mockReturnValue([])
      vi.mocked(getDeviceMetrics).mockReturnValue(null)
    })

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

    it('shows search results when typing', async () => {
      vi.mocked(searchDevices).mockReturnValue(MOCK_SEARCH_RESULTS)
      render(<ComparePage />, { wrapper: Wrapper })
      const input = screen.getByPlaceholderText(/Search for a device/i)
      await act(async () => { fireEvent.change(input, { target: { value: 'RTX' } }) })
      await waitFor(() => { expect(screen.getByText('NVIDIA GeForce RTX 4090')).toBeDefined() })
    })

    it('hides search results when query is cleared', async () => {
      vi.mocked(searchDevices).mockReturnValue(MOCK_SEARCH_RESULTS)
      render(<ComparePage />, { wrapper: Wrapper })
      const input = screen.getByPlaceholderText(/Search for a device/i)
      await act(async () => { fireEvent.change(input, { target: { value: 'RTX' } }) })
      await waitFor(() => { expect(screen.getByText('NVIDIA GeForce RTX 4090')).toBeDefined() })
      await act(async () => { fireEvent.change(input, { target: { value: '' } }) })
      await waitFor(() => { expect(screen.queryByText('NVIDIA GeForce RTX 4090')).toBeNull() })
    })
  })

  describe('Populated State', () => {
    beforeEach(() => {
      vi.mocked(searchDevices).mockReturnValue([])
      vi.mocked(compareDevices).mockReturnValue(MOCK_COMPARE_RESULT)
      vi.mocked(getDeviceMetrics).mockReturnValue(FULL_METRICS)
    })

    it('renders comparison table', () => {
      render(<ComparePage />, { wrapper: Wrapper })
      expect(screen.getByRole('table', { name: /device comparison/i })).toBeDefined()
    })

    it('shows correct device count', () => {
      render(<ComparePage />, { wrapper: Wrapper })
      expect(screen.getByRole('status')).toHaveTextContent('2 devices selected')
    })

    it('renders Add Device button when fewer than 6 devices', () => {
      render(<ComparePage />, { wrapper: Wrapper })
      expect(screen.getByRole('button', { name: '+ Add Device' })).toBeDefined()
    })

    it('does not render Add Device button when 6 devices selected', () => {
      vi.mocked(compareDevices).mockReturnValue(Array.from({ length: 6 }, (_, i) => makeComparedDevice(`dev${i}`, `Device ${i}`)))
      render(<MemoryRouter initialEntries={['/compare?devices=dev0,dev1,dev2,dev3,dev4,dev5']}><ComparePage /></MemoryRouter>)
      expect(screen.queryByRole('button', { name: '+ Add Device' })).toBeNull()
    })

    it('renders Clear button', () => {
      render(<ComparePage />, { wrapper: Wrapper })
      expect(screen.getByRole('button', { name: 'Clear all devices' })).toBeDefined()
    })

    it('renders Export CSV button', () => {
      render(<ComparePage />, { wrapper: Wrapper })
      expect(screen.getByRole('button', { name: 'Export comparison as CSV' })).toBeDefined()
    })

    it('calls downloadCSV when Export CSV is clicked', async () => {
      render(<ComparePage />, { wrapper: Wrapper })
      const exportBtn = screen.getByRole('button', { name: 'Export comparison as CSV' })
      await act(async () => { fireEvent.click(exportBtn) })
      expect(vi.mocked(downloadCSV)).toHaveBeenCalledWith('siliconrank-comparison.csv', expect.any(Array))
    })

    it('clears all devices when Clear is clicked', async () => {
      render(<ComparePage />, { wrapper: Wrapper })
      const clearBtn = screen.getByRole('button', { name: 'Clear all devices' })
      await act(async () => { fireEvent.click(clearBtn) })
      expect(vi.mocked(compareDevices)).toHaveBeenLastCalledWith([])
    })

    it('renders device names as links', () => {
      render(<ComparePage />, { wrapper: Wrapper })
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })

    it('displays benchmark section', () => {
      render(<ComparePage />, { wrapper: Wrapper })
      expect(screen.getByText(/Benchmarks/i)).toBeDefined()
    })
  })

  describe('Add Device Dropdown', () => {
    beforeEach(() => {
      vi.mocked(searchDevices).mockReturnValue(MOCK_SEARCH_RESULTS)
      vi.mocked(compareDevices).mockReturnValue(MOCK_COMPARE_RESULT)
      vi.mocked(getDeviceMetrics).mockReturnValue(FULL_METRICS)
    })

    it('opens dropdown when Add Device is clicked', async () => {
      render(<ComparePage />, { wrapper: Wrapper })
      const addBtn = screen.getByRole('button', { name: '+ Add Device' })
      await act(async () => { fireEvent.click(addBtn) })
      expect(screen.getByLabelText(/Search devices to add/i)).toBeDefined()
    })

    it('closes dropdown when Escape is pressed', async () => {
      render(<ComparePage />, { wrapper: Wrapper })
      const addBtn = screen.getByRole('button', { name: '+ Add Device' })
      await act(async () => { fireEvent.click(addBtn) })
      expect(screen.getByLabelText(/Search devices to add/i)).toBeDefined()
      await act(async () => { fireEvent.keyDown(document, { key: 'Escape' }) })
      await waitFor(() => { expect(screen.queryByLabelText(/Search devices to add/i)).toBeNull() })
    })
  })

  describe('URL sync', () => {
    it('reads device IDs from URL params', () => {
      vi.mocked(compareDevices).mockReturnValue(MOCK_COMPARE_RESULT)
      vi.mocked(getDeviceMetrics).mockReturnValue(FULL_METRICS)
      render(<MemoryRouter initialEntries={['/compare?devices=dev1,dev2']}><ComparePage /></MemoryRouter>)
      expect(vi.mocked(compareDevices)).toHaveBeenCalledWith(['dev1', 'dev2'])
    })
  })
})
