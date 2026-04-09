'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useLanguage } from '../../../src/context/LanguageContext'
import Link from 'next/link'
import { Suspense } from 'react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useLanguage()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-28 pb-12 bg-background" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">
            {lang === 'ar' ? 'الرابط غير صالح' : 'Invalid Link'}
          </h1>
          <p className="text-white/40 text-sm mb-6">
            {lang === 'ar' ? 'رابط إعادة التعيين مفقود أو منتهي الصلاحية' : 'The reset link is missing or expired'}
          </p>
          <Link href="/account/login" className="text-brand hover:underline text-sm">
            {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
          </Link>
        </motion.div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
      return
    }
    if (password.length < 8 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
      setError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل مع حرف ورقم' : 'Password must be 8+ chars with at least one letter and one number')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || (lang === 'ar' ? 'حدث خطأ' : 'Something went wrong'))
        return
      }
      setSuccess(true)
    } catch { setError(lang === 'ar' ? 'حدث خطأ' : 'Something went wrong') }
    finally { setLoading(false) }
  }

  const getPasswordStrength = (pw) => {
    if (!pw) return { score: 0, color: '' }
    let score = 0
    if (pw.length >= 8) score++
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^a-zA-Z0-9]/.test(pw)) score++
    if (score <= 1) return { score, label: lang === 'ar' ? 'ضعيفة' : 'Weak', color: 'bg-red-500' }
    if (score <= 2) return { score, label: lang === 'ar' ? 'متوسطة' : 'Fair', color: 'bg-yellow-500' }
    return { score, label: lang === 'ar' ? 'قوية' : 'Strong', color: 'bg-emerald-500' }
  }
  const pwStrength = getPasswordStrength(password)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-28 pb-12 bg-background" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        {success ? (
          <div className="text-center space-y-4">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">
              {lang === 'ar' ? 'تم تغيير كلمة المرور!' : 'Password Changed!'}
            </h1>
            <p className="text-white/50 text-sm mb-6">
              {lang === 'ar' ? 'يمكنك الآن تسجيل الدخول بكلمة مرورك الجديدة' : 'You can now sign in with your new password'}
            </p>
            <Link
              href="/account/login"
              className="inline-flex items-center justify-center gap-2 bg-brand text-white py-3 px-6 rounded-xl font-semibold hover:bg-brand-dark transition-colors"
            >
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-white text-center mb-2">
              {lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
            </h1>
            <p className="text-white/40 text-sm text-center mb-8">
              {lang === 'ar' ? 'أدخل كلمة مرورك الجديدة' : 'Enter your new password'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 focus-within:border-brand/40 transition-colors">
                  <Lock size={16} className="text-white/30 shrink-0" />
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder={lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                    className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none"
                  />
                </div>
                {password && (
                  <div className="space-y-1 mt-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength.score ? pwStrength.color : 'bg-white/10'}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${pwStrength.color.replace('bg-', 'text-')}`}>{pwStrength.label}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 focus-within:border-brand/40 transition-colors">
                <Lock size={16} className="text-white/30 shrink-0" />
                <input
                  type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                  placeholder={lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none"
                />
              </div>

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand text-white py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : (lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password')}
              </button>
            </form>

            <p className="text-white/40 text-sm text-center mt-6">
              <Link href="/account/login" className="text-brand hover:underline">
                {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
