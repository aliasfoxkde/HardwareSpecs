import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ComparePage } from '@/pages/ComparePage'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('ComparePage', () => {
  it('renders page header', () => {
    render(<ComparePage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /compare/i })).toBeDefined()
  })

  it('renders search input', () => {
    render(<ComparePage />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText(/search/i)).toBeDefined()
  })
})
