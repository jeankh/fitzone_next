'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

export default function NotFoundPage() {
  const { lang } = useLanguage()

  return (
    <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-6"
      >
        <span className="text-8xl mb-6 block">🔍</span>
        <h1 className="text-5xl font-extrabold mb-4 text-gradient">404</h1>
        <p className="text-xl text-white font-bold mb-2">
          {lang === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </p>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          {lang === 'ar'
            ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
            : "Sorry, the page you're looking for doesn't exist or has been moved."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand to-brand-dark text-white px-8 py-4 rounded-2xl font-bold hover:-translate-y-1 transition-transform"
        >
          <span>{lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
        </Link>
      </motion.div>
    </div>
  )
}
