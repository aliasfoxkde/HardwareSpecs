import { useEffect } from 'react'

export function useMetaDescription(description: string) {
  useEffect(() => {
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
  }, [description])
}
