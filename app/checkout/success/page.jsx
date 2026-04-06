'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, ArrowLeft, Mail, Phone, Loader2 } from 'lucide-react'
import { useLanguage } from '../../../src/context/LanguageContext'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { lang } = useLanguage()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

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
        }
      })
      .catch(() => setError(lang === 'ar' ? 'حدث خطأ' : 'Something went wrong'))
      .finally(() => setLoading(false))
  }, [searchParams, lang])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={36} className="text-brand animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-400 mb-4">{error}</h1>
        <button onClick={() => router.push('/')} className="text-brand hover:underline">
          {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={44} className="text-emerald-400" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 className="text-3xl font-bold text-white mb-3">
            {lang === 'ar' ? 'تم الشراء بنجاح!' : 'Purchase Successful!'}
          </h1>
          <p className="text-white/50 mb-6 leading-relaxed text-sm">
            {lang === 'ar'
              ? 'سيتم إرسال برامجك إلى بريدك الإلكتروني ورقم الواتساب خلال دقائق.'
              : 'Your programs will be sent to your email and WhatsApp within minutes.'}
          </p>

          {order && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-6 text-left">
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                {lang === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
              </h3>
              {order.metadata?.items && JSON.parse(order.metadata.items).map(id => (
                <div key={id} className="flex items-center justify-between py-1.5">
                  <span className="text-white/70 text-sm">{id}</span>
                </div>
              ))}
              <div className="border-t border-white/10 mt-3 pt-3 flex justify-between">
                <span className="text-white/60 text-sm">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span className="text-brand font-bold">
                  {(order.amount_total / 100).toFixed(0)} {order.currency?.toUpperCase()}
                </span>
              </div>
              {order.customer_email && (
                <div className="flex items-center gap-2 mt-3 text-white/40 text-xs">
                  <Mail size={12} />{order.customer_email}
                </div>
              )}
              {order.metadata?.phone && (
                <div className="flex items-center gap-2 mt-1 text-white/40 text-xs">
                  <Phone size={12} />{order.metadata.phone}
                </div>
              )}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 bg-brand text-white px-8 py-3.5 rounded-2xl font-semibold"
          >
            {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'} <Arrow size={16} />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
