import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotFoundPage } from '@/pages/NotFoundPage'

describe('NotFoundPage', () => {
  it('should render 404 message', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )
    expect(screen.getByText('404')).toBeDefined()
    expect(screen.getByText('Page Not Found')).toBeDefined()
    expect(screen.getByText(/Back to Home/)).toBeDefined()
  })
})
