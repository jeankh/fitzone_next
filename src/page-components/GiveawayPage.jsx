'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, Gift, Trophy, Share2, CheckCircle, AlertCircle,
  ArrowRight, ArrowLeft, Sparkles, Copy, Users, Clock, Instagram,
  ExternalLink, Star
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import Image from 'next/image'

const PRIZE_LABELS = {
  transformation: { ar: 'دليل التنشيف وبناء الجسم', en: 'Shredding & Building Guide' },
  nutrition:      { ar: 'دليل خسارة الدهون',          en: 'Fat Loss Guide' },
  bundle:         { ar: 'الباقة الكاملة (كتابان)',     en: 'Complete Bundle (2 Books)' },
}

const BONUS_ACTIONS = [
  { id: 'instagram', icon: Instagram, points: 1, labelAr: 'تابع حسابنا على الانستقرام',    labelEn: 'Follow us on Instagram'    },
  { id: 'story',     icon: Share2,    points: 2, labelAr: 'شارك الكمبيوتر على ستوري',      labelEn: 'Share to your Story'       },
  { id: 'refer',     icon: Users,     points: 3, labelAr: 'أحل صديق للمشاركة (لكل صديق)',  labelEn: 'Refer a friend (per entry)' },
]

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(endDate) {
  const calc = useCallback(() => {
    if (!endDate) return null
    const diff = new Date(endDate) - new Date()
    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
    const days    = Math.floor(diff / 86400000)
    const hours   = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000)  / 60000)
    const seconds = Math.floor((diff % 60000)    / 1000)
    const under24h = diff < 86400000
    return { expired: false, days, hours, minutes, seconds, under24h }
  }, [endDate])

  const [time, setTime] = useState(calc)
  useEffect(() => {
    if (!endDate) return
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [endDate, calc])
  return time
}

// ── Floating Label Input ──────────────────────────────────────────────────────
function FloatingInput({ icon: Icon, error, touched, children }) {
  return (
    <div className="space-y-1.5">
      <div className={`relative rounded-2xl border transition-all duration-200 bg-white/[0.03] overflow-hidden ${
        touched && error   ? 'border-red-500/60 ring-1 ring-red-500/20' :
        touched && !error  ? 'border-emerald-500/40 ring-1 ring-emerald-500/10' :
                             'border-white/10 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/15'
      }`}>
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Icon size={16} className={touched && error ? 'text-red-400/60' : touched && !error ? 'text-emerald-400/60' : 'text-white/25'} />
          </div>
        )}
        <div className="pl-11">{children}</div>
        {touched && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CheckCircle size={15} className="text-emerald-400/70" />
          </div>
        )}
        {touched && error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <AlertCircle size={15} className="text-red-400/70" />
          </div>
        )}
      </div>
      <AnimatePresence>
        {touched && error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-red-400 text-xs flex items-center gap-1.5 pl-1">
            <AlertCircle size={11} />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Countdown Display ─────────────────────────────────────────────────────────
function CountdownDisplay({ time, lang }) {
  if (!time || time.expired) return null
  const t = (ar, en) => lang === 'ar' ? ar : en
  const units = time.under24h
    ? [{ v: time.hours, l: t('ساعة', 'hr') }, { v: time.minutes, l: t('دقيقة', 'min') }, { v: time.seconds, l: t('ثانية', 'sec') }]
    : [{ v: time.days, l: t('يوم', 'day') }, { v: time.hours, l: t('ساعة', 'hr') }, { v: time.minutes, l: t('دقيقة', 'min') }]

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${time.under24h ? 'bg-red-500/10 border-red-500/30' : 'bg-white/[0.04] border-white/10'}`}>
      <Clock size={13} className={time.under24h ? 'text-red-400' : 'text-white/40'} />
      <div className="flex items-center gap-3">
        {units.map(({ v, l }) => (
          <div key={l} className="flex items-baseline gap-1">
            <span className={`text-base font-bold tabular-nums ${time.under24h ? 'text-red-400' : 'text-white'}`}>{String(v).padStart(2, '0')}</span>
            <span className="text-white/30 text-xs">{l}</span>
          </div>
        ))}
      </div>
      {time.under24h && <span className="text-red-400 text-xs font-semibold">{t('آخر فرصة!', 'Last chance!')}</span>}
    </div>
  )
}

// ── Referral Link Box ─────────────────────────────────────────────────────────
function ReferralBox({ referralCode, lang, totalEntries }) {
  const [copied, setCopied] = useState(false)
  const t = (ar, en) => lang === 'ar' ? ar : en

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/giveaway?ref=${referralCode}`
    : `/giveaway?ref=${referralCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="bg-brand/10 border border-brand/30 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Users size={15} className="text-brand" />
        <p className="text-brand font-semibold text-sm">{t('رابط الإحالة الخاص بك', 'Your Referral Link')}</p>
        <span className="ml-auto text-brand/70 text-xs bg-brand/10 px-2 py-0.5 rounded-full">+3 {t('مشاركات', 'entries')}</span>
      </div>
      <p className="text-white/50 text-xs leading-relaxed">
        {t(
          'كل صديق يشارك عبر رابطك يمنحك 3 مشاركات إضافية في السحب!',
          'Every friend who enters via your link earns you 3 extra entries in the draw!'
        )}
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-black/30 border border-white/8 rounded-xl px-3 py-2 text-white/60 text-xs font-mono truncate" dir="ltr">
          {referralUrl}
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all flex-shrink-0 ${copied ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-white/15 text-white/60 hover:text-white hover:border-white/30'}`}>
          {copied ? <><CheckCircle size={12} />{t('تم النسخ', 'Copied!')}</> : <><Copy size={12} />{t('نسخ', 'Copy')}</>}
        </motion.button>
      </div>
      <p className="text-white/30 text-xs">
        {t('مشاركاتك الحالية:', 'Your current entries:')} <span className="text-white font-bold">{totalEntries}</span>
      </p>
    </div>
  )
}

// ── Story Share Card ──────────────────────────────────────────────────────────
function StoryCard({ config, lang, prizeLabel, cardRef }) {
  return (
    <div
      ref={cardRef}
      style={{
        width: 320, height: 568,
        background: 'linear-gradient(160deg, #09090b 0%, #1c0a16 45%, #09090b 100%)',
        borderRadius: 32,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px', position: 'relative', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 240, height: 240, background: 'rgba(220,38,38,0.12)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, right: -40, width: 180, height: 180, background: 'rgba(220,38,38,0.06)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Logo */}
      <Image src="/fitzone-logo.jpeg" alt="FitZone" width={72} height={72} style={{ borderRadius: 18, objectFit: 'cover', marginBottom: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />

      {/* Entry badge */}
      <div style={{ background: 'rgba(220,38,38,0.18)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 999, padding: '7px 18px', marginBottom: 20 }}>
        <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 700 }}>
          {lang === 'ar' ? '🎉 سجّلت في السحب!' : '🎉 I just entered to win!'}
        </span>
      </div>

      {/* Prize name */}
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 10, letterSpacing: 2, textTransform: 'uppercase' }}>
        {lang === 'ar' ? 'الجائزة' : 'PRIZE'}
      </p>
      <p style={{ color: '#ffffff', fontSize: 20, fontWeight: 800, textAlign: 'center', lineHeight: 1.25, marginBottom: 28 }}>
        {prizeLabel}
      </p>

      {/* Divider */}
      <div style={{ width: 40, height: 2, background: 'rgba(220,38,38,0.4)', borderRadius: 2, marginBottom: 20 }} />

      {/* CTA */}
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', lineHeight: 1.6 }}>
        {lang === 'ar' ? 'شارك أنت أيضاً عبر الرابط' : 'Enter too via the link below'}
      </p>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, marginTop: 6 }}>fitzone.com/giveaway</p>

      {/* Watermark trophy */}
      <div style={{ position: 'absolute', bottom: 24, right: 24, opacity: 0.06 }}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function GiveawayPage({ config: initialConfig }) {
  const { lang } = useLanguage()
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight
  const isRtl = lang === 'ar'
  const t = (ar, en) => lang === 'ar' ? ar : en

  const [config,      setConfig]      = useState(initialConfig)
  const [totalCount,  setTotalCount]  = useState(0)
  const [step,        setStep]        = useState('form')
  const [form,        setForm]        = useState({ name: '', email: '', phone: '', _hp: '', optIn: false })
  const [errors,      setErrors]      = useState({})
  const [touched,     setTouched]     = useState({})
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [refCode,     setRefCode]     = useState('')
  const [myEntries,   setMyEntries]   = useState(1)
  const [bonusFromRef,setBonusFromRef]= useState(false)
  const cardRef = useRef()

  // Read ?ref= from URL
  const [referredBy, setReferredBy] = useState('')
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setReferredBy(params.get('ref') || '')
    // Fetch live entry count for social proof
    fetch('/api/giveaway/info').then(r => r.json()).then(data => {
      setTotalCount(data.totalCount || 0)
      if (data.config) setConfig(data.config)
    }).catch(() => {})
  }, [])

  const prizeLabel = config ? (PRIZE_LABELS[config.prize] || { ar: config.prize, en: config.prize })[lang] : ''
  const countdown = useCountdown(config?.endDate)

  const validate = (name, value) => {
    if (name === '_hp') return ''
    if (name === 'optIn') return ''
    if (!value?.trim?.()) return t('مطلوب', 'Required')
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('بريد غير صالح', 'Invalid email')
    if (name === 'phone' && value.replace(/\D/g, '').length < 5) return t('رقم غير صالح', 'Invalid phone')
    return ''
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const v = type === 'checkbox' ? checked : value
    setForm(p => ({ ...p, [name]: v }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const handleBlur = (name) => {
    setTouched(p => ({ ...p, [name]: true }))
    setErrors(p => ({ ...p, [name]: validate(name, form[name]) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fields = ['name', 'email', 'phone']
    const newErrors = {}
    const newTouched = {}
    fields.forEach(f => { newTouched[f] = true; newErrors[f] = validate(f, form[f]) })
    setTouched(newTouched)
    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/giveaway/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, referredBy }),
      })
      const data = await res.json()
      if (data.ok) {
        setRefCode(data.referralCode || '')
        setMyEntries(data.totalEntries || 1)
        setBonusFromRef(!!data.bonusFromReferral)
        setTotalCount(data.totalCount || totalCount + 1)
        setStep('success')
      } else {
        const errMap = {
          all_fields_required: t('جميع الحقول مطلوبة', 'All fields required'),
          invalid_email:       t('بريد إلكتروني غير صالح', 'Invalid email'),
          no_active_giveaway:  t('لا توجد مسابقة نشطة حالياً', 'No active giveaway'),
          giveaway_ended:      t('انتهت مدة المسابقة', 'Giveaway has ended'),
          entries_full:        t('اكتمل عدد المشاركين', 'Max entries reached'),
          already_entered:     t('لقد سجلت مشاركتك مسبقاً بهذا البريد الإلكتروني', 'You have already entered with this email'),
        }
        setSubmitError(errMap[data.error] || t('حدث خطأ. حاول مجدداً.', 'Something went wrong. Please try again.'))
      }
    } catch {
      setSubmitError(t('حدث خطأ في الاتصال', 'Connection error. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        backgroundColor: '#09090b',
        scale: 2,
      })
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'fitzone-giveaway.png', { type: 'image/png' })
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'FitZone Giveaway' })
        } else {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url; a.download = 'fitzone-giveaway.png'; a.click()
          URL.revokeObjectURL(url)
        }
      }, 'image/png')
    } catch {}
  }

  // ── No giveaway / inactive ──
  if (!config || !config.active || (countdown?.expired)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Gift size={30} className="text-white/30" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">{t('لا توجد مسابقة نشطة', 'No Active Giveaway')}</h1>
          <p className="text-white/40 text-sm mb-6">{t('تابعنا لمعرفة القادم.', 'Follow us to be the first to know about the next one.')}</p>
          <a href="/programs"
            className="inline-flex items-center gap-2 text-sm bg-brand/10 border border-brand/30 text-brand px-5 py-2.5 rounded-2xl hover:bg-brand/20 transition-all">
            {t('تصفح البرامج', 'Browse Programs')}<Arrow size={14} />
          </a>
        </div>
      </div>
    )
  }

  // ── Success ──
  if (step === 'success') {
    return (
      <div className="min-h-screen pt-20 pb-20 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-md mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>

            {/* Confetti-ish header */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={44} className="text-emerald-400" />
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-2">{t("أنت في السحب! 🎉", "You're in the draw! 🎉")}</h1>
            <p className="text-white/50 text-sm mb-2">
              {t('مشاركتك في السحب على', "You've entered the draw for")}{' '}
              <span className="text-brand font-semibold">{prizeLabel}</span>
            </p>

            {bonusFromRef && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-full mb-6">
                <Star size={11} />{t('حصلت على مشاركة إضافية لاستخدام رابط إحالة!', 'Bonus entry for using a referral link!')}
              </motion.div>
            )}
            {!bonusFromRef && <div className="mb-6" />}

            {/* Entry count + referral link */}
            <div className="text-left mb-8">
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/8 rounded-2xl p-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <Trophy size={18} className="text-brand" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">{t('مشاركاتك في السحب', 'Your draw entries')}</p>
                  <p className="text-white text-2xl font-bold">{myEntries} <span className="text-white/30 text-sm font-normal">{t('مشاركات', 'entries')}</span></p>
                </div>
                <div className="ms-auto text-right">
                  <p className="text-white/40 text-xs">{t('إجمالي المشاركين', 'Total entrants')}</p>
                  <p className="text-white font-bold">{totalCount.toLocaleString()}</p>
                </div>
              </div>

              {refCode && <ReferralBox referralCode={refCode} lang={lang} totalEntries={myEntries} />}
            </div>

            {/* Bonus actions */}
            <div className="text-left mb-8">
              <p className="text-white font-semibold text-sm mb-3">{t('احصل على مشاركات إضافية', 'Earn bonus entries')}</p>
              <div className="space-y-2">
                {BONUS_ACTIONS.map(action => (
                  <div key={action.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/8 rounded-2xl p-3.5">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <action.icon size={15} className="text-white/50" />
                    </div>
                    <p className="text-white/70 text-sm flex-1">{lang === 'ar' ? action.labelAr : action.labelEn}</p>
                    <span className="text-brand text-xs font-bold bg-brand/10 px-2.5 py-1 rounded-full flex-shrink-0">+{action.points}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Story card + share */}
            <p className="text-white/40 text-sm mb-4">{t('شارك على قصة الانستقرام لزيادة فرصتك', 'Share to your Instagram Story to boost your chances')}</p>
            <div className="flex justify-center mb-5">
              <StoryCard config={config} lang={lang} prizeLabel={prizeLabel} cardRef={cardRef} />
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3.5 rounded-2xl font-semibold text-sm mb-2">
              <Share2 size={16} />{t('شارك على الانستقرام ستوري', 'Share to Instagram Story')}
            </motion.button>
            <p className="text-white/20 text-xs">{t('أو سيتم تحميل الصورة تلقائياً', 'Or the image will be downloaded to your device')}</p>

          </motion.div>
        </div>
      </div>
    )
  }

  // ── Entry form ──
  return (
    <div className="min-h-screen pt-24 pb-20 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/30 text-brand text-xs px-3 py-1.5 rounded-full font-semibold mb-4">
            <Sparkles size={12} />{t('سحب حصري', 'Exclusive Giveaway')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {config.title?.[lang] || config.title?.en || t('سحب على جوائز', 'Prize Draw')}
          </h1>
          {config.description?.[lang] && (
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto mb-4">{config.description[lang]}</p>
          )}
          {/* Countdown */}
          {config.endDate && countdown && !countdown.expired && (
            <div className="flex justify-center">
              <CountdownDisplay time={countdown} lang={lang} />
            </div>
          )}
        </div>

        {/* Prize + social proof row */}
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
              <Trophy size={20} className="text-brand" />
            </div>
            <div>
              <p className="text-white/40 text-xs mb-0.5">{t('الجائزة', 'Prize')}</p>
              <p className="text-white font-bold text-sm leading-tight">{prizeLabel}</p>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-white/40 text-xs mb-0.5">{t('عدد المشاركين', 'Entrants so far')}</p>
              <p className="text-white font-bold text-sm">{totalCount > 0 ? totalCount.toLocaleString() : '—'}</p>
            </div>
          </div>
        </div>

        {/* Referral bonus banner (when arriving via referral link) */}
        <AnimatePresence>
          {referredBy && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-5 flex items-start gap-3">
              <Star size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-emerald-300 text-sm">
                {t('تمت دعوتك من قِبل أحد المشاركين — ستحصل على مشاركة إضافية في السحب!', 'You were referred by a participant — you\'ll get a bonus entry in the draw!')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entry form */}
        <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/8 rounded-3xl p-6 space-y-4">
          <h2 className="text-white font-semibold">{t('أدخل بياناتك للمشاركة', 'Enter your details to participate')}</h2>

          {/* Honeypot hidden field — bots fill it, humans don't */}
          <input
            type="text" name="_hp" value={form._hp} onChange={handleChange}
            tabIndex={-1} autoComplete="off" aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
          />

          <FloatingInput icon={User} error={errors.name} touched={touched.name}>
            <input type="text" name="name" value={form.name}
              onChange={handleChange} onBlur={() => handleBlur('name')}
              placeholder={t('الاسم الكامل', 'Full name')} autoComplete="name"
              className="w-full bg-transparent px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none" />
          </FloatingInput>

          <FloatingInput icon={Mail} error={errors.email} touched={touched.email}>
            <input type="email" name="email" value={form.email}
              onChange={handleChange} onBlur={() => handleBlur('email')}
              placeholder="email@example.com" autoComplete="email"
              className="w-full bg-transparent px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none" dir="ltr" />
          </FloatingInput>

          <FloatingInput icon={Phone} error={errors.phone} touched={touched.phone}>
            <input type="tel" name="phone" value={form.phone}
              onChange={handleChange} onBlur={() => handleBlur('phone')}
              placeholder={t('+966 5XX XXX XXX', '+966 5XX XXX XXX')} autoComplete="tel"
              className="w-full bg-transparent px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none font-mono" dir="ltr" />
          </FloatingInput>

          {/* Marketing opt-in — unchecked by default (GDPR) */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 flex-shrink-0">
              <input type="checkbox" name="optIn" checked={form.optIn} onChange={handleChange}
                className="sr-only" />
              <div className={`w-4 h-4 rounded border-2 transition-all ${form.optIn ? 'bg-brand border-brand' : 'border-white/20 group-hover:border-white/40'}`}>
                {form.optIn && <CheckCircle size={10} className="text-white absolute top-0.5 left-0.5" />}
              </div>
            </div>
            <span className="text-white/40 text-xs leading-relaxed">
              {t(
                'أوافق على تلقي رسائل تسويقية من FitZone. يمكنك إلغاء الاشتراك في أي وقت.',
                'I agree to receive marketing messages from FitZone. You can unsubscribe at any time.'
              )}
            </span>
          </label>

          <AnimatePresence>
            {submitError && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2.5 text-red-400 text-sm">
                <AlertCircle size={16} />{submitError}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button type="submit" disabled={submitting}
            whileHover={{ scale: submitting ? 1 : 1.01 }} whileTap={{ scale: submitting ? 1 : 0.99 }}
            className="w-full flex items-center justify-center gap-2 bg-brand text-white py-4 rounded-2xl font-bold text-sm disabled:opacity-60 transition-all">
            {submitting
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('جاري التسجيل…', 'Submitting…')}</>
              : <>{t('اشترك الآن', 'Enter Now')}<Arrow size={16} /></>
            }
          </motion.button>

          <p className="text-white/20 text-xs text-center">
            {t('مشارك واحد لكل بريد إلكتروني — لا شراء مطلوب', 'One entry per email — no purchase necessary')}
          </p>
        </form>

        {/* Bonus entries info */}
        <div className="mt-5 bg-white/[0.02] border border-white/6 rounded-2xl p-5">
          <p className="text-white/60 text-sm font-semibold mb-3">{t('احصل على مشاركات إضافية بعد التسجيل', 'Earn bonus entries after signing up')}</p>
          <div className="space-y-2">
            {BONUS_ACTIONS.map(action => (
              <div key={action.id} className="flex items-center gap-3">
                <action.icon size={14} className="text-white/25 flex-shrink-0" />
                <p className="text-white/40 text-xs flex-1">{lang === 'ar' ? action.labelAr : action.labelEn}</p>
                <span className="text-white/50 text-xs font-bold">+{action.points} {t('مشاركات', 'entries')}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
