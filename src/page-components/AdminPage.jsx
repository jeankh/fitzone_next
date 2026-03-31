'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingCart, Gift, CreditCard, CheckCircle, ExternalLink,
  Copy, LogOut, Lock, BarChart2, Package, Megaphone, RefreshCw, Eye, EyeOff
} from 'lucide-react'
import { BOOKS_DATA } from '../context/CartContext'

const EVENT_KEY = 'fitzone_events'
const EVENT_DEFAULTS = { cart_adds: 0, bundle_upgrades: 0, checkout_starts: 0, purchases: 0 }

function getEvents() {
  try {
    const stored = JSON.parse(localStorage.getItem(EVENT_KEY) || '{}')
    return { ...EVENT_DEFAULTS, ...stored }
  } catch {
    return { ...EVENT_DEFAULTS }
  }
}

function resetEvents() {
  localStorage.setItem(EVENT_KEY, JSON.stringify(EVENT_DEFAULTS))
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {})
}

const ADMIN_PASSWORD = 'fitzone2025'
const SESSION_KEY = 'fitzone_admin'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

const MARKETING_INFO = [
  { label: 'WhatsApp Number', value: '966500000000', copyable: true },
  { label: 'WhatsApp Link', value: 'https://wa.me/966500000000', copyable: true },
  { label: 'Twitter / X', value: 'https://x.com/', copyable: true },
  { label: 'Instagram', value: 'https://instagram.com/', copyable: true },
  { label: 'YouTube', value: 'https://youtube.com/', copyable: true },
  { label: 'GA4 Measurement ID', value: GA_ID, copyable: true },
  { label: 'Hero Headline (AR)', value: 'غيّر جسمك خلال 30 يوم — مع برنامج FitZone', copyable: false },
  { label: 'Hero Headline (EN)', value: 'Transform Your Body in 30 Days — With FitZone Program', copyable: false },
]

const eventCards = [
  { key: 'cart_adds',        label: 'Cart Adds',        icon: ShoppingCart, color: 'text-brand',        bg: 'bg-brand/10' },
  { key: 'bundle_upgrades',  label: 'Bundle Upgrades',  icon: Gift,         color: 'text-[#25d366]',   bg: 'bg-[#25d366]/10' },
  { key: 'checkout_starts',  label: 'Checkout Starts',  icon: CreditCard,   color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
  { key: 'purchases',        label: 'Purchases',         icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
]

// ── Login Gate ───────────────────────────────────────────────────────────────
function LoginGate({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      onSuccess()
    } else {
      setError('Incorrect password.')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6" dir="ltr">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-8">
          <img src="/fitzone-logo.jpeg" alt="FitZone" className="w-10 h-10 rounded-xl object-contain" />
          <span className="text-white text-xl font-bold">FitZone Admin</span>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-6">
            <Lock size={22} className="text-brand" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">Sign in</h1>
          <p className="text-text-secondary text-sm mb-6">Admin access only</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Password"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-11 text-white placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-brand text-white py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors"
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [events, setEvents] = useState(getEvents)
  const [copied, setCopied] = useState(null)

  const handleReset = () => {
    resetEvents()
    setEvents({ ...EVENT_DEFAULTS })
  }

  const handleCopy = (value, label) => {
    copyToClipboard(value)
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  const products = Object.values(BOOKS_DATA)

  return (
    <div className="min-h-screen bg-background" dir="ltr">
      {/* Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/fitzone-logo.jpeg" alt="FitZone" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-white font-bold">FitZone Admin</span>
            <span className="text-text-muted text-sm hidden sm:block">/ Dashboard</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* ── Section 1: Traffic ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-brand" />
              <h2 className="text-white font-bold text-lg">Traffic & Funnel</h2>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-white border border-border hover:border-brand/40 px-3 py-1.5 rounded-lg transition-all"
              >
                <ExternalLink size={13} />
                Open GA4
              </a>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-red-400 border border-border hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-all"
              >
                <RefreshCw size={13} />
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {eventCards.map(({ key, label, icon: Icon, color, bg }) => (
              <div key={key} className="bg-surface border border-border rounded-2xl p-5">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={18} className={color} />
                </div>
                <p className="text-text-secondary text-xs mb-1">{label}</p>
                <p className="text-white text-3xl font-bold">{events[key] ?? 0}</p>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <BarChart2 size={14} className="text-brand" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-0.5">GA4 Real-Time & Historical Data</p>
              <p className="text-text-secondary text-xs leading-relaxed">
                Traffic, page views, sessions, and device breakdowns are tracked in Google Analytics. Local counters above track funnel events from visitors to this browser. GA4 ID: <code className="text-brand bg-brand/10 px-1.5 py-0.5 rounded text-xs">{GA_ID}</code>
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── Section 2: Products ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-5">
            <Package size={18} className="text-brand" />
            <h2 className="text-white font-bold text-lg">Products</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {products.map((book) => (
              <div key={book.id} className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src={book.image}
                    alt={book.titleEn}
                    className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm leading-snug mb-1">{book.titleEn}</p>
                    <p className="text-text-muted text-xs leading-snug">{book.titleAr}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-text-secondary text-xs">Price</span>
                  <span className="text-white font-bold">{book.price} SAR</span>
                </div>
                {book.id === 'bundle' && (
                  <p className="text-[#25d366] text-xs mt-2 flex items-center gap-1">
                    <Gift size={11} />
                    Includes WhatsApp support (free gift)
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Section 3: Marketing Info ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-5">
            <Megaphone size={18} className="text-brand" />
            <h2 className="text-white font-bold text-lg">Marketing Info</h2>
          </div>

          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {MARKETING_INFO.map(({ label, value, copyable }, i) => (
              <div
                key={label}
                className={`flex items-center justify-between gap-4 px-5 py-3.5 ${i < MARKETING_INFO.length - 1 ? 'border-b border-border' : ''}`}
              >
                <span className="text-text-secondary text-sm w-44 flex-shrink-0">{label}</span>
                <span className="text-white text-sm font-mono flex-1 truncate">{value}</span>
                {copyable && (
                  <button
                    onClick={() => handleCopy(value, label)}
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-brand transition-colors flex-shrink-0"
                  >
                    <Copy size={13} />
                    {copied === label ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  )
}

// ── Main Export ──────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  )

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginGate onSuccess={() => setIsAuthenticated(true)} />
  }

  return <Dashboard onLogout={handleLogout} />
}
