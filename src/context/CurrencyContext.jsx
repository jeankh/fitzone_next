'use client'
import { createContext, useContext, useState, useEffect } from 'react'

// Symbols only — no hardcoded rates. Actual prices come from Stripe's currency_options.
// If Stripe has no option for the visitor's currency, we fall back to the base Stripe
// currency so the displayed price always matches what Checkout will charge.
const DEFAULT_BASE = 'AED'
const SYMBOLS = {
  AED: { symbol: 'د.إ', symbolEn: 'AED' },
  SAR: { symbol: 'ر.س', symbolEn: 'SAR' },
  USD: { symbol: '$',    symbolEn: 'USD' },
  EUR: { symbol: '€',    symbolEn: 'EUR' },
  GBP: { symbol: '£',    symbolEn: 'GBP' },
  KWD: { symbol: 'د.ك', symbolEn: 'KWD' },
  QAR: { symbol: 'ر.ق', symbolEn: 'QAR' },
  BHD: { symbol: 'د.ب', symbolEn: 'BHD' },
  OMR: { symbol: 'ر.ع', symbolEn: 'OMR' },
  JOD: { symbol: 'د.أ', symbolEn: 'JOD' },
  EGP: { symbol: 'ج.م', symbolEn: 'EGP' },
}

const COUNTRY_TO_CURRENCY = {
  SA: 'SAR', YE: 'SAR',
  AE: 'AED',
  KW: 'KWD',
  QA: 'QAR',
  BH: 'BHD',
  OM: 'OMR',
  JO: 'JOD',
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

function renderAmount(code, amount, lang) {
  const sym = SYMBOLS[code] || { symbol: code, symbolEn: code }
  const isWhole = Number.isInteger(amount)
  const display = isWhole ? String(amount) : amount.toFixed(2)
  if (code === 'AED') return lang === 'ar' ? `${display} ${sym.symbol}` : `${sym.symbolEn} ${display}`
  if (code === 'SAR') return lang === 'ar' ? `${display} ر.س` : `SAR ${display}`
  const prefixSymbols = ['$', '£', '€']
  if (!lang || lang === 'en') {
    return prefixSymbols.includes(sym.symbol) ? `${sym.symbol}${display}` : `${display} ${sym.symbolEn}`
  }
  return `${display} ${sym.symbol}`
}

export function CurrencyProvider({ children, priceOptions, baseCurrency }) {
  const base = (baseCurrency || DEFAULT_BASE).toUpperCase()
  const [currencyCode, setCurrencyCode] = useState(base)
  const [countryCode, setCountryCode] = useState('AE')
  const [loading, setLoading] = useState(true)

  // Only accept a detected currency if Stripe actually has a price for it (any product).
  // Otherwise stick with the base currency so the displayed price matches Checkout.
  const hasStripePriceFor = (code) => {
    if (!priceOptions) return code === base
    return Object.values(priceOptions).some(opts => opts && opts[code] != null)
  }

  useEffect(() => {
    const cached = sessionStorage.getItem('fitzone_currency')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (SYMBOLS[parsed.code] && hasStripePriceFor(parsed.code)) {
          setCurrencyCode(parsed.code)
          if (parsed.countryCode) setCountryCode(parsed.countryCode)
          setLoading(false)
          return
        }
      } catch {}
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
      setCurrencyCode(base)
      setLoading(false)
    }, 3000)

    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        clearTimeout(timeout)
        const detectedCountry = data.country_code || 'AE'
        const detected = COUNTRY_TO_CURRENCY[detectedCountry] || 'USD'
        const code = hasStripePriceFor(detected) ? detected : base
        sessionStorage.setItem('fitzone_currency', JSON.stringify({ code, countryCode: detectedCountry }))
        setCurrencyCode(code)
        setCountryCode(detectedCountry)
        setLoading(false)
      })
      .catch((e) => {
        console.error('Currency detection failed:', e)
        clearTimeout(timeout)
        setCurrencyCode(base)
        setLoading(false)
      })
  }, [])

  const currency = { code: currencyCode, ...(SYMBOLS[currencyCode] || SYMBOLS[base]) }

  // Lookup the Stripe-priced amount for a product in the active currency.
  // Falls back to the base currency amount if Stripe has no option for this currency.
  const priceFor = (productId) => {
    if (!priceOptions || !priceOptions[productId]) return null
    const opts = priceOptions[productId]
    if (opts[currencyCode] != null) return { code: currencyCode, amount: opts[currencyCode] }
    if (opts[base] != null) return { code: base, amount: opts[base] }
    const first = Object.entries(opts)[0]
    return first ? { code: first[0], amount: first[1] } : null
  }

  const formatPriceFor = (productId, lang) => {
    const p = priceFor(productId)
    if (!p) return ''
    return renderAmount(p.code, p.amount, lang)
  }

  // Back-compat: callers that pass a raw number (base-currency amount) keep working.
  const formatPrice = (amount, lang) => renderAmount(base, amount, lang)
  const formatAmount = (amount, lang) => renderAmount(currencyCode, amount, lang)

  return (
    <CurrencyContext.Provider value={{ currency, currencyCode, countryCode, formatPrice, formatPriceFor, formatAmount, priceFor, loading, baseCurrency: base }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider')
  return ctx
}
