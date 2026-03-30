import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock URL.createObjectURL for blob downloads
globalThis.URL.createObjectURL = vi.fn(() => 'blob:test')
globalThis.URL.revokeObjectURL = vi.fn()

describe('export utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('downloadCSV creates a CSV blob and triggers download', async () => {
    const { downloadCSV } = await import('@/lib/export')
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: vi.fn(),
      style: {},
    } as unknown as HTMLAnchorElement)

    downloadCSV('test.csv', [{ Name: 'Alice', Age: 30 }, { Name: 'Bob', Age: 25 }])

    expect(createElementSpy).toHaveBeenCalledWith('a')
    const anchor = createElementSpy.mock.results[0].value as HTMLAnchorElement
    expect(anchor.download).toBe('test.csv')
    expect(anchor.click).toHaveBeenCalled()
    createElementSpy.mockRestore()
  })

  it('downloadJSON creates a JSON blob and triggers download', async () => {
    const { downloadJSON } = await import('@/lib/export')
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: vi.fn(),
      style: {},
    } as unknown as HTMLAnchorElement)

    downloadJSON('test.json', [{ name: 'device1', tops: 100 }])

    expect(createElementSpy).toHaveBeenCalledWith('a')
    const anchor = createElementSpy.mock.results[0].value as HTMLAnchorElement
    expect(anchor.download).toBe('test.json')
    expect(anchor.click).toHaveBeenCalled()
    createElementSpy.mockRestore()
  })
})
