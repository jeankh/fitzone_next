'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader2, ArrowRight, ArrowLeft, UserPlus } from 'lucide-react'
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <h1 className="text-2xl font-extrabold text-white text-center mb-2">
          {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
        </h1>
        <p className="text-white/40 text-sm text-center mb-8">
          {lang === 'ar' ? 'أدخل بياناتك للوصول إلى حسابك' : 'Enter your credentials to access your account'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none"
            />
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

        <p className="text-white/40 text-sm text-center mt-6">
          {lang === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
          <Link href="/account/signup" className="text-brand hover:underline">
            {lang === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
