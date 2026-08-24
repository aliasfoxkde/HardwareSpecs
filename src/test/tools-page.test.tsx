import { describe, it, expect } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ToolsPage } from '@/pages/ToolsPage'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}

describe('ToolsPage', () => {
  it('renders page header', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /^Tools$/i })).toBeDefined()
  })

  it('renders all tool tabs', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('tab', { name: /TOPS Calculator/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Efficiency Calculator/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Memory Bandwidth/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /TCO Calculator/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Device Quick Lookup/i })).toBeDefined()
  })

  it('shows TOPS Calculator inputs by default', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    expect(screen.getByLabelText('Tensor Cores')).toBeDefined()
    expect(screen.getByLabelText('Clock Speed (GHz)')).toBeDefined()
  })

  it('switches to Efficiency Calculator on tab click', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    act(() => {
      screen.getByRole('tab', { name: /Efficiency Calculator/i }).click()
    })
    expect(screen.getByLabelText('INT8 TOPS')).toBeDefined()
  })

  it('switches to Memory Bandwidth on tab click', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    act(() => {
      screen.getByRole('tab', { name: /Memory Bandwidth/i }).click()
    })
    expect(screen.getByLabelText('Bus Width (bits)')).toBeDefined()
  })

  it('switches to TCO Calculator on tab click', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    act(() => {
      screen.getByRole('tab', { name: /TCO Calculator/i }).click()
    })
    expect(screen.getByLabelText('Purchase Price (USD)')).toBeDefined()
  })

  it('switches to Device Quick Lookup on tab click', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    act(() => {
      screen.getByRole('tab', { name: /Device Quick Lookup/i }).click()
    })
    expect(screen.getByLabelText('Search devices')).toBeDefined()
  })

  it('TOPS Calculator shows result status', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('status')).toBeDefined()
  })

  it('TOPS Calculator accepts numeric input', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    const input = screen.getByLabelText('Tensor Cores')
    fireEvent.change(input, { target: { value: '1000' } })
    expect((input as HTMLInputElement).value).toBe('1000')
  })

  it('TOPS Calculator accepts all inputs', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    fireEvent.change(screen.getByLabelText('Tensor Cores'), { target: { value: '680' } })
    fireEvent.change(screen.getByLabelText('Clock Speed (GHz)'), { target: { value: '2.52' } })
    fireEvent.change(screen.getByLabelText('Ops/Clock/Core (default: 256)'), { target: { value: '512' } })
    expect(screen.getByLabelText('Tensor Cores')).toBeDefined()
  })

  it('TOPS Calculator precision selector works', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    const select = screen.getByLabelText('Precision')
    fireEvent.change(select, { target: { value: 'fp16' } })
    expect((select as HTMLSelectElement).value).toBe('fp16')
  })

  it('Efficiency Calculator accepts inputs', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    act(() => {
      screen.getByRole('tab', { name: /Efficiency Calculator/i }).click()
    })
    fireEvent.change(screen.getByLabelText('INT8 TOPS'), { target: { value: '500' } })
    fireEvent.change(screen.getByLabelText('TDP (Watts)'), { target: { value: '300' } })
    fireEvent.change(screen.getByLabelText('Price (USD)'), { target: { value: '2000' } })
    expect(screen.getByLabelText('INT8 TOPS')).toBeDefined()
  })

  it('Memory Bandwidth Calculator accepts inputs', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    act(() => {
      screen.getByRole('tab', { name: /Memory Bandwidth/i }).click()
    })
    fireEvent.change(screen.getByLabelText('Bus Width (bits)'), { target: { value: '384' } })
    fireEvent.change(screen.getByLabelText('Transfer Rate (Gbps/pin)'), { target: { value: '52' } })
    expect(screen.getByLabelText('Bus Width (bits)')).toBeDefined()
  })

  it('TCO Calculator accepts inputs', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    act(() => {
      screen.getByRole('tab', { name: /TCO Calculator/i }).click()
    })
    fireEvent.change(screen.getByLabelText('Purchase Price (USD)'), { target: { value: '5000' } })
    fireEvent.change(screen.getByLabelText('TDP (Watts)'), { target: { value: '400' } })
    fireEvent.change(screen.getByLabelText('Usage (hours/day)'), { target: { value: '12' } })
    expect(screen.getByLabelText('Purchase Price (USD)')).toBeDefined()
  })

  it('Device Quick Lookup has search input', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    act(() => {
      screen.getByRole('tab', { name: /Device Quick Lookup/i }).click()
    })
    const input = screen.getByLabelText('Search devices')
    fireEvent.change(input, { target: { value: 'RTX' } })
    expect((input as HTMLInputElement).value).toBe('RTX')
  })

  it('TOPS Calculator shows formula description', () => {
    render(<ToolsPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Formula:/i)).toBeDefined()
  })
})
