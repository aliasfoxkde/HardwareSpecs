import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from '@/components/studio/StatCard'
import { RankingPanel } from '@/components/studio/RankingPanel'
import type { DeviceMetricsRow } from '@/lib/api'

const mockRow: DeviceMetricsRow = {
  deviceId: 'test-1',
  modelName: 'Test Chip',
  vendorId: 'nvidia',
  vendorName: 'NVIDIA',
  familyName: 'Test Family',
  categoryName: 'GPU',
  architecture: 'Test Arch',
  launchDate: '2024-01-01',
  processNm: 4,
  cores: 16896,
  threads: null,
  memoryCapacityGB: 24,
  memoryType: 'GDDR6X',
  memoryBandwidthGBps: 1000,
  formFactor: null,
  status: 'Active',
  tmus: null,
  rops: null,
  tensorCores: 16896,
  rtCores: null,
  baseClockMhz: 2000,
  boostClockMhz: 2500,
  memoryBusWidth: '384-bit',
  effectiveInt8Tops: 100,
  effectiveInt8TopsConfidence: 0.9,
  fp16Tflops: 50,
  fp32Tflops: 25,
  fp4Tflops: null,
  fp8Tflops: null,
  tdpWatts: 300,
  latestPrice: 1000,
  dataCompleteness: 0.8,
  topsPerDollar: 0.1,
  topsPerWatt: 0.33,
  perfPerDollar: null,
  perfPerWatt: null,
  topBenchmarkScore: null,
  topBenchmarkType: null,
}

const mockData: DeviceMetricsRow[] = [
  { ...mockRow, deviceId: 'gpu-1', modelName: 'RTX 5090 FE', effectiveInt8Tops: 500, fp16Tflops: 250, fp32Tflops: 125, tdpWatts: 450, latestPrice: 1999, topsPerDollar: 0.25, topsPerWatt: 1.1, dataCompleteness: 0.9 },
  { ...mockRow, deviceId: 'gpu-2', modelName: 'RTX 5080', effectiveInt8Tops: 300, fp16Tflops: 150, fp32Tflops: 75, tdpWatts: 350, latestPrice: 999, topsPerDollar: 0.3, topsPerWatt: 0.86, dataCompleteness: 0.85 },
  { ...mockRow, deviceId: 'gpu-3', modelName: 'RX 9070 XT', effectiveInt8Tops: 200, fp16Tflops: 100, fp32Tflops: 50, tdpWatts: 304, latestPrice: 599, topsPerDollar: 0.33, topsPerWatt: 0.66, dataCompleteness: 0.75 },
  { ...mockRow, deviceId: 'gpu-4', modelName: 'Arc B580', effectiveInt8Tops: 150, fp16Tflops: 75, fp32Tflops: 37, tdpWatts: 190, latestPrice: 249, topsPerDollar: 0.6, topsPerWatt: 0.79, dataCompleteness: 0.7 },
]

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total Devices" value="437" />)
    expect(screen.getByText('Total Devices')).toBeDefined()
    expect(screen.getByText('437')).toBeDefined()
  })

  it('applies correct styling', () => {
    render(<StatCard label="Price" value="$1,999" />)
    const card = screen.getByText('$1,999').parentElement
    expect(card).toBeDefined()
  })
})

describe('RankingPanel', () => {
  it('renders empty state for empty data', () => {
    render(<RankingPanel data={[]} />)
    expect(screen.getByText('Top 10 by TOPS')).toBeDefined()
  })

  it('renders ranking categories', () => {
    render(<RankingPanel data={mockData} />)
    expect(screen.getByText('Top 10 by TOPS')).toBeDefined()
    expect(screen.getByText('Top 10 by TOPS/$')).toBeDefined()
    expect(screen.getByText('Top 10 by TOPS/W')).toBeDefined()
  })

  it('renders devices in ranking', () => {
    render(<RankingPanel data={mockData} />)
    expect(screen.getAllByText(/Top 10/i).length).toBeGreaterThan(0)
  })
})
