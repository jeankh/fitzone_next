'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, ArrowLeft, Mail, Phone, Loader2, MessageCircle, Clock, BookOpen, Gift, Sparkles, Copy, Check } from 'lucide-react'
import { useLanguage } from '../../../src/context/LanguageContext'
import { useCurrency } from '../../../src/context/CurrencyContext'
import { BOOKS, BUNDLE } from '../../../src/lib/books'
import { useMarketing } from '../../../src/context/MarketingContext'
import Image from 'next/image'

function getBookInfo(id, lang) {
  if (id === 'bundle') return { ...BUNDLE, image: '/fitzone-workout.jpeg', image2: '/fitzone-nutrition.jpeg' }
  return BOOKS.find(b => b.id === id) || { id, title: { ar: id, en: id }, image: '' }
}

function ConfettiParticle({ delay, x, color }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: -20, x, rotate: 0 }}
      animate={{ opacity: 0, y: 400, rotate: 720, x: x + (Math.random() - 0.5) * 200 }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeOut' }}
      className="absolute top-0 w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
    />
  )
}

function Confetti() {
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.6,
    x: (Math.random() - 0.5) * 600,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => <ConfettiParticle key={p.id} {...p} />)}
    </div>
  )
}

export default function SuccessPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={36} className="text-brand animate-spin" /></div>}>
      <SuccessPage />
    </Suspense>
  )
}

function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { lang } = useLanguage()
  const { formatAmount } = useCurrency()
  const marketing = useMarketing()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      setError(lang === 'ar' ? 'لا يوجد معرف جلسة' : 'No session ID found')
      setLoading(false)
      return
    }

    fetch(`/api/checkout/success?session_id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setOrder(data)
          setShowConfetti(true)
        }
      })
      .catch(() => setError(lang === 'ar' ? 'حدث خطأ' : 'Something went wrong'))
      .finally(() => setLoading(false))
  }, [searchParams, lang])

  const items = order?.metadata?.items ? JSON.parse(order.metadata.items) : []
  const isBundle = items.includes('bundle')
  const whatsappLink = `https://wa.me/${marketing.whatsapp}?text=${encodeURIComponent(
    lang === 'ar' ? 'مرحباً، قمت بشراء البرامج من موقعكم وأريد استلامها.' : 'Hi, I just purchased your programs and would like to receive them.'
  )}`

  const copyOrderId = useCallback(() => {
    if (!order?.id) return
    navigator.clipboard.writeText(order.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [order?.id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 size={36} className="text-brand animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-400 mb-4">{error}</h1>
        <button onClick={() => router.push('/')} className="text-brand hover:underline">
          {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {mounted && showConfetti && <Confetti />}

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">

        {/* Success icon + title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="relative w-24 h-24 mx-auto mb-6"
          >
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center">
              <CheckCircle size={44} className="text-emerald-400" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl font-extrabold text-white mb-3"
          >
            {lang === 'ar' ? 'تم الشراء بنجاح!' : 'Payment Successful!'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-white/50 leading-relaxed"
          >
            {lang === 'ar'
              ? 'شكراً لثقتك بنا! إليك تفاصيل طلبك.'
              : 'Thank you for your purchase! Here are your order details.'}
          </motion.p>
        </div>

        {/* Order card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-surface border border-border rounded-3xl overflow-hidden mb-5"
        >
          {/* Order ID header */}
          <div className="px-5 py-3.5 bg-white/[0.03] border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-brand" />
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                {lang === 'ar' ? 'الطلب' : 'Order'}
              </span>
            </div>
            {order?.id && (
              <button onClick={copyOrderId} className="flex items-center gap-1.5 text-white/40 text-xs hover:text-white/70 transition-colors">
                <span className="font-mono">{order.id.slice(-8).toUpperCase()}</span>
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              </button>
            )}
          </div>

          {/* Items */}
          <div className="p-5 space-y-3">
            {items.map(id => {
              const book = getBookInfo(id, lang)
              if (id === 'bundle') {
                return (
                  <div key={id} className="flex items-center gap-3 bg-brand/5 border border-brand/20 rounded-2xl p-3">
                    <div className="relative w-14 h-18 flex-shrink-0">
                      <Image src="/fitzone-workout.jpeg" alt="" width={44} height={64} className="absolute top-0 left-0 w-11 h-16 object-cover rounded-lg border border-white/10" style={{ transform: 'rotate(-5deg)' }} />
                      <Image src="/fitzone-nutrition.jpeg" alt="" width={44} height={64} className="absolute top-0 right-0 w-11 h-16 object-cover rounded-lg border border-white/10" style={{ transform: 'rotate(5deg)', zIndex: 1 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm">{lang === 'ar' ? 'الباقة الكاملة' : 'Complete Bundle'}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-accent-green font-semibold mt-0.5">
                        <Gift size={9} />
                        {lang === 'ar' ? 'متابعة واتساب شهر كامل' : '1 month WhatsApp support'}
                      </span>
                    </div>
                  </div>
                )
              }
              return (
                <div key={id} className="flex items-center gap-3">
                  <div className="relative w-10 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                    <Image src={book.image || ''} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{book.title?.[lang] || id}</p>
                    <p className="text-white/40 text-xs mt-0.5">{book.subtitle?.[lang] || ''}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total + contact */}
          <div className="px-5 py-4 border-t border-border bg-white/[0.02] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm font-semibold">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
              <span className="text-white text-xl font-extrabold">
                {(order.amount_total / 100).toFixed(0)} {order.currency?.toUpperCase()}
              </span>
            </div>
            {order.customer_email && (
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <Mail size={12} className="flex-shrink-0" />{order.customer_email}
              </div>
            )}
            {order.metadata?.phone && (
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <Phone size={12} className="flex-shrink-0" />{order.metadata.phone}
              </div>
            )}
          </div>
        </motion.div>

        {/* Account created card */}
        {order?.accountCreated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="bg-brand/5 border border-brand/20 rounded-3xl p-5 mb-5"
          >
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Gift size={14} className="text-brand" />
              {lang === 'ar' ? 'تم إنشاء حسابك!' : 'Your Account Has Been Created!'}
            </h3>
            <p className="text-white/50 text-xs mb-3">
              {lang === 'ar'
                ? 'أرسلنا رابط الدخول إلى بريدك الإلكتروني. اضغط عليه للدخول إلى حسابك.'
                : 'We sent a login link to your email. Click it to access your account.'}
            </p>
            <button onClick={() => router.push('/account/login')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors">
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In to Your Account'}
            </button>
          </motion.div>
        )}

        {/* What's next timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          className="bg-surface border border-border rounded-3xl p-5 mb-5"
        >
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <Sparkles size={14} className="text-brand" />
            {lang === 'ar' ? 'ماذا بعد؟' : "What's next?"}
          </h3>
          <div className="space-y-4">
            {[
              { icon: Mail, color: 'text-blue-400', bg: 'bg-blue-400/15', text: lang === 'ar' ? 'ستصلك رسالة تأكيد على بريدك الإلكتروني' : 'You\'ll receive a confirmation email shortly', delay: 0 },
              { icon: MessageCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/15', text: lang === 'ar' ? 'سنتواصل معك عبر الواتساب لتسليم البرامج' : 'We\'ll message you on WhatsApp to deliver your programs', delay: 1 },
              { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/15', text: lang === 'ar' ? 'استلم برامجك خلال دقائق وابدأ رحلتك!' : 'Get your programs within minutes and start your journey!', delay: 2 },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl ${step.bg} flex items-center justify-center flex-shrink-0`}>
                  <step.icon size={14} className={step.color} />
                </div>
                <p className="text-white/60 text-sm leading-relaxed pt-1">{step.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        >
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white text-base mb-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', boxShadow: '0 8px 24px rgba(37,211,102,0.3)' }}>
            <MessageCircle size={18} />
            {lang === 'ar' ? 'تواصل معنا عبر الواتساب' : 'Contact us on WhatsApp'}
          </a>

          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-white/60 hover:text-white hover:border-brand/40 transition-all font-semibold text-sm"
          >
            {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'} <Arrow size={14} />
          </button>
        </motion.div>

      </motion.div>
    </div>
  )
}
