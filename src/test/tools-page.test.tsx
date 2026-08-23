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
})
