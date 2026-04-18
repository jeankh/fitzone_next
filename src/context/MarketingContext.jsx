'use client'
import { createContext, useContext, useState } from 'react'

const DEFAULTS = {
  whatsapp: '971509982833',
  whatsapp_visible: 'true',
  social_buttons: [],
}

const MarketingContext = createContext(DEFAULTS)

export function MarketingProvider({ children, initialMarketing }) {
  const [marketing] = useState(() => {
    if (!initialMarketing) return DEFAULTS
    let social_buttons = []
    try { social_buttons = JSON.parse(initialMarketing.social_buttons || '[]') } catch {}
    return { ...initialMarketing, ...DEFAULTS, social_buttons }
  })

  return (
    <MarketingContext.Provider value={marketing}>
      {children}
    </MarketingContext.Provider>
  )
}

export function useMarketing() {
  return useContext(MarketingContext)
}
