'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const RATES = {
  SAR: { symbol: 'ر.س', symbolEn: 'SAR', rate: 1 },
  USD: { symbol: '$',    symbolEn: 'USD', rate: 0.267 },
  EUR: { symbol: '€',    symbolEn: 'EUR', rate: 0.245 },
  GBP: { symbol: '£',    symbolEn: 'GBP', rate: 0.210 },
  AED: { symbol: 'د.إ', symbolEn: 'AED', rate: 0.980 },
  KWD: { symbol: 'د.ك', symbolEn: 'KWD', rate: 0.082 },
  QAR: { symbol: 'ر.ق', symbolEn: 'QAR', rate: 0.972 },
  BHD: { symbol: 'د.ب', symbolEn: 'BHD', rate: 0.100 },
  EGP: { symbol: 'ج.م', symbolEn: 'EGP', rate: 13.1  },
}

const COUNTRY_TO_CURRENCY = {
  SA: 'SAR', YE: 'SAR',
  AE: 'AED',
  KW: 'KWD',
  QA: 'QAR',
  BH: 'BHD',
  EG: 'EGP',
  GB: 'GBP',
  US: 'USD', CA: 'USD', AU: 'USD', NZ: 'USD',
  // EU countries
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
  BE: 'EUR', AT: 'EUR', PT: 'EUR', FI: 'EUR', IE: 'EUR',
  GR: 'EUR', LU: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR',
  LV: 'EUR', LT: 'EUR', CY: 'EUR', MT: 'EUR', HR: 'EUR',
}

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(RATES.SAR)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = sessionStorage.getItem('fitzone_currency')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (RATES[parsed.code]) {
          setCurrency({ code: parsed.code, ...RATES[parsed.code] })
          setLoading(false)
          return
        }
      } catch {}
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
      setCurrency({ code: 'SAR', ...RATES.SAR })
      setLoading(false)
    }, 3000)

    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        clearTimeout(timeout)
        const code = COUNTRY_TO_CURRENCY[data.country_code] || 'USD'
        const resolved = { code, ...RATES[code] }
        sessionStorage.setItem('fitzone_currency', JSON.stringify({ code }))
        setCurrency(resolved)
        setLoading(false)
      })
      .catch(() => {
        clearTimeout(timeout)
        setCurrency({ code: 'SAR', ...RATES.SAR })
        setLoading(false)
      })
  }, [])

  const formatPrice = (sarAmount, lang) => {
    const converted = Math.round(sarAmount * currency.rate)
    const sym = lang === 'ar' ? currency.symbol : currency.symbolEn
    // For SAR in Arabic: "79 ر.س", for USD: "$ 21", for others: symbol before or after
    if (currency.code === 'SAR') {
      return lang === 'ar' ? `${converted} ر.س` : `SAR ${converted}`
    }
    // Western symbols ($, £, €) go before the number
    const prefixSymbols = ['$', '£', '€']
    if (!lang || lang === 'en') {
      return prefixSymbols.includes(currency.symbol)
        ? `${currency.symbol}${converted}`
        : `${converted} ${currency.symbolEn}`
    }
    // Arabic: always number then symbol
    return `${converted} ${currency.symbol}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, formatPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider')
  return ctx
}
