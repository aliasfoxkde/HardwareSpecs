import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMetaDescription } from '@/hooks/useMetaDescription'

describe('useMetaDescription', () => {
  afterEach(() => {
    // Clean up any meta description elements
    const existing = document.querySelector('meta[name="description"]')
    if (existing) existing.remove()
  })

  it('creates meta description when none exists', () => {
    renderHook(() => useMetaDescription('Test description'))
    const meta = document.querySelector('meta[name="description"]')
    expect(meta).not.toBeNull()
  })

  it('updates content when description changes', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'description')
    meta.setAttribute('content', 'old')
    document.head.appendChild(meta)

    renderHook(() => useMetaDescription('New description'))

    expect(meta.getAttribute('content')).toBe('New description')
    meta.remove()
  })
})
