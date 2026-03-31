'use client'
import { createContext, useContext, useState } from 'react'

const INDIVIDUAL_BOOKS = ['transformation', 'nutrition']
const BUNDLE_ID = 'bundle'

export const BOOKS_DATA = {
  transformation: {
    id: 'transformation',
    icon: '💪',
    image: '/fitzone-workout.jpeg',
    titleAr: 'الدليل الشامل للتنشيف وبناء الجسم',
    titleEn: 'Complete Shredding & Building Guide',
    price: 79,
  },
  nutrition: {
    id: 'nutrition',
    icon: '🥗',
    image: '/fitzone-nutrition.jpeg',
    titleAr: 'الدليل الكامل لخسارة الدهون',
    titleEn: 'Complete Fat Loss Guide',
    price: 79,
  },
  bundle: {
    id: 'bundle',
    icon: '🎁',
    image: '/fitzone-workout.jpeg',
    image2: '/fitzone-nutrition.jpeg',
    titleAr: 'الباقة الكاملة',
    titleEn: 'Complete Bundle',
    // Price = book 1 + book 2 (WhatsApp support is a free gift)
    get price() {
      return BOOKS_DATA.transformation.price + BOOKS_DATA.nutrition.price
    },
  },
}

// ── Event tracking ──────────────────────────────────────────────────────────
const EVENT_KEY = 'fitzone_events'
const EVENT_DEFAULTS = { cart_adds: 0, bundle_upgrades: 0, checkout_starts: 0, purchases: 0 }

export function trackEvent(key) {
  try {
    const stored = JSON.parse(localStorage.getItem(EVENT_KEY) || '{}')
    const updated = { ...EVENT_DEFAULTS, ...stored, [key]: ((stored[key] || 0) + 1) }
    localStorage.setItem(EVENT_KEY, JSON.stringify(updated))
  } catch {}
}

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [wasAutoUpgraded, setWasAutoUpgraded] = useState(false)

  const addToCart = (item) => {
    const id = typeof item === 'string' ? item : item.id

    // Guard: already in cart
    if (cart.includes(id)) return

    // Adding bundle directly → no upgrade banner
    if (id === BUNDLE_ID) {
      setWasAutoUpgraded(false)
      setCart([BUNDLE_ID])
      trackEvent('cart_adds')
      if (typeof window.gtag === 'function') window.gtag('event', 'add_to_cart', { item_id: id, value: BOOKS_DATA[id]?.price })
      return
    }

    const next = [...cart, id]
    const hasAll = INDIVIDUAL_BOOKS.every(b => next.includes(b))

    if (hasAll) {
      // Auto-upgrade to bundle
      setWasAutoUpgraded(true)
      setCart([BUNDLE_ID])
      trackEvent('cart_adds')
      trackEvent('bundle_upgrades')
      if (typeof window.gtag === 'function') window.gtag('event', 'add_to_cart', { item_id: BUNDLE_ID, value: BOOKS_DATA.bundle.price })
    } else {
      setWasAutoUpgraded(false)
      setCart(next)
      trackEvent('cart_adds')
      if (typeof window.gtag === 'function') window.gtag('event', 'add_to_cart', { item_id: id, value: BOOKS_DATA[id]?.price })
    }
  }

  const removeFromCart = (id) => {
    setWasAutoUpgraded(false)
    setCart(prev => prev.filter(item => item !== id))
  }

  const clearCart = () => setCart([])

  const isInCart = (id) => cart.includes(id)

  const getTotal = () =>
    cart.reduce((sum, id) => sum + (BOOKS_DATA[id]?.price || 0), 0)

  // Which individual book is missing (for upsell suggestion)
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
    setIsCheckoutOpen(true)
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
      isCheckoutOpen,
      setIsCheckoutOpen,
      openCheckout,
      BOOKS_DATA,
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
