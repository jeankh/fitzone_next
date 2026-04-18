'use client'
import { createContext, useContext, useState, useEffect } from 'react'

// Rates are expressed as "1 AED = X <currency>". Base currency is AED (what Stripe charges).
// Update these if base currency changes.
const BASE_CURRENCY = 'AED'
const RATES = {
  AED: { symbol: 'د.إ', symbolEn: 'AED', rate: 1 },
  SAR: { symbol: 'ر.س', symbolEn: 'SAR', rate: 1.02 },
  USD: { symbol: '$',    symbolEn: 'USD', rate: 0.272 },
  EUR: { symbol: '€',    symbolEn: 'EUR', rate: 0.250 },
  GBP: { symbol: '£',    symbolEn: 'GBP', rate: 0.214 },
  KWD: { symbol: 'د.ك', symbolEn: 'KWD', rate: 0.084 },
  QAR: { symbol: 'ر.ق', symbolEn: 'QAR', rate: 0.991 },
  BHD: { symbol: 'د.ب', symbolEn: 'BHD', rate: 0.103 },
  EGP: { symbol: 'ج.م', symbolEn: 'EGP', rate: 13.4  },
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
  const [currency, setCurrency] = useState({ code: BASE_CURRENCY, ...RATES[BASE_CURRENCY] })
  const [countryCode, setCountryCode] = useState('AE')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = sessionStorage.getItem('fitzone_currency')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (RATES[parsed.code]) {
          setCurrency({ code: parsed.code, ...RATES[parsed.code] })
          if (parsed.countryCode) setCountryCode(parsed.countryCode)
          setLoading(false)
          return
        }
      } catch {}
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
      setCurrency({ code: BASE_CURRENCY, ...RATES[BASE_CURRENCY] })
      setCountryCode('AE')
      setLoading(false)
    }, 3000)

    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        clearTimeout(timeout)
        const detectedCountry = data.country_code || 'AE'
        const code = COUNTRY_TO_CURRENCY[detectedCountry] || 'USD'
        const resolved = { code, ...RATES[code] }
        sessionStorage.setItem('fitzone_currency', JSON.stringify({ code, countryCode: detectedCountry }))
        setCurrency(resolved)
        setCountryCode(detectedCountry)
        setLoading(false)
      })
      .catch((e) => {
        console.error('Currency detection failed:', e)
        clearTimeout(timeout)
        setCurrency({ code: BASE_CURRENCY, ...RATES[BASE_CURRENCY] })
        setCountryCode('AE')
        setLoading(false)
      })
  }, [])

  // Input amount is in the base currency (AED — what Stripe charges).
  const formatPrice = (baseAmount, lang) => {
    const converted = Math.round(baseAmount * currency.rate)
    if (currency.code === BASE_CURRENCY) {
      return lang === 'ar' ? `${converted} ${currency.symbol}` : `${currency.symbolEn} ${converted}`
    }
    if (currency.code === 'SAR') {
      return lang === 'ar' ? `${converted} ر.س` : `SAR ${converted}`
    }
    const prefixSymbols = ['$', '£', '€']
    if (!lang || lang === 'en') {
      return prefixSymbols.includes(currency.symbol)
        ? `${currency.symbol}${converted}`
        : `${converted} ${currency.symbolEn}`
    }
    return `${converted} ${currency.symbol}`
  }

  // Format a pre-converted amount (override price already in target currency)
  const formatAmount = (amount, lang) => {
    const rounded = Math.round(amount)
    if (currency.code === 'SAR') {
      return lang === 'ar' ? `${rounded} ر.س` : `SAR ${rounded}`
    }
    const prefixSymbols = ['$', '£', '€']
    if (!lang || lang === 'en') {
      return prefixSymbols.includes(currency.symbol)
        ? `${currency.symbol}${rounded}`
        : `${rounded} ${currency.symbolEn}`
    }
    return `${rounded} ${currency.symbol}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, formatPrice, formatAmount, loading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider')
  return ctx
}
