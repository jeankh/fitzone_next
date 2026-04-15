'use client'
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from './UserContext'

const STORAGE_KEY = 'fitzone_cart'
const INDIVIDUAL_BOOKS = ['transformation', 'nutrition']
const BUNDLE_ID = 'bundle'
const DEFAULT_PRICES = { transformation: 79, nutrition: 79, bundle: 158 }

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

export function trackEvent(key) {
  try {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    }).catch(() => {})
  } catch {}
}

function readLocalCart() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function writeLocalCart(cart) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)) } catch {}
}

async function saveServerCart(cart) {
  try {
    await fetch('/api/user/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart }),
    })
  } catch {}
}

async function loadServerCart() {
  try {
    const res = await fetch('/api/user/cart')
    if (res.ok) {
      const data = await res.json()
      return Array.isArray(data.cart) ? data.cart : []
    }
  } catch {}
  return null
}

const CartContext = createContext()

export function CartProvider({ children }) {
  const router = useRouter()
  const { user } = useUser()
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [wasAutoUpgraded, setWasAutoUpgraded] = useState(false)
  const [prices, setPrices] = useState(DEFAULT_PRICES)
  const [currencyPrices, setCurrencyPrices] = useState({})
  const [hydrated, setHydrated] = useState(false)
  const userRef = useRef(user)
  userRef.current = user

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    const local = readLocalCart()
    setCart(local)
    setHydrated(true)
  }, [])

  // When user logs in, merge: load server cart, merge with local, persist both
  useEffect(() => {
    if (!hydrated) return
    if (user) {
      (async () => {
        const serverCart = await loadServerCart()
        if (serverCart && serverCart.length > 0) {
          const local = readLocalCart()
          const merged = mergeCarts(local, serverCart)
          setCart(merged)
          writeLocalCart(merged)
          await saveServerCart(merged)
        } else {
          await saveServerCart(readLocalCart())
        }
      })()
    }
  }, [hydrated, !!user])

  // Sync cart to localStorage + server whenever it changes (after hydration)
  const prevCartRef = useRef(cart)
  useEffect(() => {
    if (!hydrated) return
    if (cart === prevCartRef.current) return
    prevCartRef.current = cart
    writeLocalCart(cart)
    if (userRef.current) saveServerCart(cart)
  }, [cart, hydrated])

  const getPrice = useCallback((id) => {
    if (id === 'transformation') return prices.transformation
    if (id === 'nutrition') return prices.nutrition
    if (id === 'bundle') return prices.bundle
    return 0
  }, [prices])

  const getCurrencyPrice = useCallback((id, currencyCode) => {
    if (!currencyCode) return null
    const key = `${currencyCode}_${id}`
    if (key in currencyPrices && currencyPrices[key] !== '') return Number(currencyPrices[key])
    return null
  }, [currencyPrices])

  const booksData = useMemo(() => ({
    ...BOOKS_DATA,
    transformation: { ...BOOKS_DATA.transformation, price: prices.transformation },
    nutrition: { ...BOOKS_DATA.nutrition, price: prices.nutrition },
    bundle: { ...BOOKS_DATA.bundle, price: prices.bundle },
  }), [prices])

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/prices', { next: { tags: ['prices'] } }).then(r => r.json()),
      fetch('/api/admin/currency-prices', { next: { tags: ['currency-prices'] } }).then(r => r.json()),
    ]).then(([basePrices, cpData]) => {
      setPrices({ transformation: Number(basePrices.transformation), nutrition: Number(basePrices.nutrition), bundle: Number(basePrices.bundle) })
      setCurrencyPrices(cpData || {})
    }).catch(() => {
      fetch('/api/admin/prices', { next: { tags: ['prices'] } }).then(r => r.json())
        .then(data => setPrices({ transformation: Number(data.transformation), nutrition: Number(data.nutrition), bundle: Number(data.bundle) }))
        .catch((e) => console.error('Failed to load prices:', e))
    })
  }, [])

  const addToCart = useCallback((item) => {
    const id = typeof item === 'string' ? item : item.id

    setCart(prev => {
      if (prev.includes(id)) return prev

      if (id === BUNDLE_ID) {
        setWasAutoUpgraded(false)
        trackEvent('cart_adds')
        if (typeof window.gtag === 'function') window.gtag('event', 'add_to_cart', { item_id: id, value: getPrice(id) })
        return [BUNDLE_ID]
      }

      const next = [...prev, id]
      const hasAll = INDIVIDUAL_BOOKS.every(b => next.includes(b))

      if (hasAll) {
        setWasAutoUpgraded(true)
        trackEvent('cart_adds')
        trackEvent('bundle_upgrades')
        if (typeof window.gtag === 'function') window.gtag('event', 'add_to_cart', { item_id: BUNDLE_ID, value: getPrice(BUNDLE_ID) })
        return [BUNDLE_ID]
      }

      setWasAutoUpgraded(false)
      trackEvent('cart_adds')
      if (typeof window.gtag === 'function') window.gtag('event', 'add_to_cart', { item_id: id, value: getPrice(id) })
      return next
    })
  }, [getPrice])

  const removeFromCart = useCallback((id) => {
    setWasAutoUpgraded(false)
    setCart(prev => prev.filter(item => item !== id))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])
  const isInCart = useCallback((id) => cart.includes(id), [cart])
  const getTotal = useCallback(() => cart.reduce((sum, id) => sum + getPrice(id), 0), [cart, getPrice])

  const getMissingBook = useCallback(() => {
    if (cart.includes(BUNDLE_ID)) return null
    const inCart = INDIVIDUAL_BOOKS.filter(id => cart.includes(id))
    if (inCart.length !== 1) return null
    return INDIVIDUAL_BOOKS.find(id => !cart.includes(id))
  }, [cart])

  const openCheckout = useCallback(() => {
    trackEvent('checkout_starts')
    if (typeof window.gtag === 'function') window.gtag('event', 'begin_checkout', { value: getTotal(), currency: 'SAR' })
    setIsCartOpen(false)
    router.push('/checkout')
  }, [getTotal, router])

  const value = useMemo(() => ({
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
    BOOKS_DATA: booksData,
    prices,
    currencyPrices,
    getCurrencyPrice,
  }), [cart, addToCart, removeFromCart, clearCart, isInCart, getTotal, getMissingBook, wasAutoUpgraded, isCartOpen, openCheckout, booksData, prices, currencyPrices, getCurrencyPrice])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

function mergeCarts(local, server) {
  const combined = new Set([...server, ...local])
  if (combined.has(BUNDLE_ID)) return [BUNDLE_ID]
  if (combined.has('transformation') && combined.has('nutrition')) return [BUNDLE_ID]
  return [...combined]
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
