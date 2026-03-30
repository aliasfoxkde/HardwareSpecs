import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotFoundPage } from '@/pages/NotFoundPage'

describe('NotFoundPage', () => {
  it('renders 404 message and back link', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )
    expect(screen.getByText('404')).toBeDefined()
    expect(screen.getByText('Page Not Found')).toBeDefined()
    expect(screen.getByText(/Back to Home/)).toBeDefined()
  })

  it('renders search input', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )
    const input = screen.getByPlaceholderText(/search/i)
    expect(input).toBeDefined()
  })

  it('renders popular categories', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )
    expect(screen.getByText('CPUs')).toBeDefined()
    expect(screen.getByText('GPUs')).toBeDefined()
    expect(screen.getByText('NPUs / AI')).toBeDefined()
    expect(screen.getByText('SBCs')).toBeDefined()
  })

  it('renders popular device suggestions', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )
    expect(screen.getByText('NVIDIA RTX 5090')).toBeDefined()
    expect(screen.getByText('Apple M4 Ultra')).toBeDefined()
    expect(screen.getByText('NVIDIA H100 SXM')).toBeDefined()
    expect(screen.getByText('Raspberry Pi 5')).toBeDefined()
  })
})
