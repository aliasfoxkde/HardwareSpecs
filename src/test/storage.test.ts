import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getItem, setItem, removeItem } from '@/lib/storage'

const PREFIX = 'siliconrank:'

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('getItem', () => {
    it('returns fallback when key does not exist', () => {
      expect(getItem('nonexistent', { foo: 'bar' })).toEqual({ foo: 'bar' })
    })

    it('returns parsed value when key exists', () => {
      localStorage.setItem(PREFIX + 'test', JSON.stringify({ foo: 'bar' }))
      expect(getItem('test', null)).toEqual({ foo: 'bar' })
    })

    it('returns fallback on JSON parse error', () => {
      localStorage.setItem(PREFIX + 'bad', 'not json')
      expect(getItem('bad', 'fallback')).toBe('fallback')
    })
  })

  describe('setItem', () => {
    it('stores JSON-serialized value', () => {
      setItem('key1', { name: 'test' })
      expect(localStorage.getItem(PREFIX + 'key1')).toBe(JSON.stringify({ name: 'test' }))
    })

    it('handles localStorage being unavailable', () => {
      const originalSetItem = Object.getOwnPropertyDescriptor(window, 'localStorage')
      Object.defineProperty(window, 'localStorage', { value: null, writable: true })
      expect(() => setItem('key', 'value')).not.toThrow()
      Object.defineProperty(window, 'localStorage', originalSetItem!)
    })
  })

  describe('removeItem', () => {
    it('removes item from localStorage', () => {
      localStorage.setItem(PREFIX + 'to-remove', 'value')
      removeItem('to-remove')
      expect(localStorage.getItem(PREFIX + 'to-remove')).toBeNull()
    })

    it('handles localStorage being unavailable', () => {
      const originalSetItem = Object.getOwnPropertyDescriptor(window, 'localStorage')
      Object.defineProperty(window, 'localStorage', { value: null, writable: true })
      expect(() => removeItem('key')).not.toThrow()
      Object.defineProperty(window, 'localStorage', originalSetItem!)
    })
  })
})
