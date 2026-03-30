export const VENDOR_COLORS: Record<string, string> = {
  nvidia: '#76b900',
  amd: '#ed1c24',
  intel: '#0071c5',
  apple: '#a2aaad',
  qualcomm: '#3253dc',
  broadcom: '#cc092f',
  google: '#4285f4',
  huawei: '#cf0a2c',
  rockchip: '#ff6600',
  hardkernel: '#333333',
  beagleboard: '#000000',
  xunlong: '#ff4500',
  hailo: '#00bcd4',
  'intel-corporation': '#0071c5',
  samsung: '#1428a0',
  'western-digital': '#e4002b',
  crucial: '#008c44',
  'sk-hynix': '#e4002b',
  'g-skill': '#e8313a',
  corsair: '#000000',
}

export function getVendorColor(vendorId: string): string {
  return VENDOR_COLORS[vendorId] ?? '#3b82f6'
}

export function formatNumber(n: number | null | undefined, decimals = 1): string {
  if (n == null) return '-'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(decimals)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(decimals)}k`
  if (Number.isInteger(n)) return n.toLocaleString()
  return n.toFixed(decimals)
}

export function formatUsd(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${Math.round(n)}`
}

export function linearRegression(data: { x: number; y: number }[]): { slope: number; intercept: number; r2: number } {
  const n = data.length
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (const { x, y } of data) {
    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
  }

  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 }

  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n

  const meanY = sumY / n
  let ssRes = 0, ssTot = 0
  for (const { x, y } of data) {
    const predicted = slope * x + intercept
    ssRes += (y - predicted) ** 2
    ssTot += (y - meanY) ** 2
  }

  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot
  return { slope, intercept, r2 }
}

export const CHART_STYLES = {
  gridStroke: 'var(--color-border-subtle)',
  axisTick: 'var(--color-text-secondary)',
  tooltipBg: 'var(--color-bg-secondary)',
  tooltipBorder: 'var(--color-border-subtle)',
  tooltipText: 'var(--color-text-primary)',
}
