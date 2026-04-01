'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Gift, CreditCard, CheckCircle, ExternalLink,
  Copy, LogOut, Lock, BarChart2, Package, Megaphone, RefreshCw,
  Eye, EyeOff, TrendingUp, AlertTriangle, Pencil, X, Save,
  Plus, Trash2, BookOpen, Upload, Link as LinkIcon, ChevronDown, ChevronUp
} from 'lucide-react'

const ADMIN_PASSWORD = 'fitzone2025'
const SESSION_KEY = 'fitzone_admin'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'
const EVENT_DEFAULTS = { cart_adds: 0, bundle_upgrades: 0, checkout_starts: 0, purchases: 0 }

const eventCards = [
  { key: 'cart_adds',       label: 'Cart Adds',       icon: ShoppingCart, color: 'text-brand',        bg: 'bg-brand/10' },
  { key: 'bundle_upgrades', label: 'Bundle Upgrades', icon: Gift,         color: 'text-[#25d366]',   bg: 'bg-[#25d366]/10' },
  { key: 'checkout_starts', label: 'Checkout Starts', icon: CreditCard,   color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
  { key: 'purchases',       label: 'Purchases',       icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function SaveBtn({ saving, onClick }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="flex items-center gap-1 text-xs bg-brand text-white px-3 py-1.5 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50">
      <Save size={12} />{saving ? 'Saving…' : 'Save'}
    </button>
  )
}
function CancelBtn({ onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1 text-xs text-text-muted hover:text-white border border-border px-3 py-1.5 rounded-lg transition-colors">
      <X size={12} />Cancel
    </button>
  )
}

// ── Login Gate ────────────────────────────────────────────────────────────────
function LoginGate({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) { sessionStorage.setItem(SESSION_KEY, 'true'); onSuccess() }
    else { setError('Incorrect password.'); setPassword('') }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6" dir="ltr">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <img src="/fitzone-logo.jpeg" alt="FitZone" className="w-10 h-10 rounded-xl object-contain" />
          <span className="text-white text-xl font-bold">FitZone Admin</span>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-8">
          <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-6"><Lock size={22} className="text-brand" /></div>
          <h1 className="text-white text-2xl font-bold mb-1">Sign in</h1>
          <p className="text-text-secondary text-sm mb-6">Admin access only</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Password" autoFocus
                className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-11 text-white placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors" />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-brand text-white py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors">Enter Dashboard</button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// ── Funnel Chart ──────────────────────────────────────────────────────────────
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
        const dropPct = i > 0 && steps[i - 1].value > 0 ? Math.round((1 - step.value / steps[i - 1].value) * 100) : null
        return (
          <div key={step.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-text-secondary text-xs">{step.label}</span>
              <div className="flex items-center gap-2">
                {dropPct !== null && <span className="text-red-400 text-xs">-{dropPct}%</span>}
                <span className="text-white text-xs font-bold">{step.value}</span>
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full ${step.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Smart Date Input ──────────────────────────────────────────────────────────
// Displays as YYYY-MM-DD text with auto-slash, double-click select-all, paste.
// Stores value in YYYY-MM-DD format. Has a hidden date picker for mouse/calendar.
function DateInput({ value, onChange }) {
  const [display, setDisplay] = useState(value || '')
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef()

  // Sync display when value changes externally
  useEffect(() => { setDisplay(value || '') }, [value])

  const toISO = (str) => {
    // Accept YYYY-MM-DD or YYYY/MM/DD or YYYYMMDD
    const clean = str.replace(/\//g, '-').replace(/[^0-9-]/g, '')
    const digits = clean.replace(/-/g, '')
    if (digits.length === 8) return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}`
    return clean
  }

  const handleKeyDown = (e) => {
    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
      e.target.select()
    }
  }

  const handleChange = (e) => {
    let raw = e.target.value
    const prev = display
    // Strip non-digit non-dash chars
    const digits = raw.replace(/[^0-9]/g, '')
    // Auto-insert dashes after position 4 and 7
    let formatted = digits
    if (digits.length > 4) formatted = digits.slice(0,4) + '-' + digits.slice(4)
    if (digits.length > 6) formatted = digits.slice(0,4) + '-' + digits.slice(4,6) + '-' + digits.slice(6,8)
    setDisplay(formatted)
    const iso = toISO(formatted)
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) onChange(iso)
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim()
    const iso = toISO(pasted)
    setDisplay(iso)
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) onChange(iso)
  }

  const handlePickerChange = (e) => {
    const iso = e.target.value
    setDisplay(iso)
    onChange(iso)
    setShowPicker(false)
  }

  return (
    <div className="relative">
      <input
        value={display}
        onChange={handleChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onDoubleClick={e => e.target.select()}
        placeholder="YYYY-MM-DD"
        maxLength={10}
        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 pr-9 text-white text-sm focus:outline-none focus:border-brand transition-colors"
      />
      <button type="button" onClick={() => { setShowPicker(p => !p); setTimeout(() => pickerRef.current?.showPicker?.(), 50) }}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand transition-colors">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>
      <input ref={pickerRef} type="date" value={value} onChange={handlePickerChange}
        className="absolute inset-0 opacity-0 pointer-events-none w-full h-full" tabIndex={-1} />
    </div>
  )
}

// ── Blog Editor Modal ─────────────────────────────────────────────────────────
function BlogEditor({ post, onSave, onClose }) {
  const isNew = !post?.id
  const [form, setForm] = useState({
    id: post?.id || '',
    title: { ar: post?.title?.ar || '', en: post?.title?.en || '' },
    excerpt: { ar: post?.excerpt?.ar || '', en: post?.excerpt?.en || '' },
    content: { ar: post?.content?.ar || '', en: post?.content?.en || '' },
    category: post?.category || 'nutrition',
    readTime: { ar: post?.readTime?.ar || '', en: post?.readTime?.en || '' },
    date: post?.date || new Date().toISOString().split('T')[0],
    image: post?.image || '',
    featured: post?.featured || false,
  })
  const [saving, setSaving] = useState(false)
  const [imageMode, setImageMode] = useState('url') // 'url' | 'upload'
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef()

  const set = (path, value) => {
    const keys = path.split('.')
    setForm(prev => {
      const next = { ...prev }
      if (keys.length === 1) next[keys[0]] = value
      else next[keys[0]] = { ...prev[keys[0]], [keys[1]]: value }
      return next
    })
  }

  // Universal input handler — works for keyboard, paste, autofill, drag-drop
  const handle = (path) => (e) => set(path, e.target.value)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        set('image', data.url)
      } else {
        setUploadError(data.error || 'Upload failed — check BLOB_READ_WRITE_TOKEN in Vercel env vars')
      }
    } catch {
      setUploadError('Upload failed — network error')
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.title.en && !form.title.ar) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.ok) onSave({ ...form, id: data.id || form.id })
    } catch {}
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="w-full max-w-3xl bg-surface border border-border rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-white font-bold">{isNew ? 'New Blog Post' : 'Edit Blog Post'}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Title (AR)</label>
              <input value={form.title.ar} onChange={handle('title.ar')} onPaste={handle('title.ar')} onDoubleClick={e => e.target.select()} dir="rtl"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand transition-colors" />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Title (EN)</label>
              <input value={form.title.en} onChange={handle('title.en')} onPaste={handle('title.en')} onDoubleClick={e => e.target.select()}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand transition-colors" />
            </div>
          </div>

          {/* Excerpt */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Excerpt (AR)</label>
              <textarea value={form.excerpt.ar} onChange={handle('excerpt.ar')} rows={2} dir="rtl"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand transition-colors resize-none" />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Excerpt (EN)</label>
              <textarea value={form.excerpt.en} onChange={handle('excerpt.en')} rows={2}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand transition-colors resize-none" />
            </div>
          </div>

          {/* Content */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Content (AR) — Markdown supported</label>
              <textarea value={form.content.ar} onChange={handle('content.ar')} rows={8} dir="rtl"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-brand transition-colors resize-y" />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Content (EN) — Markdown supported</label>
              <textarea value={form.content.en} onChange={handle('content.en')} rows={8}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-brand transition-colors resize-y" />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="text-text-secondary text-xs mb-1.5 block">Cover Image</label>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setImageMode('url')}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${imageMode === 'url' ? 'bg-brand/10 border-brand/40 text-brand' : 'border-border text-text-muted hover:text-white'}`}>
                <LinkIcon size={12} />URL
              </button>
              <button onClick={() => setImageMode('upload')}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${imageMode === 'upload' ? 'bg-brand/10 border-brand/40 text-brand' : 'border-border text-text-muted hover:text-white'}`}>
                <Upload size={12} />Upload
              </button>
            </div>
            {imageMode === 'url' ? (
              <input value={form.image} onChange={handle('image')} onDoubleClick={e => e.target.select()} placeholder="https://..."
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand transition-colors" />
            ) : (
              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 border border-dashed border-border hover:border-brand/40 rounded-xl px-4 py-3 text-text-secondary hover:text-white text-sm transition-colors w-full justify-center">
                  <Upload size={15} />{uploading ? 'Uploading…' : 'Choose image file'}
                </button>
                {uploadError && <p className="text-red-400 text-xs mt-1.5">{uploadError}</p>}
              </div>
            )}
            {form.image && (
              <img src={form.image} alt="" className="mt-2 h-24 w-full object-cover rounded-xl" />
            )}
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Category</label>
              <select value={form.category} onChange={handle('category')}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand transition-colors">
                <option value="nutrition">Nutrition</option>
                <option value="workout">Workout</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Read Time (AR)</label>
              <input value={form.readTime.ar} onChange={handle('readTime.ar')} onDoubleClick={e => e.target.select()} placeholder="٥ دقائق" dir="rtl"
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand transition-colors" />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Read Time (EN)</label>
              <input value={form.readTime.en} onChange={handle('readTime.en')} onDoubleClick={e => e.target.select()} placeholder="5 min read"
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand transition-colors" />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Date</label>
              <DateInput value={form.date} onChange={v => set('date', v)} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-brand" />
            <span className="text-text-secondary text-sm">Featured post (shows in hero grid)</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <CancelBtn onClick={onClose} />
          <SaveBtn saving={saving} onClick={handleSave} />
        </div>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ onLogout, initialEvents }) {
  // Traffic
  const [events, setEvents] = useState(initialEvents ?? EVENT_DEFAULTS)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Prices
  const [prices, setPrices] = useState({ transformation: 79, nutrition: 79 })
  const [editingPrice, setEditingPrice] = useState(null) // 'transformation' | 'nutrition'
  const [priceInput, setPriceInput] = useState('')
  const [savingPrice, setSavingPrice] = useState(false)

  // Marketing
  const [marketing, setMarketing] = useState({ whatsapp: '', twitter: '', instagram: '', youtube: '' })
  const [editingMkt, setEditingMkt] = useState(null)
  const [mktInput, setMktInput] = useState('')
  const [savingMkt, setSavingMkt] = useState(false)

  // Blogs
  const [blogs, setBlogs] = useState([])
  const [editingBlog, setEditingBlog] = useState(null) // null | 'new' | post object
  const [deletingBlog, setDeletingBlog] = useState(null)
  const [blogsExpanded, setBlogsExpanded] = useState(true)

  // Misc
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    fetch('/api/admin/prices').then(r => r.json()).then(setPrices).catch(() => {})
    fetch('/api/admin/marketing').then(r => r.json()).then(setMarketing).catch(() => {})
    fetch('/api/admin/blogs').then(r => r.json()).then(data => { if (Array.isArray(data)) setBlogs(data) }).catch(() => {})
  }, [])

  const conversionRate = events.cart_adds > 0 ? Math.round((events.purchases / events.cart_adds) * 100) : 0
  const bundlePrice = prices.transformation + prices.nutrition
  const estRevenue = events.purchases * bundlePrice

  // ── Handlers ──
  const handleReset = async () => {
    setResetting(true)
    try { await fetch('/api/events', { method: 'DELETE' }); setEvents({ ...EVENT_DEFAULTS }) }
    finally { setResetting(false); setConfirmReset(false) }
  }

  const startEditPrice = (id, currentPrice) => { setEditingPrice(id); setPriceInput(String(currentPrice)) }
  const savePrice = async () => {
    setSavingPrice(true)
    try {
      await fetch('/api/admin/prices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [editingPrice]: Number(priceInput) }) })
      setPrices(p => ({ ...p, [editingPrice]: Number(priceInput) }))
      setEditingPrice(null)
    } finally { setSavingPrice(false) }
  }

  const startEditMkt = (key, val) => { setEditingMkt(key); setMktInput(val) }
  const saveMkt = async () => {
    setSavingMkt(true)
    try {
      await fetch('/api/admin/marketing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [editingMkt]: mktInput }) })
      setMarketing(m => ({ ...m, [editingMkt]: mktInput }))
      setEditingMkt(null)
    } finally { setSavingMkt(false) }
  }

  const handleBlogSave = (saved) => {
    setBlogs(prev => {
      const idx = prev.findIndex(p => p.id === saved.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
      return [saved, ...prev]
    })
    setEditingBlog(null)
  }

  const handleBlogDelete = async (id) => {
    await fetch(`/api/admin/blogs?id=${id}`, { method: 'DELETE' })
    setBlogs(prev => prev.filter(p => p.id !== id))
    setDeletingBlog(null)
  }

  const handleCopy = (value, label) => {
    navigator.clipboard.writeText(value).catch(() => {})
    setCopied(label); setTimeout(() => setCopied(null), 1500)
  }

  const mktFields = [
    { key: 'whatsapp', label: 'WhatsApp Number' },
    { key: 'twitter',  label: 'Twitter / X' },
    { key: 'instagram',label: 'Instagram' },
    { key: 'youtube',  label: 'YouTube' },
  ]

  const productCards = [
    { id: 'transformation', titleEn: 'Complete Shredding & Building Guide', titleAr: 'الدليل الشامل للتنشيف وبناء الجسم', image: '/fitzone-workout.jpeg', price: prices.transformation },
    { id: 'nutrition',      titleEn: 'Complete Fat Loss Guide',              titleAr: 'الدليل الكامل لخسارة الدهون',         image: '/fitzone-nutrition.jpeg', price: prices.nutrition },
    { id: 'bundle',         titleEn: 'Complete Bundle',                      titleAr: 'الباقة الكاملة',                       image: '/fitzone-workout.jpeg', price: bundlePrice, isBundle: true },
  ]

  return (
    <div className="min-h-screen bg-background" dir="ltr">
      {/* Blog editor modal */}
      <AnimatePresence>
        {editingBlog !== null && (
          <BlogEditor
            post={editingBlog === 'new' ? null : editingBlog}
            onSave={handleBlogSave}
            onClose={() => setEditingBlog(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/fitzone-logo.jpeg" alt="FitZone" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-white font-bold">FitZone Admin</span>
            <span className="text-text-muted text-sm hidden sm:block">/ Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-white border border-border hover:border-brand/40 px-3 py-1.5 rounded-lg transition-all">
              <ExternalLink size={13} />View Site
            </a>
            <button onClick={onLogout} className="flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors">
              <LogOut size={15} /><span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* ── 1: Traffic & Funnel ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-brand" />
              <h2 className="text-white font-bold text-lg">Traffic & Funnel</h2>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-white border border-border hover:border-brand/40 px-3 py-1.5 rounded-lg transition-all">
                <ExternalLink size={13} />Open GA4
              </a>
              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary text-xs flex items-center gap-1"><AlertTriangle size={12} className="text-yellow-400" />Are you sure?</span>
                  <button onClick={handleReset} disabled={resetting} className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 px-3 py-1.5 rounded-lg transition-all">
                    {resetting ? 'Resetting…' : 'Yes, reset'}
                  </button>
                  <button onClick={() => setConfirmReset(false)} className="text-xs text-text-muted hover:text-white border border-border px-3 py-1.5 rounded-lg transition-all">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmReset(true)} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-red-400 border border-border hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-all">
                  <RefreshCw size={13} />Reset
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {eventCards.map(({ key, label, icon: Icon, color, bg }) => (
              <div key={key} className="bg-surface border border-border rounded-2xl p-5">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}><Icon size={18} className={color} /></div>
                <p className="text-text-secondary text-xs mb-1">{label}</p>
                <p className="text-white text-3xl font-bold">{events[key] ?? 0}</p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0"><TrendingUp size={18} className="text-purple-400" /></div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Conversion Rate</p>
                <p className="text-white text-3xl font-bold">{conversionRate}%</p>
                <p className="text-text-muted text-xs mt-0.5">purchases ÷ cart adds</p>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0"><CheckCircle size={18} className="text-emerald-400" /></div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Est. Revenue</p>
                <p className="text-white text-3xl font-bold">{estRevenue.toLocaleString()} SAR</p>
                <p className="text-text-muted text-xs mt-0.5">{events.purchases} purchases × {bundlePrice} SAR avg</p>
              </div>
            </div>
          </div>
          <FunnelChart events={events} />
        </motion.section>

        {/* ── 2: Products (editable prices) ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-5">
            <Package size={18} className="text-brand" />
            <h2 className="text-white font-bold text-lg">Products</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {productCards.map((book) => (
              <div key={book.id} className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <img src={book.image} alt={book.titleEn} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm leading-snug mb-1">{book.titleEn}</p>
                    <p className="text-text-muted text-xs leading-snug">{book.titleAr}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-border">
                  {!book.isBundle && editingPrice === book.id ? (
                    <div className="flex items-center gap-2">
                      <input type="number" value={priceInput} onChange={e => setPriceInput(e.target.value)}
                        className="flex-1 bg-background border border-brand/40 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none w-20" />
                      <span className="text-text-muted text-xs">SAR</span>
                      <SaveBtn saving={savingPrice} onClick={savePrice} />
                      <CancelBtn onClick={() => setEditingPrice(null)} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary text-xs">Price</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{book.price} SAR</span>
                        {!book.isBundle && (
                          <button onClick={() => startEditPrice(book.id, book.price)} className="text-text-muted hover:text-brand transition-colors">
                            <Pencil size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {book.isBundle && (
                    <p className="text-[#25d366] text-xs mt-2 flex items-center gap-1">
                      <Gift size={11} />Includes WhatsApp support (free gift)
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── 3: Marketing Info (editable) ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <div className="flex items-center gap-2 mb-5">
            <Megaphone size={18} className="text-brand" />
            <h2 className="text-white font-bold text-lg">Marketing Info</h2>
          </div>
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {mktFields.map(({ key, label }, i) => {
              const val = marketing[key] || ''
              const isEditing = editingMkt === key
              return (
                <div key={key} className={`px-5 py-3.5 ${i < mktFields.length - 1 ? 'border-b border-border' : ''}`}>
                  {isEditing ? (
                    <div className="flex items-center gap-3">
                      <span className="text-text-secondary text-sm w-40 flex-shrink-0">{label}</span>
                      <input value={mktInput} onChange={e => setMktInput(e.target.value)} autoFocus
                        className="flex-1 bg-background border border-brand/40 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none" />
                      <SaveBtn saving={savingMkt} onClick={saveMkt} />
                      <CancelBtn onClick={() => setEditingMkt(null)} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-text-secondary text-sm w-40 flex-shrink-0">{label}</span>
                      <a href={val.startsWith('http') ? val : val ? `https://wa.me/${val}` : undefined}
                        target="_blank" rel="noopener noreferrer"
                        className={`text-white text-sm font-mono flex-1 truncate ${val.startsWith('http') || val ? 'hover:text-brand transition-colors' : 'text-text-muted'}`}>
                        {val || '—'}
                      </a>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handleCopy(val, key)} className="text-text-muted hover:text-brand transition-colors">
                          <Copy size={13} />
                        </button>
                        <button onClick={() => startEditMkt(key, val)} className="text-text-muted hover:text-brand transition-colors">
                          <Pencil size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {/* GA4 ID — read only */}
            <div className="px-5 py-3.5 flex items-center justify-between gap-4">
              <span className="text-text-secondary text-sm w-40 flex-shrink-0">GA4 Measurement ID</span>
              <span className="text-white text-sm font-mono flex-1 truncate">{GA_ID}</span>
              <button onClick={() => handleCopy(GA_ID, 'ga4')} className="text-text-muted hover:text-brand transition-colors flex-shrink-0">
                <Copy size={13} />
              </button>
            </div>
          </div>
        </motion.section>

        {/* ── 4: Blog Management ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-brand" />
              <h2 className="text-white font-bold text-lg">Blog Posts</h2>
              <span className="text-text-muted text-sm">({blogs.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditingBlog('new')}
                className="flex items-center gap-1.5 text-sm bg-brand text-white px-3 py-1.5 rounded-lg hover:bg-brand-dark transition-colors">
                <Plus size={14} />New Post
              </button>
              <button onClick={() => setBlogsExpanded(e => !e)} className="text-text-muted hover:text-white transition-colors p-1.5">
                {blogsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {blogsExpanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                {blogs.length === 0 ? (
                  <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                    <p className="text-text-muted text-sm">No posts yet. Click "New Post" to add one.</p>
                  </div>
                ) : (
                  <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    {blogs.map((post, i) => (
                      <div key={post.id} className={`flex items-center gap-4 px-5 py-3.5 ${i < blogs.length - 1 ? 'border-b border-border' : ''}`}>
                        {post.image && (
                          <img src={post.image} alt="" className="w-12 h-10 object-cover rounded-lg flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{post.title?.en || post.title?.ar}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-text-muted text-xs capitalize">{post.category}</span>
                            <span className="text-text-muted text-xs">·</span>
                            <span className="text-text-muted text-xs">{post.date}</span>
                            {post.featured && <span className="text-brand text-xs">· Featured</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => setEditingBlog(post)} className="text-text-muted hover:text-brand transition-colors p-1">
                            <Pencil size={14} />
                          </button>
                          {deletingBlog === post.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleBlogDelete(post.id)} className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 px-2 py-1 rounded-lg">Delete</button>
                              <button onClick={() => setDeletingBlog(null)} className="text-xs text-text-muted border border-border px-2 py-1 rounded-lg">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeletingBlog(post.id)} className="text-text-muted hover:text-red-400 transition-colors p-1">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

      </div>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function AdminPage({ initialEvents }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => { try { return sessionStorage.getItem(SESSION_KEY) === 'true' } catch { return false } }
  )
  const handleLogout = () => { sessionStorage.removeItem(SESSION_KEY); setIsAuthenticated(false) }

  if (!isAuthenticated) return <LoginGate onSuccess={() => setIsAuthenticated(true)} />
  return <Dashboard onLogout={handleLogout} initialEvents={initialEvents} />
}
