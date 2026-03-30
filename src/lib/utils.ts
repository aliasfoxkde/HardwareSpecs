export function fmtNum(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '-'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(decimals)}k`
  if (Number.isInteger(n)) return n.toLocaleString()
  return n.toFixed(decimals)
}

export function fmtRam(gb: number | null | undefined): string {
  if (gb == null) return '-'
  if (gb >= 1024) return `${(gb / 1024).toFixed(1)} TB`
  if (Number.isInteger(gb)) return `${gb} GB`
  return `${gb.toFixed(1)} GB`
}
