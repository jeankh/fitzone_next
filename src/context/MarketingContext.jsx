'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { MARKETING_DEFAULTS, normalizeMarketingValue } from '../lib/marketing'

const DEFAULTS = {
  ...MARKETING_DEFAULTS,
  whatsapp: '',
  twitter: '',
  instagram: '',
  youtube: '',
  whatsapp_visible: 'false',
  twitter_visible: 'false',
  instagram_visible: 'false',
  youtube_visible: 'false',
  loaded: false,
}

const MarketingContext = createContext(DEFAULTS)

export function MarketingProvider({ children }) {
  const [marketing, setMarketing] = useState(DEFAULTS)

  useEffect(() => {
    fetch('/api/admin/marketing')
      .then(r => r.json())
      .then(data => {
        const normalized = {}
        for (const [k, v] of Object.entries(data || {})) normalized[k] = normalizeMarketingValue(k, v)
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
