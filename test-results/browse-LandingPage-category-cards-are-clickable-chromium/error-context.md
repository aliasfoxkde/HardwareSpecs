# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: browse.spec.ts >> LandingPage >> category cards are clickable
- Location: e2e/browse.spec.ts:57:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: /devices/i }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('link', { name: /devices/i }).first()

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | test.describe('BrowsePage', () => {
  4   |   test('loads and displays device table', async ({ page }) => {
  5   |     await page.goto('/browse')
  6   |     await expect(page.getByRole('heading', { name: /browse/i })).toBeVisible()
  7   |     await expect(page.getByRole('table', { name: /device list/i })).toBeVisible()
  8   |   })
  9   | 
  10  |   test('search filters devices', async ({ page }) => {
  11  |     await page.goto('/browse')
  12  |     const searchInput = page.getByLabel('Search devices')
  13  |     await searchInput.fill('NVIDIA')
  14  |     await page.waitForTimeout(300)
  15  |     // Results should update
  16  |     await expect(page.getByRole('status')).toBeVisible()
  17  |   })
  18  | 
  19  |   test('category filters work', async ({ page }) => {
  20  |     await page.goto('/browse')
  21  |     const gpuButton = page.getByRole('button', { name: 'GPU' })
  22  |     await gpuButton.click()
  23  |     await page.waitForTimeout(100)
  24  |     await expect(gpuButton.getAttribute('aria-pressed')).toBe('true')
  25  |   })
  26  | 
  27  |   test('export CSV button exists', async ({ page }) => {
  28  |     await page.goto('/browse')
  29  |     await expect(page.getByLabel('Export CSV')).toBeVisible()
  30  |   })
  31  | 
  32  |   test('export JSON button exists', async ({ page }) => {
  33  |     await page.goto('/browse')
  34  |     await expect(page.getByLabel('Export JSON')).toBeVisible()
  35  |   })
  36  | })
  37  | 
  38  | test.describe('DevicePage', () => {
  39  |   test('loads device details', async ({ page }) => {
  40  |     await page.goto('/device/nvidia-geforce-rtx-4090')
  41  |     await expect(page.getByRole('heading')).toBeVisible()
  42  |   })
  43  | 
  44  |   test('back to browse link works', async ({ page }) => {
  45  |     await page.goto('/device/nvidia-geforce-rtx-4090')
  46  |     const backLink = page.getByRole('link', { name: /back to browse/i })
  47  |     await expect(backLink).toBeVisible()
  48  |   })
  49  | })
  50  | 
  51  | test.describe('LandingPage', () => {
  52  |   test('loads and displays hero', async ({ page }) => {
  53  |     await page.goto('/')
  54  |     await expect(page.getByRole('heading', { name: /siliconrank/i })).toBeVisible()
  55  |   })
  56  | 
  57  |   test('category cards are clickable', async ({ page }) => {
  58  |     await page.goto('/')
  59  |     const categoryLinks = page.getByRole('link', { name: /devices/i })
> 60  |     await expect(categoryLinks.first()).toBeVisible()
      |                                         ^ Error: expect(locator).toBeVisible() failed
  61  |   })
  62  | })
  63  | 
  64  | test.describe('ComparePage', () => {
  65  |   test('loads empty state', async ({ page }) => {
  66  |     await page.goto('/compare')
  67  |     await expect(page.getByRole('heading', { name: /compare/i })).toBeVisible()
  68  |     await expect(page.getByPlaceholder(/search for a device/i)).toBeVisible()
  69  |   })
  70  | })
  71  | 
  72  | test.describe('ChartsPage', () => {
  73  |   test('loads with tabs', async ({ page }) => {
  74  |     await page.goto('/charts')
  75  |     await expect(page.getByRole('heading', { name: /charts/i })).toBeVisible()
  76  |     await expect(page.getByRole('tablist')).toBeVisible()
  77  |   })
  78  | 
  79  |   test('tab switching works', async ({ page }) => {
  80  |     await page.goto('/charts')
  81  |     await page.getByRole('tab', { name: /price vs performance/i }).click()
  82  |     await expect(page.getByRole('tabpanel')).toBeVisible()
  83  |   })
  84  | })
  85  | 
  86  | test.describe('ToolsPage', () => {
  87  |   test('loads TOPS calculator by default', async ({ page }) => {
  88  |     await page.goto('/tools')
  89  |     await expect(page.getByRole('heading', { name: /^tools$/i })).toBeVisible()
  90  |     await expect(page.getByLabel('Tensor Cores')).toBeVisible()
  91  |   })
  92  | 
  93  |   test('tab switching works', async ({ page }) => {
  94  |     await page.goto('/tools')
  95  |     await page.getByRole('tab', { name: /efficiency calculator/i }).click()
  96  |     await expect(page.getByLabel('INT8 TOPS')).toBeVisible()
  97  |   })
  98  | })
  99  | 
  100 | test.describe('ReportsPage', () => {
  101 |   test('loads with report tabs', async ({ page }) => {
  102 |     await page.goto('/reports')
  103 |     await expect(page.getByRole('heading', { name: /reports/i })).toBeVisible()
  104 |     await expect(page.getByRole('tablist')).toBeVisible()
  105 |   })
  106 | })
  107 | 
  108 | test.describe('DocsPage', () => {
  109 |   test('loads API documentation', async ({ page }) => {
  110 |     await page.goto('/docs')
  111 |     await expect(page.getByRole('heading', { name: /api documentation/i })).toBeVisible()
  112 |   })
  113 | 
  114 |   test('endpoint list is visible', async ({ page }) => {
  115 |     await page.goto('/docs')
  116 |     await expect(page.getByText('getVendors')).toBeVisible()
  117 |   })
  118 | })
  119 | 
```