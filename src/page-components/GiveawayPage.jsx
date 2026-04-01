'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, Gift, Trophy, Download, Share2, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const PRIZE_LABELS = {
  transformation: { ar: 'دليل التنشيف وبناء الجسم', en: 'Shredding & Building Guide' },
  nutrition:      { ar: 'دليل خسارة الدهون',          en: 'Fat Loss Guide' },
  bundle:         { ar: 'الباقة الكاملة (كتابان)',     en: 'Complete Bundle (2 Books)' },
}

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

export default function GiveawayPage({ config }) {
  const { lang } = useLanguage()
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight
  const isRtl = lang === 'ar'

  const [step,       setStep]       = useState('form') // 'form' | 'success'
  const [form,       setForm]       = useState({ name: '', email: '', phone: '' })
  const [errors,     setErrors]     = useState({})
  const [touched,    setTouched]    = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const cardRef = useRef()

  const t = (ar, en) => lang === 'ar' ? ar : en

  const prizeLabel = config ? (PRIZE_LABELS[config.prize] || { ar: config.prize, en: config.prize })[lang] : ''

  const validate = (name, value) => {
    if (!value.trim()) return t('مطلوب', 'Required')
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('بريد غير صالح', 'Invalid email')
    if (name === 'phone' && value.replace(/\D/g, '').length < 5) return t('رقم غير صالح', 'Invalid phone')
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
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
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.ok) {
        setStep('success')
      } else {
        const errMap = {
          all_fields_required: t('جميع الحقول مطلوبة', 'All fields required'),
          invalid_email:       t('بريد إلكتروني غير صالح', 'Invalid email'),
          no_active_giveaway:  t('لا توجد مسابقة نشطة حالياً', 'No active giveaway'),
          giveaway_ended:      t('انتهت مدة المسابقة', 'Giveaway has ended'),
          entries_full:        t('اكتمل عدد المشاركين', 'Max entries reached'),
          already_entered:     t('لقد سجلت مشاركتك مسبقاً', 'You have already entered'),
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
          // Fallback: download
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url; a.download = 'fitzone-giveaway.png'; a.click()
          URL.revokeObjectURL(url)
        }
      }, 'image/png')
    } catch {
      // ignore
    }
  }

  // ── Inactive / no giveaway ──
  if (!config || !config.active) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Gift size={30} className="text-white/30" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">{t('لا توجد مسابقة نشطة', 'No Active Giveaway')}</h1>
          <p className="text-white/40 text-sm">{t('لا توجد مسابقة نشطة حالياً. تابعنا على السوشيال ميديا لمعرفة المزيد.', 'No active giveaway right now. Follow us on social media for updates.')}</p>
        </div>
      </div>
    )
  }

  // ── Success screen ──
  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={44} className="text-emerald-400" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('تم التسجيل!', 'You\'re In!')}</h1>
          <p className="text-white/50 text-sm mb-10">{t('تمت مشاركتك في السحب على', 'You\'ve entered the draw for')}{' '}<span className="text-brand font-semibold">{prizeLabel}</span></p>

          {/* Story Card */}
          <div className="flex justify-center mb-6">
            <div
              ref={cardRef}
              style={{
                width: 320, height: 568,
                background: 'linear-gradient(135deg, #09090b 0%, #1a0814 50%, #09090b 100%)',
                borderRadius: 32,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: 32, position: 'relative', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Glow */}
              <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, background: 'rgba(220,38,38,0.15)', borderRadius: '50%', filter: 'blur(60px)' }} />

              {/* Logo */}
              <img src="/fitzone-logo.jpeg" alt="FitZone" style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', marginBottom: 20 }} />

              {/* Badge */}
              <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 999, padding: '6px 16px', marginBottom: 16 }}>
                <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 700 }}>
                  {lang === 'ar' ? '🎉 دخلت في السحب!' : '🎉 I just entered to win!'}
                </span>
              </div>

              {/* Prize */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 8 }}>
                {lang === 'ar' ? 'الجائزة' : 'Prize'}
              </p>
              <p style={{ color: '#ffffff', fontSize: 18, fontWeight: 800, textAlign: 'center', lineHeight: 1.3, marginBottom: 24 }}>
                {prizeLabel}
              </p>

              {/* CTA */}
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>fitzone.com/giveaway</p>

              {/* Trophy icon area */}
              <div style={{ position: 'absolute', bottom: 28, right: 28, opacity: 0.1 }}>
                <Trophy size={48} color="#ffffff" />
              </div>
            </div>
          </div>

          {/* Share button */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3.5 rounded-2xl font-semibold text-sm mb-3">
            <Share2 size={16} />{t('شارك على الانستقرام ستوري', 'Share to Instagram Story')}
          </motion.button>
          <p className="text-white/20 text-xs">{t('أو سيتم تحميل الصورة تلقائياً على جهازك', 'Or the image will be saved to your device')}</p>
        </motion.div>
      </div>
    )
  }

  // ── Entry form ──
  return (
    <div className="min-h-screen pt-24 pb-20 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/30 text-brand text-xs px-3 py-1.5 rounded-full font-semibold mb-4">
            <Sparkles size={12} />
            {t('مسابقة حصرية', 'Exclusive Giveaway')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {config.title?.[lang] || config.title?.en || t('سحب على جوائز', 'Prize Draw')}
          </h1>
          {config.description?.[lang] && (
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">{config.description[lang]}</p>
          )}
        </div>

        {/* Prize card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
            <Trophy size={24} className="text-brand" />
          </div>
          <div>
            <p className="text-white/40 text-xs mb-0.5">{t('الجائزة', 'Prize')}</p>
            <p className="text-white font-bold">{prizeLabel}</p>
            {config.endDate && (
              <p className="text-white/30 text-xs mt-0.5">{t('تنتهي:', 'Ends:')} {new Date(config.endDate).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}</p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/8 rounded-3xl p-6 space-y-4">
          <h2 className="text-white font-semibold mb-1">{t('أدخل بياناتك للمشاركة', 'Enter your details to participate')}</h2>

          <FloatingInput icon={User} error={errors.name} touched={touched.name}>
            <input type="text" name="name" value={form.name}
              onChange={handleChange} onBlur={() => handleBlur('name')}
              placeholder={t('الاسم الكامل', 'Full name')}
              className="w-full bg-transparent px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none" />
          </FloatingInput>

          <FloatingInput icon={Mail} error={errors.email} touched={touched.email}>
            <input type="email" name="email" value={form.email}
              onChange={handleChange} onBlur={() => handleBlur('email')}
              placeholder="email@example.com"
              className="w-full bg-transparent px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none" dir="ltr" />
          </FloatingInput>

          <FloatingInput icon={Phone} error={errors.phone} touched={touched.phone}>
            <input type="tel" name="phone" value={form.phone}
              onChange={handleChange} onBlur={() => handleBlur('phone')}
              placeholder={t('+966 5XX XXX XXX', '+966 5XX XXX XXX')}
              className="w-full bg-transparent px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none font-mono" dir="ltr" />
          </FloatingInput>

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
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('جاري التسجيل…', 'Submitting…')}</>
            ) : (
              <>{t('اشترك الآن', 'Enter Now')}<Arrow size={16} /></>
            )}
          </motion.button>

          <p className="text-white/20 text-xs text-center">{t('مشارك واحد لكل بريد إلكتروني', 'One entry per email address')}</p>
        </form>
      </div>
    </div>
  )
}
