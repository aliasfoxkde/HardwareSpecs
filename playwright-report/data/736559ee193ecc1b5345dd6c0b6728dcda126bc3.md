# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: browse.spec.ts >> LandingPage >> loads and displays hero
- Location: e2e/browse.spec.ts:52:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /siliconrank/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /siliconrank/i })

```

```yaml
- link "Skip to content":
  - /url: "#main-content"
- navigation "Main navigation":
  - link "SiliconRank SiliconRank":
    - /url: /
    - img "SiliconRank"
    - text: SiliconRank
  - link "Home":
    - /url: /
  - link "Browse":
    - /url: /browse
  - link "Compare":
    - /url: /compare
  - link "Charts":
    - /url: /charts
  - link "Studio":
    - /url: /studio
  - link "Tools":
    - /url: /tools
  - link "Reports":
    - /url: /reports
  - link "Docs":
    - /url: /docs
  - img
  - textbox "Search devices":
    - /placeholder: Search devices...
  - 'button "Theme: auto. Click to switch."':
    - img
- main:
  - text: Open Source Hardware Intelligence
  - heading "Compare Every Chip. One Platform." [level=1]
  - paragraph: Normalized benchmarks, efficiency metrics, and AI accelerator tracking for CPUs, GPUs, NPUs, SBCs, and edge devices from every major vendor.
  - link "Browse Database":
    - /url: /browse
  - link "Compare Devices":
    - /url: /compare
  - link "Studio":
    - /url: /studio
  - text: 304 Devices 35 Vendors 9 Categories 465 Benchmarks
  - heading "Explore by Category" [level=2]
  - paragraph: Comprehensive hardware database across all major categories.
  - 'link "CPU: 56 devices"':
    - /url: /browse?category=CPU
    - text: ⚙️
    - heading "CPU" [level=3]
    - text: 56 devices
  - 'link "GPU: 181 devices"':
    - /url: /browse?category=GPU
    - text: 🎮
    - heading "GPU" [level=3]
    - text: 181 devices
  - 'link "SBC: 20 devices"':
    - /url: /browse?category=SBC
    - text: 🔋
    - heading "SBC" [level=3]
    - text: 20 devices
  - 'link "NPU: 15 devices"':
    - /url: /browse?category=NPU
    - text: 🧠
    - heading "NPU" [level=3]
    - text: 15 devices
  - 'link "ASIC: 5 devices"':
    - /url: /browse?category=ASIC
    - text: 💎
    - heading "ASIC" [level=3]
    - text: 5 devices
  - 'link "SoC: 16 devices"':
    - /url: /browse?category=SoC
    - text: 📱
    - heading "SoC" [level=3]
    - text: 16 devices
  - 'link "System: 8 devices"':
    - /url: /browse?category=System
    - text: 🖥️
    - heading "System" [level=3]
    - text: 8 devices
  - 'link "Memory: 6 devices"':
    - /url: /browse?category=Memory
    - text: 💾
    - heading "Memory" [level=3]
    - text: 6 devices
  - 'link "Storage: 4 devices"':
    - /url: /browse?category=Storage
    - text: 💿
    - heading "Storage" [level=3]
    - text: 4 devices
  - heading "Powerful Analysis Tools" [level=2]
  - paragraph: From edge AI accelerators to datacenter GPUs, get a complete picture of performance, efficiency, and value.
  - img
  - heading "8+ Chart Types" [level=3]
  - paragraph: Scatter, bar, pie, heatmap, time series, stacked, regression analysis, and radar visualizations.
  - img
  - heading "Cross-Vendor Compare" [level=3]
  - paragraph: NVIDIA, AMD, Intel, Apple, Qualcomm, and edge AI vendors side by side.
  - img
  - heading "AI Accelerator DB" [level=3]
  - paragraph: NPUs, TPUs, ASICs, and edge AI chips from Hailo, Coral, Groq, Cerebras.
  - img
  - heading "Efficiency Metrics" [level=3]
  - paragraph: TOPS/$, TOPS/W, Perf/$, Perf/W with best-value highlighting.
  - img
  - heading "Studio Mode" [level=3]
  - paragraph: Full dataset spreadsheet with filtering, notes, export, and analysis.
  - img
  - heading "Live API Docs" [level=3]
  - paragraph: Interactive API documentation with live examples and type references.
  - heading "Best TOPS/$ Value" [level=2]
  - paragraph: The most efficient compute per dollar across all GPUs.
  - 'link "#1 NVIDIA GeForce RTX 5070 Ti: 1.5 TOPS per dollar"':
    - /url: /device/nvidia-rtx-5070-ti
    - text: 1 NVIDIA GeForce RTX 5070 Ti NVIDIA 1.5 TOPS/$ 1126 TOPS
  - 'link "#2 NVIDIA GeForce RTX 5070: 1.4 TOPS per dollar"':
    - /url: /device/nvidia-rtx-5070
    - text: 2 NVIDIA GeForce RTX 5070 NVIDIA 1.4 TOPS/$ 771 TOPS
  - 'link "#3 NVIDIA GeForce RTX 5080: 0.9 TOPS per dollar"':
    - /url: /device/nvidia-rtx-5080
    - text: 3 NVIDIA GeForce RTX 5080 NVIDIA 0.9 TOPS/$ 901 TOPS
  - 'link "#4 NVIDIA GeForce RTX 4070 Super: 0.9 TOPS per dollar"':
    - /url: /device/nvidia-rtx-4070-super
    - text: 4 NVIDIA GeForce RTX 4070 Super NVIDIA 0.9 TOPS/$ 533 TOPS
  - 'link "#5 AMD Radeon RX 7800 XT: 0.8 TOPS per dollar"':
    - /url: /device/amd-rx-7800-xt
    - text: 5 AMD Radeon RX 7800 XT AMD 0.8 TOPS/$ 393 TOPS
  - link "View full analysis in Studio →":
    - /url: /studio
  - heading "Top GPUs" [level=2]
  - heading "By TOPS Performance" [level=3]
  - 'link "NVIDIA GeForce RTX 5070 Ti: 1126 TOPS"':
    - /url: /device/nvidia-rtx-5070-ti
    - text: NVIDIA GeForce RTX 5070 Ti NVIDIA 1126 TOPS
  - 'link "NVIDIA B200 192GB: 918 TOPS"':
    - /url: /device/nvidia-b200
    - text: NVIDIA B200 192GB NVIDIA 918 TOPS
  - 'link "NVIDIA H100 SXM5 80GB: 908 TOPS"':
    - /url: /device/nvidia-h100-sxm
    - text: NVIDIA H100 SXM5 80GB NVIDIA 908 TOPS
  - 'link "NVIDIA H200 141GB SXM: 908 TOPS"':
    - /url: /device/nvidia-h200-sxm
    - text: NVIDIA H200 141GB SXM NVIDIA 908 TOPS
  - 'link "NVIDIA GeForce RTX 5080: 901 TOPS"':
    - /url: /device/nvidia-rtx-5080
    - text: NVIDIA GeForce RTX 5080 NVIDIA 901 TOPS
  - link "View all GPUs →":
    - /url: /browse?category=GPU
  - heading "Start Comparing Hardware" [level=2]
  - paragraph: Free, open source, and built for researchers, developers, and hardware enthusiasts.
  - link "Explore the Database":
    - /url: /browse
  - link "View Charts":
    - /url: /charts
  - link "API Docs":
    - /url: /docs
- contentinfo "Site footer":
  - text: SiliconRank
  - paragraph: Open hardware intelligence platform. Compare CPUs, GPUs, NPUs, and AI accelerators.
  - heading "Explore" [level=4]
  - link "Browse Devices":
    - /url: /browse
  - link "Compare":
    - /url: /compare
  - link "Charts":
    - /url: /charts
  - link "Studio":
    - /url: /studio
  - link "Tools":
    - /url: /tools
  - link "Reports":
    - /url: /reports
  - link "API Docs":
    - /url: /docs
  - heading "Categories" [level=4]
  - link "CPUs":
    - /url: /browse?category=CPU
  - link "GPUs":
    - /url: /browse?category=GPU
  - link "NPUs / AI":
    - /url: /browse?category=NPU
  - link "SBCs":
    - /url: /browse?category=SBC
  - link "Memory":
    - /url: /browse?category=Memory
  - link "Storage":
    - /url: /browse?category=Storage
  - heading "Project" [level=4]
  - link "GitHub":
    - /url: https://github.com/aliasfoxkde/HardwareSpecs
    - img
    - text: GitHub
  - text: Open Source (MIT) 304 devices · 35 vendors SiliconRank © 2026 · Open source under MIT License
  - link "Sponsor":
    - /url: https://github.com/sponsors/aliasfoxkde
    - img
    - text: Sponsor
  - link "Ko-fi":
    - /url: https://ko-fi.com/aliasfoxkde
    - img
    - text: Ko-fi
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
> 54  |     await expect(page.getByRole('heading', { name: /siliconrank/i })).toBeVisible()
      |                                                                       ^ Error: expect(locator).toBeVisible() failed
  55  |   })
  56  | 
  57  |   test('category cards are clickable', async ({ page }) => {
  58  |     await page.goto('/')
  59  |     const categoryLinks = page.getByRole('link', { name: /devices/i })
  60  |     await expect(categoryLinks.first()).toBeVisible()
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