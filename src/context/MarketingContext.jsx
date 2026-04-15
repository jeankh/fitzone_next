'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const DEFAULTS = {
  whatsapp: '966500000000',
  whatsapp_visible: 'true',
  social_buttons: [],
}

const MarketingContext = createContext(DEFAULTS)

export function MarketingProvider({ children }) {
  const [marketing, setMarketing] = useState(DEFAULTS)

  useEffect(() => {
    fetch('/api/admin/marketing', { next: { tags: ['marketing'] } })
      .then(r => r.json())
      .then(data => {
        const normalized = {}
        for (const [k, v] of Object.entries(data || {})) normalized[k] = String(v)
        let social_buttons = []
        try { social_buttons = JSON.parse(normalized.social_buttons || '[]') } catch {}
        setMarketing({ ...DEFAULTS, ...normalized, social_buttons })
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
