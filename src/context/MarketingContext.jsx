'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const DEFAULTS = {
  whatsapp: '966500000000',
  twitter: 'https://x.com/',
  instagram: 'https://instagram.com/',
  youtube: 'https://youtube.com/',
}

const MarketingContext = createContext(DEFAULTS)

export function MarketingProvider({ children }) {
  const [marketing, setMarketing] = useState(DEFAULTS)

  useEffect(() => {
    fetch('/api/admin/marketing')
      .then(r => r.json())
      .then(data => setMarketing({ ...DEFAULTS, ...data }))
      .catch(() => {})
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
