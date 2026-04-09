'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../../../src/context/LanguageContext'
import { useUser } from '../../../src/context/UserContext'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const { refetch } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [magicSending, setMagicSending] = useState(false)
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      await refetch()
      router.push('/account')
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  const [resetSending, setResetSending] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleForgotPassword = async () => {
    if (!email.trim()) { setError(lang === 'ar' ? 'أدخل بريدك الإلكتروني أولاً' : 'Enter your email first'); return }
    setResetSending(true)
    setError('')
    try {
      const res = await fetch('/api/user/send-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setResetSent(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to send')
      }
    } catch { setError('Something went wrong') }
    finally { setResetSending(false) }
  }

  const handleMagicLink = async () => {
    if (!email.trim()) { setError(lang === 'ar' ? 'أدخل بريدك الإلكتروني أولاً' : 'Enter your email first'); return }
    setMagicSending(true)
    setError('')
    try {
      const res = await fetch('/api/user/send-magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setMagicSent(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to send')
      }
    } catch { setError('Something went wrong') }
    finally { setMagicSending(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-28 pb-12 bg-background" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <h1 className="text-2xl font-extrabold text-white text-center mb-2">
          {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
        </h1>
        <p className="text-white/40 text-sm text-center mb-8">
          {lang === 'ar' ? 'أدخل بياناتك للوصول إلى حسابك' : 'Enter your credentials to access your account'}
        </p>

        {resetSent || magicSent ? (
          <div className="text-center space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
              <Mail size={28} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-2">{lang === 'ar' ? 'تم الإرسال!' : 'Email Sent!'}</p>
              <p className="text-white/50 text-sm">
                {resetSent
                  ? (lang === 'ar' ? 'تحقق من بريدك الإلكتروني للحصول على رابط إعادة التعيين' : 'Check your email for a password reset link')
                  : (lang === 'ar' ? 'تحقق من بريدك الإلكتروني للحصول على رابط الدخول' : 'Check your email for a login link')}
              </p>
            </div>
            <button onClick={() => { setResetSent(false); setMagicSent(false) }} className="text-white/40 text-sm hover:text-white transition-colors">
              {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 focus-within:border-brand/40 transition-colors">
                <Mail size={16} className="text-white/30 shrink-0" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 focus-within:border-brand/40 transition-colors">
                  <Lock size={16} className="text-white/30 shrink-0" />
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'}
                    className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end mt-1.5">
                  <button type="button" onClick={handleForgotPassword} disabled={resetSending} className="text-white/30 text-xs hover:text-brand transition-colors disabled:opacity-50">
                    {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand text-white py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : (
                  <>{lang === 'ar' ? 'دخول' : 'Sign In'} <Arrow size={14} /></>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center"><span className="bg-background px-3 text-white/20 text-xs">{lang === 'ar' ? 'أو' : 'or'}</span></div>
            </div>

            <button
              onClick={handleMagicLink} disabled={magicSending}
              className="w-full flex items-center justify-center gap-2 border border-white/15 text-white/60 py-3 rounded-xl font-semibold hover:text-white hover:border-brand/40 transition-all disabled:opacity-50 text-sm"
            >
              {magicSending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={14} />}
              {lang === 'ar' ? 'أرسل رابط الدخول لبريدي' : 'Email me a login link'}
            </button>

            <p className="text-white/40 text-sm text-center mt-6">
              {lang === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
              <Link href="/account/signup" className="text-brand hover:underline">
                {lang === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
