'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const INDIVIDUAL_BOOKS = ['transformation', 'nutrition']
const BUNDLE_ID = 'bundle'

const DEFAULT_PRICES = { transformation: 79, nutrition: 79 }

export const BOOKS_DATA = {
  transformation: {
    id: 'transformation',
    icon: '💪',
    image: '/fitzone-workout.jpeg',
    titleAr: 'الدليل الشامل للتنشيف وبناء الجسم',
    titleEn: 'Complete Shredding & Building Guide',
  },
  nutrition: {
    id: 'nutrition',
    icon: '🥗',
    image: '/fitzone-nutrition.jpeg',
    titleAr: 'الدليل الكامل لخسارة الدهون',
    titleEn: 'Complete Fat Loss Guide',
  },
  bundle: {
    id: 'bundle',
    icon: '🎁',
    image: '/fitzone-workout.jpeg',
    image2: '/fitzone-nutrition.jpeg',
    titleAr: 'الباقة الكاملة',
    titleEn: 'Complete Bundle',
  },
}

// ── Event tracking ──────────────────────────────────────────────────────────
export function trackEvent(key) {
  try {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    }).catch(() => {})
  } catch {}
}

const CartContext = createContext()

export function CartProvider({ children }) {
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [wasAutoUpgraded, setWasAutoUpgraded] = useState(false)
  const [prices, setPrices] = useState(DEFAULT_PRICES)
  const [currencyPrices, setCurrencyPrices] = useState({})

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/prices').then(r => r.json()),
      fetch('/api/admin/currency-prices').then(r => r.json()),
    ]).then(([basePrices, cpData]) => {
      setPrices({ transformation: Number(basePrices.transformation), nutrition: Number(basePrices.nutrition) })
      setCurrencyPrices(cpData || {})
    }).catch(() => {
      fetch('/api/admin/prices').then(r => r.json())
        .then(data => setPrices({ transformation: Number(data.transformation), nutrition: Number(data.nutrition) }))
        .catch(() => {})
    })
  }, [])

  const getPrice = (id) => {
    if (id === 'transformation') return prices.transformation
    if (id === 'nutrition') return prices.nutrition
    if (id === 'bundle') return prices.transformation + prices.nutrition
    return 0
  }

  // Returns override price in the given currency code, or null if no override (use formatPrice instead)
  const getCurrencyPrice = (id, currencyCode) => {
    if (!currencyCode) return null
    if (id === 'bundle') {
      const t = getCurrencyPrice('transformation', currencyCode)
      const n = getCurrencyPrice('nutrition', currencyCode)
      if (t !== null && n !== null) return t + n
      return null
    }
    const key = `${currencyCode}_${id}`
    if (key in currencyPrices && currencyPrices[key] !== '') return Number(currencyPrices[key])
    return null
  }

  const getBooksData = () => ({
    ...BOOKS_DATA,
    transformation: { ...BOOKS_DATA.transformation, price: prices.transformation },
    nutrition: { ...BOOKS_DATA.nutrition, price: prices.nutrition },
    bundle: { ...BOOKS_DATA.bundle, price: prices.transformation + prices.nutrition },
  })

  const addToCart = (item) => {
    const id = typeof item === 'string' ? item : item.id
    if (cart.includes(id)) return

    if (id === BUNDLE_ID) {
      setWasAutoUpgraded(false)
      setCart([BUNDLE_ID])
      trackEvent('cart_adds')
      if (typeof window.gtag === 'function') window.gtag('event', 'add_to_cart', { item_id: id, value: getPrice(id) })
      return
    }

    const next = [...cart, id]
    const hasAll = INDIVIDUAL_BOOKS.every(b => next.includes(b))

    if (hasAll) {
      setWasAutoUpgraded(true)
      setCart([BUNDLE_ID])
      trackEvent('cart_adds')
      trackEvent('bundle_upgrades')
      if (typeof window.gtag === 'function') window.gtag('event', 'add_to_cart', { item_id: BUNDLE_ID, value: getPrice(BUNDLE_ID) })
    } else {
      setWasAutoUpgraded(false)
      setCart(next)
      trackEvent('cart_adds')
      if (typeof window.gtag === 'function') window.gtag('event', 'add_to_cart', { item_id: id, value: getPrice(id) })
    }
  }

  const removeFromCart = (id) => {
    setWasAutoUpgraded(false)
    setCart(prev => prev.filter(item => item !== id))
  }

  const clearCart = () => setCart([])
  const isInCart = (id) => cart.includes(id)
  const getTotal = () => cart.reduce((sum, id) => sum + getPrice(id), 0)

  const getMissingBook = () => {
    if (cart.includes(BUNDLE_ID)) return null
    const inCart = INDIVIDUAL_BOOKS.filter(id => cart.includes(id))
    if (inCart.length !== 1) return null
    return INDIVIDUAL_BOOKS.find(id => !cart.includes(id))
  }

  const openCheckout = () => {
    trackEvent('checkout_starts')
    if (typeof window.gtag === 'function') window.gtag('event', 'begin_checkout', { value: getTotal(), currency: 'SAR' })
    setIsCartOpen(false)
    router.push('/checkout')
  }

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
      getTotal,
      getMissingBook,
      wasAutoUpgraded,
      isCartOpen,
      setIsCartOpen,
      openCheckout,
      BOOKS_DATA: getBooksData(),
      prices,
      currencyPrices,
      getCurrencyPrice,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
