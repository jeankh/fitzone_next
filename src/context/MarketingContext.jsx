'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const DEFAULTS = {
  whatsapp: '966500000000',
  twitter: 'https://x.com/',
  instagram: 'https://instagram.com/',
  youtube: 'https://youtube.com/',
  whatsapp_visible:  'true',
  twitter_visible:   'true',
  instagram_visible: 'true',
  youtube_visible:   'true',
}

const MarketingContext = createContext(DEFAULTS)

export function MarketingProvider({ children }) {
  const [marketing, setMarketing] = useState(DEFAULTS)

  useEffect(() => {
    fetch('/api/admin/marketing')
      .then(r => r.json())
      .then(data => {
        // Normalize boolean false → string 'false' (Upstash may return booleans)
        const normalized = {}
        for (const [k, v] of Object.entries(data || {})) normalized[k] = String(v)
        setMarketing({ ...DEFAULTS, ...normalized })
      })
      .catch((e) => console.error('Failed to load marketing config:', e))
  }, [])

  return (
    <MarketingContext.Provider value={marketing}>
      {children}
    </MarketingContext.Provider>
  )
}

export function useMarketing() {
  return useContext(MarketingContext)
}
