import { useState, useEffect, useCallback } from 'react'

export type ThemeMode = 'auto' | 'dark' | 'light'

const STORAGE_KEY = 'theme'

function getSystemPreference(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(mode: ThemeMode) {
  const resolved = mode === 'auto' ? getSystemPreference() : mode
  document.documentElement.setAttribute('data-theme', resolved)
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem('siliconrank:' + STORAGE_KEY)
      if (stored === 'dark' || stored === 'light' || stored === 'auto') return stored
    } catch {
      // ignore
    }
    return 'auto'
  })

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
    try {
      localStorage.setItem('siliconrank:' + STORAGE_KEY, mode)
    } catch {
      // ignore
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'auto' ? 'dark' : prev === 'dark' ? 'light' : 'auto'
      try {
        localStorage.setItem('siliconrank:' + STORAGE_KEY, next)
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  // Apply theme attribute on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Listen for system preference changes when in auto mode
  useEffect(() => {
    if (theme !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('auto')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return { theme, setTheme, toggleTheme }
}
