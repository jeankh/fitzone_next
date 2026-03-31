'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingCart, Gift, CreditCard, CheckCircle, ExternalLink,
  Copy, LogOut, Lock, BarChart2, Package, Megaphone, RefreshCw,
  Eye, EyeOff, TrendingUp, AlertTriangle
} from 'lucide-react'
import { BOOKS_DATA } from '../context/CartContext'

const ADMIN_PASSWORD = 'fitzone2025'
const SESSION_KEY = 'fitzone_admin'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

const EVENT_DEFAULTS = { cart_adds: 0, bundle_upgrades: 0, checkout_starts: 0, purchases: 0 }

const MARKETING_INFO = [
  { label: 'WhatsApp Number', value: '966500000000', copyable: true },
  { label: 'WhatsApp Link', value: 'https://wa.me/966500000000', copyable: true },
  { label: 'Twitter / X', value: 'https://x.com/', copyable: true },
  { label: 'Instagram', value: 'https://instagram.com/', copyable: true },
  { label: 'YouTube', value: 'https://youtube.com/', copyable: true },
  { label: 'GA4 Measurement ID', value: GA_ID, copyable: true },
]

const eventCards = [
  { key: 'cart_adds',       label: 'Cart Adds',       icon: ShoppingCart, color: 'text-brand',        bg: 'bg-brand/10' },
  { key: 'bundle_upgrades', label: 'Bundle Upgrades', icon: Gift,         color: 'text-[#25d366]',   bg: 'bg-[#25d366]/10' },
  { key: 'checkout_starts', label: 'Checkout Starts', icon: CreditCard,   color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
  { key: 'purchases',       label: 'Purchases',       icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
]

// ── Login Gate ────────────────────────────────────────────────────────────────
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

// ── Funnel Bar Chart ──────────────────────────────────────────────────────────
function FunnelChart({ events }) {
  const steps = [
    { label: 'Cart Adds',       value: events.cart_adds,       color: 'bg-brand' },
    { label: 'Checkout Starts', value: events.checkout_starts, color: 'bg-yellow-400' },
    { label: 'Purchases',       value: events.purchases,       color: 'bg-emerald-400' },
  ]
  const max = Math.max(...steps.map(s => s.value), 1)

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
      <p className="text-white text-sm font-semibold mb-4">Conversion Funnel</p>
      {steps.map((step, i) => {
        const pct = Math.round((step.value / max) * 100)
        const dropPct = i > 0 && steps[i - 1].value > 0
          ? Math.round((1 - step.value / steps[i - 1].value) * 100)
          : null
        return (
          <div key={step.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-text-secondary text-xs">{step.label}</span>
              <div className="flex items-center gap-2">
                {dropPct !== null && (
                  <span className="text-red-400 text-xs">-{dropPct}%</span>
                )}
                <span className="text-white text-xs font-bold">{step.value}</span>
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full ${step.color} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ onLogout, initialEvents }) {
  const [events, setEvents] = useState(initialEvents ?? EVENT_DEFAULTS)
  const [copied, setCopied] = useState(null)
  const [resetting, setResetting] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const conversionRate = events.cart_adds > 0
    ? Math.round((events.purchases / events.cart_adds) * 100)
    : 0

  const avgOrderValue = events.purchases > 0
    ? Math.round(
        (events.purchases * BOOKS_DATA.bundle.price) / events.purchases
      )
    : BOOKS_DATA.bundle.price

  const handleReset = async () => {
    setResetting(true)
    try {
      await fetch('/api/events', { method: 'DELETE' })
      setEvents({ ...EVENT_DEFAULTS })
    } finally {
      setResetting(false)
      setConfirmReset(false)
    }
  }

  const handleCopy = (value, label) => {
    navigator.clipboard.writeText(value).catch(() => {})
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
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-white border border-border hover:border-brand/40 px-3 py-1.5 rounded-lg transition-all"
            >
              <ExternalLink size={13} />
              View Site
            </a>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* ── Section 1: Traffic & Funnel ── */}
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
              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary text-xs flex items-center gap-1">
                    <AlertTriangle size={12} className="text-yellow-400" />
                    Are you sure?
                  </span>
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 px-3 py-1.5 rounded-lg transition-all"
                  >
                    {resetting ? 'Resetting…' : 'Yes, reset'}
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="text-xs text-text-muted hover:text-white border border-border px-3 py-1.5 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-red-400 border border-border hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-all"
                >
                  <RefreshCw size={13} />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Event counter cards */}
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

          {/* Conversion rate + revenue row */}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} className="text-purple-400" />
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Conversion Rate</p>
                <p className="text-white text-3xl font-bold">{conversionRate}%</p>
                <p className="text-text-muted text-xs mt-0.5">purchases ÷ cart adds</p>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Est. Revenue</p>
                <p className="text-white text-3xl font-bold">
                  {(events.purchases * avgOrderValue).toLocaleString()} SAR
                </p>
                <p className="text-text-muted text-xs mt-0.5">{events.purchases} purchases × {avgOrderValue} SAR avg</p>
              </div>
            </div>
          </div>

          {/* Funnel chart */}
          <FunnelChart events={events} />
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
                <a
                  href={value.startsWith('http') ? value : undefined}
                  target={value.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={`text-white text-sm font-mono flex-1 truncate ${value.startsWith('http') ? 'hover:text-brand transition-colors' : ''}`}
                >
                  {value}
                </a>
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

// ── Main Export ───────────────────────────────────────────────────────────────
export default function AdminPage({ initialEvents }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => {
      try { return sessionStorage.getItem(SESSION_KEY) === 'true' } catch { return false }
    }
  )

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginGate onSuccess={() => setIsAuthenticated(true)} />
  }

  return <Dashboard onLogout={handleLogout} initialEvents={initialEvents} />
}
