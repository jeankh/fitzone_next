'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader2, ArrowRight, ArrowLeft, User, Phone, Shield, ShieldCheck, ShieldAlert } from 'lucide-react'
import { useLanguage } from '../../../src/context/LanguageContext'
import { useUser } from '../../../src/context/UserContext'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const { refetch } = useUser()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  const getPasswordStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' }
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      await refetch()
      router.push('/account')
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-28 pb-12 bg-background" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <h1 className="text-2xl font-extrabold text-white text-center mb-2">
          {lang === 'ar' ? 'إنشاء حساب' : 'Create Account'}
        </h1>
        <p className="text-white/40 text-sm text-center mb-8">
          {lang === 'ar' ? 'أنشئ حسابك للوصول لبرامجك' : 'Create an account to access your programs'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 focus-within:border-brand/40 transition-colors">
            <User size={16} className="text-white/30 shrink-0" />
            <input
              type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder={lang === 'ar' ? 'الاسم' : 'Full Name'}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 focus-within:border-brand/40 transition-colors">
            <Mail size={16} className="text-white/30 shrink-0" />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 focus-within:border-brand/40 transition-colors">
            <Lock size={16} className="text-white/30 shrink-0" />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              placeholder={lang === 'ar' ? 'كلمة المرور (8 أحرف، حرف + رقم)' : 'Password (8+ chars, letter + number)'}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none"
            />
          </div>
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength.score ? pwStrength.color : 'bg-white/10'}`} />
                ))}
              </div>
              <p className={`text-xs ${pwStrength.color.replace('bg-', 'text-')}`}>{pwStrength.label}</p>
            </div>
          )}
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 focus-within:border-brand/40 transition-colors">
            <Phone size={16} className="text-white/30 shrink-0" />
            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder={lang === 'ar' ? 'رقم الهاتف (اختياري)' : 'Phone (optional)'}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none"
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand text-white py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (
              <>{lang === 'ar' ? 'إنشاء حساب' : 'Create Account'} <Arrow size={14} /></>
            )}
          </button>
        </form>

        <p className="text-white/40 text-sm text-center mt-6">
          {lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
          <Link href="/account/login" className="text-brand hover:underline">
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
