'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Gift, CreditCard, CheckCircle, ExternalLink,
  Copy, LogOut, Lock, BarChart2, Package, Megaphone, RefreshCw,
  Eye, EyeOff, TrendingUp, AlertTriangle, Pencil, X, Save,
  Plus, Trash2, BookOpen, Upload, Link as LinkIcon, ChevronDown, ChevronUp,
  Globe, DollarSign, Download, Calendar
} from 'lucide-react'
import Image from 'next/image'

const SESSION_KEY = 'fitzone_admin'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'
const EVENT_DEFAULTS = { cart_adds: 0, bundle_upgrades: 0, checkout_starts: 0, purchases: 0 }

const CURRENCIES = [
  { code: 'SAR', symbol: 'SAR', rate: 1 },
  { code: 'USD', symbol: '$',   rate: 0.267 },
  { code: 'EUR', symbol: '€',   rate: 0.245 },
  { code: 'GBP', symbol: '£',   rate: 0.210 },
  { code: 'AED', symbol: 'AED', rate: 0.980 },
  { code: 'KWD', symbol: 'KWD', rate: 0.082 },
  { code: 'QAR', symbol: 'QAR', rate: 0.972 },
  { code: 'BHD', symbol: 'BHD', rate: 0.100 },
  { code: 'EGP', symbol: 'EGP', rate: 13.1  },
]

const COUNTRY_TO_CURRENCY = {
  SA: 'SAR', YE: 'SAR',
  AE: 'AED', KW: 'KWD', QA: 'QAR', BH: 'BHD', EG: 'EGP',
  GB: 'GBP', US: 'USD', CA: 'USD', AU: 'USD',
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
  BE: 'EUR', AT: 'EUR', PT: 'EUR', FI: 'EUR', IE: 'EUR',
  GR: 'EUR', LU: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR',
  LV: 'EUR', LT: 'EUR', CY: 'EUR', MT: 'EUR', HR: 'EUR',
}

// ── Currency Selector ─────────────────────────────────────────────────────────
function CurrencySelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const selected = CURRENCIES.find(c => c.code === value) || CURRENCIES[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-white border border-border hover:border-brand/40 px-3 py-1.5 rounded-lg transition-all"
      >
        <Globe size={13} />
        {selected.code}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1.5 w-32 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => { onChange(c.code); setOpen(false) }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-white/5 ${c.code === value ? 'text-brand' : 'text-text-secondary'}`}
              >
                {c.code}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const eventCards = [
  { key: 'cart_adds',       label: 'Cart Adds',       icon: ShoppingCart, color: 'text-brand',        bg: 'bg-brand/10' },
  { key: 'bundle_upgrades', label: 'Bundle Upgrades', icon: Gift,         color: 'text-[#25d366]',   bg: 'bg-[#25d366]/10' },
  { key: 'checkout_starts', label: 'Checkout Starts', icon: CreditCard,   color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
  { key: 'purchases',       label: 'Purchases',       icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
]

const ADMIN_TABS = [
  { id: 'traffic', label: 'Traffic', icon: BarChart2 },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'blogs', label: 'Blogs', icon: BookOpen },
  { id: 'purchases', label: 'Purchases', icon: DollarSign },
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

  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (res.ok) { sessionStorage.setItem(SESSION_KEY, 'true'); onSuccess() }
      else { setError(data.error || 'Invalid password'); setPassword('') }
    } catch { setError('Server error, try again') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6" dir="ltr">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <Image src="/fitzone-logo.jpeg" alt="FitZone" width={40} height={40} className="w-10 h-10 rounded-xl object-contain" />
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
            <button type="submit" className="w-full bg-brand text-white py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors" disabled={loading}>{loading ? String.fromCharCode(83,105,103,110,105,110,103,32,105,110,46,46,46) : String.fromCharCode(69,110,116,101,114,32,68,97,115,104,98,111,97,114,100)}</button>
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
function DateInput({ value, onChange }) {
  const [display, setDisplay] = useState(value || '')
  const pickerRef = useRef()
  useEffect(() => { setDisplay(value || '') }, [value])

  const toISO = (str) => {
    const digits = str.replace(/[^0-9]/g, '')
    if (digits.length === 8) return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6,8)}`
    return str.replace(/\//g, '-').replace(/[^0-9-]/g, '')
  }

  const handleChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, '')
    let f = digits
    if (digits.length > 4) f = digits.slice(0,4) + '-' + digits.slice(4)
    if (digits.length > 6) f = digits.slice(0,4) + '-' + digits.slice(4,6) + '-' + digits.slice(6,8)
    setDisplay(f)
    const iso = toISO(f)
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) onChange(iso)
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const iso = toISO(e.clipboardData.getData('text').trim())
    setDisplay(iso)
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) onChange(iso)
  }

  return (
    <div className="relative group">
      <input value={display} onChange={handleChange} onPaste={handlePaste}
        onDoubleClick={e => e.target.select()}
        onKeyDown={e => (e.ctrlKey || e.metaKey) && e.key === 'a' && e.target.select()}
        placeholder="YYYY-MM-DD" maxLength={10}
        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 pr-9 text-white text-sm focus:outline-none focus:border-brand transition-colors" />
      <button type="button"
        onClick={() => { setTimeout(() => pickerRef.current?.showPicker?.(), 10) }}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand transition-colors">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>
      <input ref={pickerRef} type="date" value={value}
        onChange={e => { setDisplay(e.target.value); onChange(e.target.value) }}
        className="absolute inset-0 opacity-0 pointer-events-none w-full h-full" tabIndex={-1} />
    </div>
  )
}

// ── Field wrapper with label + char counter ───────────────────────────────────
function Field({ label, hint, count, maxCount, children }) {
  const pct = maxCount ? count / maxCount : 0
  const color = pct > 0.9 ? 'text-red-400' : pct > 0.7 ? 'text-yellow-400' : 'text-text-muted'
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-text-secondary">{label}
          {hint && <span className="ml-1.5 text-text-muted font-normal">{hint}</span>}
        </label>
        {maxCount != null && <span className={`text-xs tabular-nums ${color}`}>{count}/{maxCount}</span>}
      </div>
      {children}
    </div>
  )
}

// ── Blog Editor Modal ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { value: 'workout',   label: 'Workout',   icon: '💪' },
  { value: 'lifestyle', label: 'Lifestyle', icon: '🌱' },
]

function BlogEditor({ post, onSave, onClose }) {
  const isNew = !post?.id
  const [lang, setLang] = useState('en') // active language tab
  const [tab, setTab]   = useState('content') // content | meta | image
  const [form, setForm] = useState({
    id:       post?.id || '',
    title:    { ar: post?.title?.ar    || '', en: post?.title?.en    || '' },
    excerpt:  { ar: post?.excerpt?.ar  || '', en: post?.excerpt?.en  || '' },
    content:  { ar: post?.content?.ar  || '', en: post?.content?.en  || '' },
    category: post?.category  || 'nutrition',
    readTime: { ar: post?.readTime?.ar || '', en: post?.readTime?.en || '' },
    date:     post?.date      || new Date().toISOString().split('T')[0],
    image:    post?.image     || '',
    featured: post?.featured  || false,
  })
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [imageMode,   setImageMode]   = useState('url')
  const [uploading,   setUploading]   = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver,    setDragOver]    = useState(false)
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

  const field = (path) => ({
    value: path.split('.').reduce((o, k) => o?.[k], form) || '',
    onChange: e => set(path, e.target.value),
    onDoubleClick: e => e.target.select(),
    onKeyDown: e => (e.ctrlKey || e.metaKey) && e.key === 'a' && e.target.select(),
  })

  const uploadFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setUploading(true); setUploadError('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const res  = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) { set('image', data.url); setImageMode('url') }
      else setUploadError(data.error || 'Upload failed — add BLOB_READ_WRITE_TOKEN in Vercel')
    } catch { setUploadError('Upload failed — network error') }
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    uploadFile(e.dataTransfer.files?.[0])
  }

  const handleSave = async () => {
    if (!form.title.en && !form.title.ar) return
    setSaving(true)
    try {
      const res  = await fetch('/api/admin/blogs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (data.ok) { setSaved(true); setTimeout(() => { onSave({ ...form, id: data.id || form.id }) }, 600) }
    } catch {}
    setSaving(false)
  }

  // Keyboard shortcut: Ctrl+S / Cmd+S
  useEffect(() => {
    const onKey = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [form])

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const completeness = (() => {
    let done = 0, total = 6
    if (form.title.en)   done++
    if (form.title.ar)   done++
    if (form.excerpt.en) done++
    if (form.content.en) done++
    if (form.image)      done++
    if (form.date)       done++
    return Math.round((done / total) * 100)
  })()

  const inputCls = "w-full bg-[#0d0d0d] border border-white/8 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/20 transition-all placeholder:text-white/20"
  const areaCls  = inputCls + " resize-none font-mono leading-relaxed"

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-4xl my-6 mx-4 bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col"
        style={{ minHeight: '80vh' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center">
              <BookOpen size={15} className="text-brand" />
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold leading-tight">
                {isNew ? 'New Blog Post' : 'Edit Post'}
              </h3>
              <p className="text-white/30 text-xs">
                {form.title.en || form.title.ar || 'Untitled'}
              </p>
            </div>
          </div>

          {/* Completeness bar */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-white/30 text-xs">Completeness</p>
              <p className={`text-xs font-bold ${completeness === 100 ? 'text-emerald-400' : completeness > 60 ? 'text-yellow-400' : 'text-white/50'}`}>
                {completeness}%
              </p>
            </div>
            <div className="w-24 h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${completeness === 100 ? 'bg-emerald-400' : completeness > 60 ? 'bg-yellow-400' : 'bg-brand'}`}
                style={{ width: `${completeness}%` }} />
            </div>
          </div>

          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex items-center gap-1 px-6 pt-4">
          {[
            { id: 'content', label: 'Content' },
            { id: 'meta',    label: 'Settings' },
            { id: 'image',   label: form.image ? '✓ Cover Image' : 'Cover Image' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                tab === t.id
                  ? 'bg-brand/15 text-brand border border-brand/25'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}>
              {t.label}
            </button>
          ))}

          {/* Language toggle — right side */}
          <div className="ml-auto flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {[{ id: 'en', label: 'EN' }, { id: 'ar', label: 'AR' }].map(l => (
              <button key={l.id} onClick={() => setLang(l.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  lang === l.id ? 'bg-white/15 text-white' : 'text-white/30 hover:text-white/60'
                }`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 p-6">

          {/* CONTENT TAB */}
          {tab === 'content' && (
            <div className="space-y-5">
              <Field label={lang === 'ar' ? 'العنوان' : 'Title'} count={form.title[lang].length} maxCount={100}>
                <input {...field(`title.${lang}`)} dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  placeholder={lang === 'ar' ? 'عنوان المقال…' : 'Post title…'}
                  className={inputCls + ' text-base font-semibold'} />
              </Field>

              <Field label={lang === 'ar' ? 'المقتطف' : 'Excerpt'} hint="Shown in blog listing" count={form.excerpt[lang].length} maxCount={200}>
                <textarea {...field(`excerpt.${lang}`)} dir={lang === 'ar' ? 'rtl' : 'ltr'} rows={3}
                  placeholder={lang === 'ar' ? 'وصف مختصر…' : 'Brief description shown in the blog listing…'}
                  className={areaCls} />
              </Field>

              <Field label={lang === 'ar' ? 'المحتوى' : 'Content'} hint="Markdown supported" count={form.content[lang].length}>
                <div className="relative">
                  <textarea {...field(`content.${lang}`)} dir={lang === 'ar' ? 'rtl' : 'ltr'} rows={14}
                    placeholder={lang === 'ar' ? '## العنوان الفرعي\n\nاكتب المحتوى هنا…' : '## Subheading\n\nWrite your content here…'}
                    className={areaCls} />
                  <div className="absolute bottom-3 right-3 text-white/15 text-xs pointer-events-none">
                    {lang === 'ar' ? 'يدعم Markdown' : 'Markdown'}
                  </div>
                </div>
              </Field>

              {/* Missing translation warning */}
              {((lang === 'en' && !form.title.ar) || (lang === 'ar' && !form.title.en)) && (
                <div className="flex items-center gap-2 text-yellow-400/80 text-xs bg-yellow-400/5 border border-yellow-400/15 rounded-xl px-4 py-3">
                  <AlertTriangle size={13} />
                  {lang === 'en' ? 'Arabic version is empty — switch to AR tab to add it' : 'النسخة الإنجليزية فارغة — انتقل إلى EN لإضافتها'}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === 'meta' && (
            <div className="space-y-6">
              {/* Category pills */}
              <Field label="Category">
                <div className="flex gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.value} type="button" onClick={() => set('category', c.value)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        form.category === c.value
                          ? 'bg-brand/15 border-brand/40 text-brand'
                          : 'bg-white/3 border-white/8 text-white/50 hover:text-white hover:border-white/20'
                      }`}>
                      <span>{c.icon}</span>{c.label}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Date">
                  <DateInput value={form.date} onChange={v => set('date', v)} />
                </Field>
                <Field label="Read Time (EN)">
                  <input {...field('readTime.en')} placeholder="5 min read" className={inputCls} />
                </Field>
                <Field label="وقت القراءة (AR)">
                  <input {...field('readTime.ar')} placeholder="٥ دقائق" dir="rtl" className={inputCls} />
                </Field>
              </div>

              {/* Featured toggle */}
              <button type="button" onClick={() => set('featured', !form.featured)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${
                  form.featured
                    ? 'bg-brand/10 border-brand/30'
                    : 'bg-white/3 border-white/8 hover:border-white/15'
                }`}>
                <div className="text-left">
                  <p className={`text-sm font-medium ${form.featured ? 'text-brand' : 'text-white/70'}`}>
                    Featured Post
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">Shows in the hero grid on the blog page</p>
                </div>
                <div className={`w-11 h-6 rounded-full transition-all relative ${form.featured ? 'bg-brand' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.featured ? 'left-6' : 'left-1'}`} />
                </div>
              </button>
            </div>
          )}

          {/* IMAGE TAB */}
          {tab === 'image' && (
            <div className="space-y-4">
              {/* Mode toggle */}
              <div className="flex gap-2">
                {[{ id: 'url', label: 'Image URL', icon: <LinkIcon size={13} /> },
                  { id: 'upload', label: 'Upload File', icon: <Upload size={13} /> }].map(m => (
                  <button key={m.id} type="button" onClick={() => setImageMode(m.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-all ${
                      imageMode === m.id
                        ? 'bg-brand/15 border-brand/35 text-brand'
                        : 'bg-white/3 border-white/8 text-white/40 hover:text-white/70'
                    }`}>
                    {m.icon}{m.label}
                  </button>
                ))}
              </div>

              {imageMode === 'url' ? (
                <Field label="Image URL">
                  <input {...field('image')} placeholder="https://images.unsplash.com/…" className={inputCls} />
                </Field>
              ) : (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-3 h-44 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    dragOver
                      ? 'border-brand bg-brand/8 scale-[1.01]'
                      : 'border-white/12 hover:border-white/25 hover:bg-white/3'
                  }`}>
                  <input ref={fileRef} type="file" accept="image/*" onChange={e => uploadFile(e.target.files?.[0])} className="hidden" />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                      <p className="text-white/40 text-sm">Uploading…</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                        <Upload size={20} className={dragOver ? 'text-brand' : 'text-white/30'} />
                      </div>
                      <div className="text-center">
                        <p className="text-white/60 text-sm">Drop image here or <span className="text-brand">browse</span></p>
                        <p className="text-white/25 text-xs mt-1">PNG, JPG, WebP up to 10MB</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {uploadError && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/5 border border-red-400/15 rounded-xl px-4 py-3">
                  <AlertTriangle size={13} />{uploadError}
                </div>
              )}

              {/* Preview */}
              {form.image && (
                <div className="relative rounded-xl overflow-hidden border border-white/8" style={{ aspectRatio: '16/7' }}>
                  <Image src={form.image} alt="Cover preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-white text-sm font-semibold line-clamp-1">
                        {form.title.en || form.title.ar || 'Post Title'}
                      </p>
                      <p className="text-white/50 text-xs mt-0.5">Cover preview</p>
                    </div>
                    <button type="button" onClick={() => set('image', '')}
                      className="w-7 h-7 rounded-lg bg-black/50 hover:bg-red-500/80 flex items-center justify-center text-white/60 hover:text-white transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/8 bg-white/2 rounded-b-2xl">
          <p className="text-white/20 text-xs hidden sm:block">
            {isNew ? 'Ctrl+S to save' : `ID: ${form.id}`}
          </p>
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-white/40 hover:text-white border border-white/8 hover:border-white/20 rounded-xl transition-all">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || saved}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-brand hover:bg-brand-dark text-white disabled:opacity-50'
              }`}>
              {saved ? <><CheckCircle size={14} />Saved!</> : saving ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><Save size={14} />Save Post</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ onLogout, initialEvents }) {
  const [activeTab, setActiveTab] = useState('traffic')
  // Traffic
  const [events, setEvents] = useState(initialEvents ?? EVENT_DEFAULTS)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Revenue currency (default from IP cache, fallback SAR)
  const [revCurrencyCode, setRevCurrencyCode] = useState(() => {
    try {
      const cached = typeof window !== 'undefined' && sessionStorage.getItem('fitzone_currency')
      if (cached) {
        const parsed = JSON.parse(cached)
        const cc = COUNTRY_TO_CURRENCY[parsed.countryCode]
        if (cc) return cc
        if (parsed.code && CURRENCIES.find(c => c.code === parsed.code)) return parsed.code
      }
    } catch {}
    return 'SAR'
  })

  // Stripe prices (read-only, fetched live)
  const [prices, setPrices] = useState(null)
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [refreshingPrices, setRefreshingPrices] = useState(false)

  // Marketing
  const [marketing, setMarketing] = useState({ whatsapp: '', whatsapp_visible: 'true', social_buttons: [] })
  const [editingMkt, setEditingMkt] = useState(null)
  const [mktInput, setMktInput] = useState('')
  const [savingMkt, setSavingMkt] = useState(false)
  // Social buttons
  const [socialButtons, setSocialButtons] = useState([])
  const [editingSocial, setEditingSocial] = useState(null) // null | 'new' | index
  const [socialForm, setSocialForm] = useState({ label: '', url: '' })
  const [savingSocial, setSavingSocial] = useState(false)
  const [deletingSocial, setDeletingSocial] = useState(null)

  // Blogs
  const [blogs, setBlogs] = useState([])
  const [editingBlog, setEditingBlog] = useState(null) // null | 'new' | post object
  const [deletingBlog, setDeletingBlog] = useState(null)
  const [blogsExpanded, setBlogsExpanded] = useState(true)

  // Misc
  const [copied, setCopied] = useState(null)

  // Purchases
  const [purchases, setPurchases] = useState([])
  const [purchaseStats, setPurchaseStats] = useState({ total: 0, totalRevenue: 0, revenueByCurrency: {}, itemCounts: {} })
  const [purchasesExpanded, setPurchasesExpanded] = useState(true)
  const [purchasesLoading, setPurchasesLoading] = useState(true)

  const loadPurchases = () => {
    setPurchasesLoading(true)
    fetch('/api/admin/purchases').then(r => r.json()).then(data => {
      setPurchases(data.purchases || [])
      setPurchaseStats(data.stats || { total: 0, totalRevenue: 0, revenueByCurrency: {}, itemCounts: {} })
    }).catch(() => {}).finally(() => setPurchasesLoading(false))
  }

  const loadStripePrices = () => {
    setLoadingPrices(true)
    fetch('/api/admin/stripe-prices').then(r => r.json()).then(data => {
      if (!data.error) setPrices(data)
    }).catch(() => {}).finally(() => setLoadingPrices(false))
  }

  const refreshStripePrices = async () => {
    setRefreshingPrices(true)
    // Bust the cache then re-fetch
    await fetch('/api/admin/stripe-prices', { method: 'POST' }).catch(() => {})
    await fetch('/api/admin/stripe-prices').then(r => r.json()).then(data => {
      if (!data.error) setPrices(data)
    }).catch(() => {})
    setRefreshingPrices(false)
  }

  useEffect(() => {
    loadStripePrices()
    fetch('/api/admin/marketing').then(r => r.json()).then(data => {
      setMarketing(data)
      try { setSocialButtons(JSON.parse(data.social_buttons || '[]')) } catch { setSocialButtons([]) }
    }).catch(() => {})
    fetch('/api/admin/blogs').then(r => r.json()).then(data => { if (Array.isArray(data)) setBlogs(data) }).catch(() => {})
    loadPurchases()
  }, [])

  const conversionRate = events.cart_adds > 0 ? Math.round((events.purchases / events.cart_adds) * 100) : 0
  const revCurrency = CURRENCIES.find(c => c.code === revCurrencyCode) || CURRENCIES[0]
  const CURRENCY_RATES = { SAR: 1, USD: 0.267, EUR: 0.245, GBP: 0.210, AED: 0.980, KWD: 0.082, QAR: 0.972, BHD: 0.100, EGP: 13.1 }
  const bundleSAR = prices?.bundle?.amount ?? 158
  const bundlePriceInCurrency = Math.round(bundleSAR * (CURRENCY_RATES[revCurrencyCode] ?? 1))
  const estRevenue = events.purchases * bundlePriceInCurrency

  // ── Handlers ──
  const handleReset = async () => {
    setResetting(true)
    try { await fetch('/api/events', { method: 'DELETE' }); setEvents({ ...EVENT_DEFAULTS }) }
    finally { setResetting(false); setConfirmReset(false) }
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

  const saveSocialButtons = async (buttons) => {
    setSavingSocial(true)
    try {
      await fetch('/api/admin/marketing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ social_buttons: JSON.stringify(buttons) }) })
      setSocialButtons(buttons)
    } finally { setSavingSocial(false) }
  }

  const saveSocialForm = async () => {
    if (!socialForm.label.trim() || !socialForm.url.trim()) return
    let updated
    if (editingSocial === 'new') {
      updated = [...socialButtons, { label: socialForm.label.trim(), url: socialForm.url.trim() }]
    } else {
      updated = socialButtons.map((b, i) => i === editingSocial ? { label: socialForm.label.trim(), url: socialForm.url.trim() } : b)
    }
    await saveSocialButtons(updated)
    setEditingSocial(null)
  }

  const deleteSocialButton = async (index) => {
    await saveSocialButtons(socialButtons.filter((_, i) => i !== index))
    setDeletingSocial(null)
  }

  const toggleMktVisible = async (key) => {
    const visKey = `${key}_visible`
    const current = marketing[visKey] === 'true'
    const next = current ? 'false' : 'true'
    await fetch('/api/admin/marketing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [visKey]: next }) })
    setMarketing(m => ({ ...m, [visKey]: next }))
  }

  const productCards = [
    { id: 'transformation', titleEn: 'Complete Shredding & Building Guide', titleAr: 'الدليل الشامل للتنشيف وبناء الجسم', image: '/fitzone-workout.jpeg' },
    { id: 'nutrition',      titleEn: 'Complete Fat Loss Guide',              titleAr: 'الدليل الكامل لخسارة الدهون',         image: '/fitzone-nutrition.jpeg' },
    { id: 'bundle',         titleEn: 'Complete Bundle',                      titleAr: 'الباقة الكاملة',                       image: '/fitzone-workout.jpeg' },
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
            <Image src="/fitzone-logo.jpeg" alt="FitZone" width={32} height={32} className="w-8 h-8 rounded-lg object-contain" />
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

        <div className="flex flex-wrap gap-2">
          {ADMIN_TABS.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  active
                    ? 'bg-brand/10 border-brand/40 text-brand'
                    : 'bg-surface border-border text-text-secondary hover:text-white hover:border-brand/30'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── 1: Traffic & Funnel ── */}
        {activeTab === 'traffic' && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-brand" />
              <h2 className="text-white font-bold text-lg">Traffic & Funnel</h2>
            </div>
            <div className="flex items-center gap-3">
              <CurrencySelector value={revCurrencyCode} onChange={setRevCurrencyCode} />
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
                <p className="text-white text-3xl font-bold">{estRevenue.toLocaleString()} {revCurrency.symbol}</p>
                <p className="text-text-muted text-xs mt-0.5">{events.purchases} purchases × {bundlePriceInCurrency} {revCurrency.symbol} avg</p>
              </div>
            </div>
          </div>
          <FunnelChart events={events} />
        </motion.section>
        )}

        {/* ── 2: Products (Stripe prices, read-only) ── */}
        {activeTab === 'products' && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="flex items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-brand" />
              <h2 className="text-white font-bold text-lg">Products</h2>
              <span className="text-text-muted text-xs border border-border px-2 py-0.5 rounded-full">Live from Stripe</span>
            </div>
            <button onClick={refreshStripePrices} disabled={refreshingPrices}
              className="flex items-center gap-1.5 text-sm border border-border text-text-secondary hover:text-white hover:border-brand/40 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
              <RefreshCw size={13} className={refreshingPrices ? 'animate-spin' : ''} />Refresh
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {productCards.map((book) => {
              const stripePrice = prices?.[book.id]
              return (
                <div key={book.id} className="bg-surface border border-border rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Image src={book.image} alt={book.titleEn} width={48} height={64} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm leading-snug mb-1">{book.titleEn}</p>
                      <p className="text-text-muted text-xs leading-snug">{book.titleAr}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary text-xs">Stripe Price</span>
                      {loadingPrices ? (
                        <span className="text-text-muted text-xs animate-pulse">Loading...</span>
                      ) : stripePrice ? (
                        <span className="text-white font-bold">{stripePrice.amount} {stripePrice.currency}</span>
                      ) : (
                        <span className="text-red-400 text-xs">Not found</span>
                      )}
                    </div>
                    {book.id === 'bundle' && (
                      <p className="text-[#25d366] text-xs mt-2 flex items-center gap-1">
                        <Gift size={11} />Includes WhatsApp support
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-text-muted text-xs mt-4 flex items-center gap-1.5">
            <ExternalLink size={11} />To change prices, update them in your <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Stripe Dashboard</a>, then click Refresh.
          </p>
        </motion.section>
        )}

        {/* ── 3: Marketing Info (editable) ── */}
        {activeTab === 'marketing' && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="space-y-6">

          {/* WhatsApp */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Megaphone size={18} className="text-brand" />
              <h2 className="text-white font-bold text-lg">WhatsApp</h2>
            </div>
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              {/* WhatsApp number */}
              <div className={`px-5 py-3.5 border-b border-border ${marketing.whatsapp_visible === 'false' ? 'opacity-50' : ''} transition-opacity`}>
                {editingMkt === 'whatsapp' ? (
                  <div className="flex items-center gap-3">
                    <span className="text-text-secondary text-sm w-40 flex-shrink-0">WhatsApp Number</span>
                    <input value={mktInput} onChange={e => setMktInput(e.target.value)} autoFocus
                      className="flex-1 bg-background border border-brand/40 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none" />
                    <SaveBtn saving={savingMkt} onClick={saveMkt} />
                    <CancelBtn onClick={() => setEditingMkt(null)} />
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-text-secondary text-sm w-40 flex-shrink-0">WhatsApp Number</span>
                    <a href={marketing.whatsapp ? `https://wa.me/${marketing.whatsapp}` : undefined} target="_blank" rel="noopener noreferrer"
                      className="text-white text-sm font-mono flex-1 truncate hover:text-brand transition-colors">
                      {marketing.whatsapp || '—'}
                    </a>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => toggleMktVisible('whatsapp')}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all ${marketing.whatsapp_visible !== 'false' ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/5' : 'border-border text-text-muted hover:text-white hover:border-white/20'}`}>
                        {marketing.whatsapp_visible !== 'false' ? <><Eye size={12} />Visible</> : <><EyeOff size={12} />Hidden</>}
                      </button>
                      <button onClick={() => handleCopy(marketing.whatsapp, 'whatsapp')} className="text-text-muted hover:text-brand transition-colors p-1"><Copy size={13} /></button>
                      <button onClick={() => { setEditingMkt('whatsapp'); setMktInput(marketing.whatsapp || '') }} className="text-text-muted hover:text-brand transition-colors p-1"><Pencil size={13} /></button>
                    </div>
                  </div>
                )}
              </div>
              {/* GA4 ID — read only */}
              <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                <span className="text-text-secondary text-sm w-40 flex-shrink-0">GA4 Measurement ID</span>
                <span className="text-white text-sm font-mono flex-1 truncate">{GA_ID}</span>
                <button onClick={() => handleCopy(GA_ID, 'ga4')} className="text-text-muted hover:text-brand transition-colors flex-shrink-0"><Copy size={13} /></button>
              </div>
            </div>
          </div>

          {/* Social Buttons */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LinkIcon size={18} className="text-brand" />
                <h2 className="text-white font-bold text-lg">Social Buttons</h2>
                <span className="text-text-muted text-sm">({socialButtons.length})</span>
              </div>
              <button onClick={() => { setEditingSocial('new'); setSocialForm({ label: '', url: '' }) }}
                className="flex items-center gap-1.5 text-sm bg-brand text-white px-3 py-1.5 rounded-lg hover:bg-brand-dark transition-colors">
                <Plus size={14} />Add Button
              </button>
            </div>

            {/* Add / Edit form */}
            <AnimatePresence>
              {editingSocial !== null && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="bg-surface border border-brand/30 rounded-2xl p-5 mb-4">
                  <p className="text-white text-sm font-semibold mb-4">{editingSocial === 'new' ? 'Add Social Button' : 'Edit Social Button'}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="text-text-muted text-xs mb-1 block">Label (e.g. Instagram, TikTok)</label>
                      <input value={socialForm.label} onChange={e => setSocialForm(f => ({ ...f, label: e.target.value }))}
                        placeholder="Instagram"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/40" />
                    </div>
                    <div className="flex-1">
                      <label className="text-text-muted text-xs mb-1 block">URL</label>
                      <input value={socialForm.url} onChange={e => setSocialForm(f => ({ ...f, url: e.target.value }))}
                        placeholder="https://instagram.com/yourprofile"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/40" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <SaveBtn saving={savingSocial} onClick={saveSocialForm} />
                    <CancelBtn onClick={() => setEditingSocial(null)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {socialButtons.length === 0 ? (
              <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                <p className="text-text-muted text-sm">No social buttons yet. Click "Add Button" to add one.</p>
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                {socialButtons.map((btn, i) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${i < socialButtons.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{btn.label}</p>
                      <a href={btn.url} target="_blank" rel="noopener noreferrer"
                        className="text-text-muted text-xs hover:text-brand transition-colors truncate block">{btn.url}</a>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => handleCopy(btn.url, `social_${i}`)} className="text-text-muted hover:text-brand transition-colors p-1"><Copy size={13} /></button>
                      <button onClick={() => { setEditingSocial(i); setSocialForm({ label: btn.label, url: btn.url }) }}
                        className="text-text-muted hover:text-brand transition-colors p-1"><Pencil size={13} /></button>
                      {deletingSocial === i ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => deleteSocialButton(i)} className="text-xs text-red-400 hover:text-red-300 border border-red-400/30 px-2 py-1 rounded-lg">Delete</button>
                          <button onClick={() => setDeletingSocial(null)} className="text-xs text-text-muted border border-border px-2 py-1 rounded-lg">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingSocial(i)} className="text-text-muted hover:text-red-400 transition-colors p-1"><Trash2 size={13} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.section>
        )}

        {/* ── 5: Blog Management ── */}
        {activeTab === 'blogs' && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.22 }}>
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
                          <Image src={post.image} alt="" width={48} height={40} className="w-12 h-10 object-cover rounded-lg flex-shrink-0" />
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
        )}

        {/* ── 7: Purchases ── */}
        {activeTab === 'purchases' && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.30 }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-brand" />
              <h2 className="text-white font-bold text-lg">Purchases</h2>
              <span className="text-text-muted text-sm">({purchaseStats.total})</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadPurchases} className="text-text-muted hover:text-white transition-colors p-1.5" title="Refresh">
                <RefreshCw size={14} className={purchasesLoading ? 'animate-spin' : ''} />
              </button>
              <button onClick={() => setPurchasesExpanded(e => !e)} className="text-text-muted hover:text-white transition-colors p-1.5">
                {purchasesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {purchasesExpanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-4">

                {/* Stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <p className="text-text-muted text-xs mb-1">Total Orders</p>
                    <p className="text-white text-2xl font-bold">{purchaseStats.total}</p>
                  </div>
                  {Object.entries(purchaseStats.revenueByCurrency || {}).map(([cur, amount]) => (
                    <div key={cur} className="bg-surface border border-border rounded-xl p-4">
                      <p className="text-text-muted text-xs mb-1">Revenue ({cur})</p>
                      <p className="text-emerald-400 text-2xl font-bold">{(amount / 100).toFixed(0)} <span className="text-sm">{cur}</span></p>
                    </div>
                  ))}
                  {Object.entries(purchaseStats.itemCounts || {}).map(([id, count]) => (
                    <div key={id} className="bg-surface border border-border rounded-xl p-4">
                      <p className="text-text-muted text-xs mb-1 capitalize">{id}</p>
                      <p className="text-brand text-2xl font-bold">{count}</p>
                    </div>
                  ))}
                  {purchaseStats.total === 0 && !purchasesLoading && (
                    <div className="col-span-3 bg-surface border border-border rounded-xl p-4 flex items-center justify-center">
                      <p className="text-text-muted text-sm">No purchases yet</p>
                    </div>
                  )}
                </div>

                {/* Purchases table */}
                {purchases.length > 0 && (
                  <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-6 gap-3 px-5 py-2.5 border-b border-border bg-white/[0.02]">
                      {['Date', 'Customer', 'Email', 'Items', 'Amount', 'Status'].map(h => (
                        <span key={h} className="text-text-muted text-xs font-medium">{h}</span>
                      ))}
                    </div>
                    {purchases.map((p, idx) => (
                      <div key={p.id || idx} className={`grid grid-cols-6 gap-3 px-5 py-3.5 items-center ${idx < purchases.length - 1 ? 'border-b border-border' : ''}`}>
                        <span className="text-text-secondary text-xs">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-white text-xs truncate">{p.name || '—'}</p>
                          {p.phone && <p className="text-text-muted text-[10px] font-mono truncate">{p.phone}</p>}
                        </div>
                        <span className="text-text-secondary text-xs truncate">{p.email || '—'}</span>
                        <div className="flex flex-wrap gap-1">
                          {(p.items || '').split(',').filter(Boolean).map(id => (
                            <span key={id} className="text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded capitalize">{id}</span>
                          ))}
                        </div>
                        <span className="text-white text-xs font-bold">
                          {(p.amount / 100).toFixed(0)} {(p.currency || 'sar').toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                          {p.status || 'paid'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {purchasesLoading && (
                  <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                    <RefreshCw size={20} className="text-text-muted mx-auto animate-spin" />
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
        )}

      </div>
    </div>
  )
}


// ── Main Export ───────────────────────────────────────────────────────────────
export default function AdminPage({ initialEvents }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => { try { return sessionStorage.getItem(SESSION_KEY) === 'true' } catch { return false } }
  )

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      fetch('/api/admin/prices').then(r => {
        if (r.status === 401) { sessionStorage.removeItem(SESSION_KEY); setIsAuthenticated(false) }
      }).catch(() => {})
    }
  }, [])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
    sessionStorage.removeItem(SESSION_KEY)
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) return <LoginGate onSuccess={() => setIsAuthenticated(true)} />
  return <Dashboard onLogout={handleLogout} initialEvents={initialEvents} />
}
