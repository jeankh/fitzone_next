'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { MARKETING_DEFAULTS, normalizeMarketingData } from '../lib/marketing'

const DEFAULTS = {
  ...MARKETING_DEFAULTS,
  whatsapp: '',
  socials: [],
  loaded: false,
}

const MarketingContext = createContext(DEFAULTS)

export function MarketingProvider({ children }) {
  const [marketing, setMarketing] = useState(DEFAULTS)

  useEffect(() => {
    fetch('/api/admin/marketing', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const normalized = normalizeMarketingData(data || {})
        setMarketing({ ...DEFAULTS, ...normalized, loaded: true })
      })
      .catch((e) => {
        console.error('Failed to load marketing config:', e)
        setMarketing(prev => ({ ...prev, loaded: true }))
      })
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
