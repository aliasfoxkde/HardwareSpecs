import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMetaDescription } from '@/hooks/useMetaDescription'

describe('useMetaDescription', () => {
  let originalMeta: HTMLMetaElement | null

  beforeEach(() => {
    originalMeta = document.querySelector('meta[name="description"]')
  })

  afterEach(() => {
    // Remove any meta added during tests
    const current = document.querySelector('meta[name="description"]')
    if (current && current !== originalMeta) {
      current.remove()
    }
    // Restore original
    if (originalMeta && !document.querySelector('meta[name="description"]')) {
      document.head.appendChild(originalMeta)
    }
  })

  it('creates meta description if none exists', () => {
    const existing = document.querySelector('meta[name="description"]')
    existing?.remove()

    renderHook(() => useMetaDescription('Test description'))

    const meta = document.querySelector('meta[name="description"]')
    expect(meta).toBeTruthy()
    expect(meta?.getAttribute('content')).toBe('Test description')
  })

  it('updates existing meta description', () => {
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      meta.setAttribute('content', 'Original description')
      document.head.appendChild(meta)
    }

    renderHook(() => useMetaDescription('Updated description'))

    const updated = document.querySelector('meta[name="description"]')
    expect(updated?.getAttribute('content')).toBe('Updated description')
  })

  it('updates content when description changes', () => {
    const existing = document.querySelector('meta[name="description"]')
    existing?.remove()

    const { rerender } = renderHook(
      ({ desc }) => useMetaDescription(desc),
      { initialProps: { desc: 'First description' } }
    )

    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('First description')

    rerender({ desc: 'Second description' })

    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Second description')
  })
})
