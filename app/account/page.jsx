'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Phone, LogOut, Loader2, Package, Download, Clock, RefreshCw, User, Lock, CheckCircle } from 'lucide-react'
import { useLanguage } from '../../src/context/LanguageContext'
import { useUser } from '../../src/context/UserContext'
import Image from 'next/image'

function getBookInfo(id, lang) {
  const books = {
    transformation: {
      title: { ar: 'الدليل الشامل للتنشيف وبناء الجسم', en: 'Complete Shredding & Building Guide' },
      image: '/fitzone-workout.jpeg',
    },
    nutrition: {
      title: { ar: 'الدليل الكامل لخسارة الدهون', en: 'Complete Fat Loss Guide' },
      image: '/fitzone-nutrition.jpeg',
    },
    bundle: {
      title: { ar: 'الباقة الكاملة', en: 'Complete Bundle' },
      image: '/fitzone-workout.jpeg',
    },
  }
  return books[id] || { title: { ar: id, en: id }, image: '' }
}

export default function AccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === 'true'
  const { lang } = useLanguage()
  const { user, loading: userLoading, refetch } = useUser()
  const [purchases, setPurchases] = useState([])
  const [purchasesLoading, setPurchasesLoading] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')
  const fetchedRef = useRef(false)

  const needsPassword = isWelcome || user?.hasPassword === false

  useEffect(() => {
    if (userLoading || fetchedRef.current) return
    if (!user) { router.push('/account/login'); return }
    fetchedRef.current = true
    fetch('/api/user/purchases').then(r => r.json()).then(data => {
      setPurchases(data.purchases || [])
    }).catch((e) => console.error('Failed to load purchases:', e)).finally(() => setPurchasesLoading(false))
  }, [user, userLoading, router])

  const handleDownload = (productId) => {
    const a = document.createElement('a')
    a.href = `/api/user/download?product=${productId}`
    a.click()
  }

  const handleLogout = async () => {
    await fetch('/api/user/logout', { method: 'POST' }).catch(() => {})
    refetch()
    router.push('/')
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8 || !/[0-9]/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
      setPwError(lang === 'ar' ? '8 أحرف على الأقل مع حرف ورقم' : '8+ chars with at least one letter and one number')
      return
    }
    setSavingPw(true)
    setPwError('')
    try {
      const res = await fetch('/api/user/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      if (res.ok) {
        setPwSaved(true)
        refetch()
      }
    } catch {}
    setSavingPw(false)
  }

  if (userLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 size={36} className="text-brand animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background px-4 pt-28 pb-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Set password card */}
        {needsPassword && !pwSaved && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-brand/5 border border-brand/20 rounded-3xl p-6">
            <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
              <Lock size={18} className="text-brand" />
              {lang === 'ar' ? 'عيّن كلمة مرورك' : 'Set Your Password'}
            </h2>
            <p className="text-white/50 text-sm mb-4">
              {lang === 'ar'
                ? 'عيّن كلمة مرور لتتمكن من تسجيل الدخول مباشرة في المرة القادمة.'
                : 'Set a password so you can sign in directly next time.'}
            </p>
            <form onSubmit={handleSetPassword} className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-brand/40 transition-colors">
                <Lock size={14} className="text-white/30 shrink-0" />
                <input
                  type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setPwError('') }}
                  placeholder={lang === 'ar' ? 'كلمة المرور (8 أحرف، حرف + رقم)' : 'Password (8+ chars, letter + number)'}
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none"
                  minLength={8}
                />
              </div>
              <button type="submit" disabled={savingPw}
                className="bg-brand text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-50">
                {savingPw ? <Loader2 size={16} className="animate-spin" /> : (lang === 'ar' ? 'حفظ' : 'Save')}
              </button>
            </form>
            {pwError && <p className="text-red-400 text-xs mt-2">{pwError}</p>}
          </motion.div>
        )}

        {pwSaved && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle size={18} className="text-emerald-400 shrink-0" />
            <p className="text-emerald-300 text-sm">{lang === 'ar' ? 'تم حفظ كلمة المرور بنجاح!' : 'Password saved successfully!'}</p>
          </motion.div>
        )}

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border rounded-3xl p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <User size={24} className="text-brand" />
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1 text-white/40 text-sm">
                  <Mail size={12} />{user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 mt-0.5 text-white/40 text-sm">
                    <Phone size={12} />{user.phone}
                  </div>
                )}
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 border border-border hover:border-red-400/30 px-3 py-1.5 rounded-lg transition-all">
              <LogOut size={12} />{lang === 'ar' ? 'خروج' : 'Logout'}
            </button>
          </div>
        </motion.div>

        {/* Purchases */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface border border-border rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-brand" />
              <h2 className="text-white font-bold">
                {lang === 'ar' ? 'مشترياتي' : 'My Purchases'}
              </h2>
              <span className="text-white/30 text-sm">({purchases.length})</span>
            </div>
          </div>

          {purchasesLoading ? (
            <div className="p-12 flex justify-center">
              <RefreshCw size={20} className="text-white/20 animate-spin" />
            </div>
          ) : purchases.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={36} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">
                {lang === 'ar' ? 'لا توجد مشتريات بعد' : 'No purchases yet'}
              </p>
              <button onClick={() => router.push('/programs')}
                className="mt-4 text-brand text-sm hover:underline">
                {lang === 'ar' ? 'تصفح البرامج' : 'Browse Programs'}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {purchases.map((p, i) => {
                const rawItems = Array.isArray(p.items) ? p.items : []
                // Expand bundle into both individual books for download
                const items = rawItems.includes('bundle')
                  ? ['transformation', 'nutrition']
                  : rawItems
                return (
                  <div key={p.id || i} className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/40 text-xs">
                        <Clock size={11} />
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{p.status || 'paid'}</span>
                    </div>

                    <div className="space-y-2">
                      {items.map(id => {
                        const book = getBookInfo(id, lang)
                        return (
                          <div key={id} className="flex items-center gap-3 bg-white/[0.02] rounded-xl p-3">
                            <div className="relative w-10 h-14 rounded-lg overflow-hidden border border-white/10 shrink-0">
                              <Image src={book.image} alt="" fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-semibold truncate">{book.title[lang]}</p>
                            </div>
                            <button
                              onClick={() => handleDownload(id)}
                              className="flex items-center gap-1.5 text-xs bg-brand text-white px-3 py-1.5 rounded-lg hover:bg-brand-dark transition-colors shrink-0"
                            >
                              <Download size={12} />
                              {lang === 'ar' ? 'تحميل' : 'Download'}
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-white/40 text-xs">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                      <span className="text-white font-bold text-sm">{(p.amount / 100).toFixed(0)} {(p.currency || 'sar').toUpperCase()}</span>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  )
}
