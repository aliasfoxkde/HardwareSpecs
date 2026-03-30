import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotFoundPage } from '@/pages/NotFoundPage'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('NotFoundPage accessibility', () => {
  it('search input has aria-label', () => {
    render(<NotFoundPage />, { wrapper: Wrapper })
    expect(screen.getByLabelText('Search devices')).toBeDefined()
  })

  it('submit button has aria-label', () => {
    render(<NotFoundPage />, { wrapper: Wrapper })
    expect(screen.getByLabelText('Search')).toBeDefined()
  })
})
