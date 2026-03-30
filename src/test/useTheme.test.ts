import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock documentElement.setAttribute
const setAttributeMock = vi.fn()
Object.defineProperty(document, 'documentElement', {
  value: { setAttribute: setAttributeMock },
  writable: true,
})

describe('useTheme', () => {
  beforeEach(() => {
    localStorageMock.clear()
    setAttributeMock.mockClear()
  })

  it('defaults to auto theme', async () => {
    const { useTheme } = await import('@/hooks/useTheme')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('auto')
  })

  it('toggleTheme cycles auto → dark → light → auto', async () => {
    const { useTheme } = await import('@/hooks/useTheme')
    const { result } = renderHook(() => useTheme())

    act(() => { result.current.toggleTheme() })
    expect(result.current.theme).toBe('dark')

    act(() => { result.current.toggleTheme() })
    expect(result.current.theme).toBe('light')

    act(() => { result.current.toggleTheme() })
    expect(result.current.theme).toBe('auto')
  })

  it('persists theme to localStorage', async () => {
    const { useTheme } = await import('@/hooks/useTheme')
    const { result } = renderHook(() => useTheme())

    act(() => { result.current.toggleTheme() })
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      expect.stringContaining('theme'),
      'dark',
    )
  })

  it('applies theme attribute on mount', async () => {
    const { useTheme } = await import('@/hooks/useTheme')
    renderHook(() => useTheme())
    expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'dark')
  })
})
