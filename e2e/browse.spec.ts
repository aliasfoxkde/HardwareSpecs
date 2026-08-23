import { test, expect } from '@playwright/test'

test.describe('BrowsePage', () => {
  test('loads and displays device table', async ({ page }) => {
    await page.goto('/browse')
    await expect(page.getByRole('heading', { name: /browse/i })).toBeVisible()
    await expect(page.getByRole('table', { name: /device list/i })).toBeVisible()
  })

  test('search filters devices', async ({ page }) => {
    await page.goto('/browse')
    const searchInput = page.getByLabel('Search devices')
    await searchInput.fill('NVIDIA')
    await page.waitForTimeout(300)
    await expect(page.getByRole('status')).toBeVisible()
  })

  test('category filters work', async ({ page }) => {
    await page.goto('/browse')
    const gpuButton = page.getByRole('button', { name: 'GPU' })
    await gpuButton.click()
    await page.waitForTimeout(100)
    await expect(gpuButton.getAttribute('aria-pressed')).toBe('true')
  })

  test('export buttons exist', async ({ page }) => {
    await page.goto('/browse')
    await expect(page.getByLabel('Export CSV')).toBeVisible()
    await expect(page.getByLabel('Export JSON')).toBeVisible()
  })
})

test.describe('LandingPage', () => {
  test('loads and displays hero', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /siliconrank/i })).toBeVisible()
  })

  test('category cards are clickable', async ({ page }) => {
    await page.goto('/')
    const categoryLinks = page.getByRole('link', { name: /devices/i })
    await expect(categoryLinks.first()).toBeVisible()
  })
})

test.describe('ComparePage', () => {
  test('loads empty state', async ({ page }) => {
    await page.goto('/compare')
    await expect(page.getByRole('heading', { name: /compare/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search for a device/i)).toBeVisible()
  })
})

test.describe('ChartsPage', () => {
  test('loads with tabs', async ({ page }) => {
    await page.goto('/charts')
    await expect(page.getByRole('heading', { name: /charts/i })).toBeVisible()
    await expect(page.getByRole('tablist')).toBeVisible()
  })

  test('tab switching works', async ({ page }) => {
    await page.goto('/charts')
    await page.getByRole('tab', { name: 'Performance' }).click()
    await expect(page.getByRole('tab', { name: 'Performance' }).getAttribute('aria-selected')).toBe('true')
  })

  test('value tab works', async ({ page }) => {
    await page.goto('/charts')
    await page.getByRole('tab', { name: 'Value' }).click()
    await expect(page.getByRole('tab', { name: 'Value' }).getAttribute('aria-selected')).toBe('true')
  })
})

test.describe('ToolsPage', () => {
  test('loads TOPS calculator by default', async ({ page }) => {
    await page.goto('/tools')
    await expect(page.getByRole('heading', { name: /^tools$/i })).toBeVisible()
    await expect(page.getByLabel('Tensor Cores')).toBeVisible()
  })

  test('tab switching works', async ({ page }) => {
    await page.goto('/tools')
    await page.getByRole('tab', { name: /efficiency calculator/i }).click()
    await expect(page.getByLabel('INT8 TOPS')).toBeVisible()
  })
})

test.describe('ReportsPage', () => {
  test('loads with report tabs', async ({ page }) => {
    await page.goto('/reports')
    await expect(page.getByRole('heading', { name: /reports/i })).toBeVisible()
    await expect(page.getByRole('tablist')).toBeVisible()
  })

  test('tab switching works', async ({ page }) => {
    await page.goto('/reports')
    await page.getByRole('tab', { name: 'Top Performers' }).click()
    await expect(page.getByRole('tab', { name: 'Top Performers' }).getAttribute('aria-selected')).toBe('true')
  })
})

test.describe('DocsPage', () => {
  test('loads API documentation', async ({ page }) => {
    await page.goto('/docs')
    await expect(page.getByRole('heading', { name: /api documentation/i })).toBeVisible()
  })

  test('endpoint list is visible', async ({ page }) => {
    await page.goto('/docs')
    await expect(page.getByText('getVendors')).toBeVisible()
  })

  test('tabs switch correctly', async ({ page }) => {
    await page.goto('/docs')
    await page.getByRole('tab', { name: 'Types' }).click()
    await expect(page.getByRole('tab', { name: 'Types' }).getAttribute('aria-selected')).toBe('true')
  })
})
