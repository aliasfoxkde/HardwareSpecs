import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('test error')
  return <div>All good</div>
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeDefined()
  })

  it('shows error UI when child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByText('test error')).toBeDefined()
    expect(screen.getByText('Try Again')).toBeDefined()
    spy.mockRestore()
  })

  it('recovers when Try Again is clicked', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Use a state to toggle the error
    let shouldThrow = true
    function ToggleComponent() {
      if (shouldThrow) throw new Error('test error')
      return <div>All good</div>
    }

    render(
      <ErrorBoundary>
        <ToggleComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeDefined()

    // Fix the error and click Try Again
    shouldThrow = false
    act(() => {
      screen.getByText('Try Again').click()
    })

    expect(screen.getByText('All good')).toBeDefined()
    spy.mockRestore()
  })

  it('renders custom fallback when provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary fallback={<div>Custom error</div>}>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Custom error')).toBeDefined()
    spy.mockRestore()
  })
})
