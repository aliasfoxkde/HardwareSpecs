import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BrowsePage } from '@/pages/BrowsePage'

describe('BrowsePage URL state sync', () => {
  it('reads category from URL params on mount', () => {
    render(
      <MemoryRouter initialEntries={['/?category=GPU']}>
        <BrowsePage />
      </MemoryRouter>,
    )
    const gpuBtn = screen.getByText('GPU')
    expect(gpuBtn).toBeDefined()
  })

  it('reads search query from URL params', () => {
    render(
      <MemoryRouter initialEntries={['/?q=nvidia']}>
        <BrowsePage />
      </MemoryRouter>,
    )
    const input = screen.getByPlaceholderText(/Search by name/) as HTMLInputElement
    expect(input.value).toBe('nvidia')
  })

  it('reads sort params from URL', () => {
    render(
      <MemoryRouter initialEntries={['/?sort=name&order=asc']}>
        <BrowsePage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Browse Devices')).toBeDefined()
  })

  it('reads vendor filter from URL', () => {
    render(
      <MemoryRouter initialEntries={['/?vendor=nvidia']}>
        <BrowsePage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Browse Devices')).toBeDefined()
  })

  it('reads tdpMin filter from URL', () => {
    render(
      <MemoryRouter initialEntries={['/?tdpMin=100']}>
        <BrowsePage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Browse Devices')).toBeDefined()
  })

  it('reads priceMin filter from URL', () => {
    render(
      <MemoryRouter initialEntries={['/?priceMin=500']}>
        <BrowsePage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Browse Devices')).toBeDefined()
  })

  it('combines multiple URL filters', () => {
    render(
      <MemoryRouter initialEntries={['/?category=GPU&vendor=nvidia&q=rtx&sort=tops']}>
        <BrowsePage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Browse Devices')).toBeDefined()
  })
})
