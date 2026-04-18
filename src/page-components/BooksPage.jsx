'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowLeft, ArrowRight, Package, BookOpen, ShoppingCart, Star, MessageCircle, Gift, Zap, Lock, Plus } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useCurrency } from '../context/CurrencyContext'
import Image from 'next/image'
import { BOOKS as books, BUNDLE as bundle } from '../lib/books'

function WhatsAppBonus({ lang, bookImages }) {
  const features = lang === 'ar'
    ? ['رد على أسئلتك خلال 24 ساعة', 'متابعة أسبوعية لتقدمك', 'تعديل الخطة حسب احتياجك', 'دعم كامل لمدة شهر']
    : ['Reply within 24 hours', 'Weekly progress check-in', 'Plan adjustments as needed', 'Full month of support']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Book covers — fanned above the card */}
      <div className="flex justify-center items-end gap-3 mb-[-12px] relative z-10">
        {bookImages.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24, rotate: i === 0 ? -14 : 14 }}
            animate={{ opacity: 1, y: 0, rotate: i === 0 ? -7 : 7 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 18 }}
            className="relative flex-shrink-0 rounded-xl overflow-hidden"
            style={{ width: 80, height: 108, boxShadow: '0 10px 28px rgba(0,0,0,0.65), 0 0 0 2px rgba(255,255,255,0.1)' }}
          >
            <Image src={src} alt="" fill className="object-cover" />
          </motion.div>
        ))}
      </div>

      {/* WhatsApp card */}
      <div style={{ background: 'linear-gradient(145deg, #0f4a36 0%, #082e21 100%)', border: '1.5px solid rgba(37,211,102,0.35)', borderRadius: 20, padding: '20px 18px 16px', boxShadow: '0 0 40px rgba(37,211,102,0.12), 0 20px 40px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
        {/* ambient glow */}
        <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 160, height: 100, background: 'rgba(37,211,102,0.1)', borderRadius: '50%', filter: 'blur(24px)', pointerEvents: 'none' }} />

        {/* icon + title */}
        <div className="flex items-center gap-3 mb-4 relative">
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #25d366, #128c7e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(37,211,102,0.45)' }}>
            <MessageCircle size={24} color="white" />
          </div>
          <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 800, lineHeight: 1.4 }}>
            {lang === 'ar' ? 'متابعة شخصية عبر الواتساب' : 'Personal WhatsApp Support'}
          </p>
        </div>

        {/* divider */}
        <div style={{ height: 1, background: 'rgba(37,211,102,0.18)', marginBottom: 14 }} />

        {/* bullets */}
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {features.map((f, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: lang === 'ar' ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07, ease: 'easeOut' }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
            >
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(37,211,102,0.18)', border: '1px solid rgba(37,211,102,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Check size={10} color="#25d366" />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.84)', fontSize: 12, lineHeight: 1.5 }}>{f}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export default function BooksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToCart, isInCart, removeFromCart, prices } = useCart()
  const { lang, t } = useLanguage()
  const { formatPrice, formatPriceFor } = useCurrency()
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [highlightedBook, setHighlightedBook] = useState(null)
  const bookRefs = useRef({})
  const bundleRef = useRef(null)

  useEffect(() => {
    const highlight = searchParams.get('highlight')
    if (!highlight) return
    const timeout = setTimeout(() => {
      if (highlight === 'bundle' && bundleRef.current) {
        bundleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlightedBook('bundle')
      } else if (bookRefs.current[highlight]) {
        bookRefs.current[highlight].scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlightedBook(highlight)
      }
      setTimeout(() => setHighlightedBook(null), 2000)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchParams])

  const notifyRef = useRef(null)
  const notify = (msg) => {
    clearTimeout(notifyRef.current)
    setNotificationMessage(msg)
    setShowNotification(true)
    notifyRef.current = setTimeout(() => setShowNotification(false), 3000)
  }

  const handleAddToCart = (book) => {
    if (isInCart(book.id)) {
      removeFromCart(book.id)
      notify(`${t('booksPage.removed')} "${book.title[lang]}" ${t('booksPage.fromCart')}`)
    } else {
      addToCart(book.id)
      notify(`${t('booksPage.added')} "${book.title[lang]}" ${t('booksPage.toCart')}`)
    }
  }

  const buyNow = (book) => {
    if (!isInCart(book.id)) addToCart(book.id)
    router.push('/checkout')
  }

  const buyBundle = () => {
    ;[...books, bundle].forEach(b => { if (!isInCart(b.id)) addToCart(b.id) })
    router.push('/checkout')
  }

  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  return (
    <div className="pt-28 pb-20">
      {/* Notification */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: showNotification ? 1 : 0, y: showNotification ? 0 : -50 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 bg-accent-green text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3"
      >
        <Check size={20} />
        <span>{notificationMessage}</span>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-6 py-2.5 rounded-full mb-6">
            <BookOpen size={18} className="text-brand" />
            <span className="text-brand text-sm font-semibold">{t('booksPage.badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
            {t('booksPage.title')}
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {t('booksPage.subtitle')}
          </p>
        </motion.div>

        {/* Individual Books — full width, image left + content right */}
        <div className="flex flex-col gap-8 mb-8">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              ref={el => bookRefs.current[book.id] = el}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative bg-surface rounded-3xl overflow-hidden border-2 transition-all hover:shadow-2xl flex flex-col md:flex-row ${
                highlightedBook === book.id ? 'border-brand' : 'border-border hover:border-brand/40'
              }`}
            >
              {/* ── MOBILE LAYOUT ── */}
              <div className="md:hidden flex flex-col">

                {/* 1. Title bar — full width */}
                <div className="px-4 pt-4 pb-3 border-b border-border">
                  <p className="text-brand text-[10px] font-bold uppercase tracking-widest mb-1">{book.subtitle[lang]}</p>
                  <h2 className="text-white text-lg font-extrabold leading-tight">{book.title[lang]}</h2>
                </div>

                {/* 2. Image left + bullets right */}
                <div className="flex gap-3 p-4">
                  {/* Book image */}
                  <div className="relative w-32 flex-shrink-0 rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
                    <Image src={book.image} alt={book.title[lang]} fill className="object-cover" />
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
                      <Star size={9} className="text-yellow-400" fill="currentColor" />
                      <span className="text-white text-[10px] font-bold">{book.rating}</span>
                    </div>
                  </div>

                  {/* Bullet points */}
                  <ul className="flex-1 flex flex-col justify-center gap-2">
                    {book.valueProps[lang].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-brand/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={8} className="text-brand" />
                        </span>
                        <span className="text-white/80 text-xs leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Bottom bar — price + CTA */}
                <div className="flex items-center gap-3 px-4 py-3 border-t border-border bg-white/[0.02]">
                  <div className="flex items-baseline gap-1.5 flex-shrink-0">
                    <span className="text-white text-2xl font-extrabold">{formatPriceFor(book.id, lang)}</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => buyNow(book)}
                    className="flex-1 bg-brand text-white py-2.5 rounded-xl font-bold text-sm"
                  >
                    {t('booksPage.buyNow')}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddToCart(book)}
                    className={`w-10 h-10 border rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isInCart(book.id) ? 'bg-brand text-white border-brand' : 'border-border text-white/60'
                    }`}
                  >
                    <ShoppingCart size={15} />
                  </motion.button>
                </div>
              </div>

              {/* ── DESKTOP LAYOUT (unchanged) ── */}
              <div className="hidden md:contents">
                {/* Cover Image */}
                <div className="relative md:w-72 lg:w-96 flex-shrink-0 overflow-hidden">
                  <Image src={book.image} alt={book.title[lang]} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface" />
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Star size={11} className="text-yellow-400" fill="currentColor" />
                    <span className="text-white text-xs font-bold">{book.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5 lg:p-8">
                  <div className="flex gap-2 flex-wrap mb-3">
                    {book.badges[lang].map((badge, i) => (
                      <span key={i} className="bg-brand/10 text-brand text-xs font-semibold px-3 py-1 rounded-full border border-brand/20">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <p className="text-brand text-[11px] font-bold uppercase tracking-widest mb-1">{book.subtitle[lang]}</p>
                  <h2 className="text-white text-xl font-extrabold leading-tight mb-4">{book.title[lang]}</h2>
                  <p className="text-text-muted text-[11px] font-bold uppercase tracking-widest mb-3">
                    {lang === 'ar' ? 'ماذا ستتعلم' : 'What you get'}
                  </p>
                  <ul className="space-y-2 mb-4 flex-1">
                    {book.valueProps[lang].map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-brand/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={10} className="text-brand" />
                        </span>
                        <span className="text-white/80 text-sm leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-1.5 mb-4 text-text-muted text-xs">
                    <Zap size={11} className="text-yellow-400" />
                    <span>{book.downloads} {lang === 'ar' ? 'تحميل' : 'downloads'}</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className="text-white text-2xl font-extrabold">{formatPriceFor(book.id, lang)}</span>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => buyNow(book)}
                        className="flex-1 bg-white/10 border border-white/20 text-white py-3 rounded-xl font-bold hover:bg-white/15 transition-all text-sm"
                      >
                        {t('booksPage.buyNow')}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(book)}
                        className={`w-11 h-11 border rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                          isInCart(book.id) ? 'bg-brand text-white border-brand' : 'border-border hover:bg-brand/10 hover:border-brand/40 hover:text-brand'
                        }`}
                      >
                        <ShoppingCart size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bundle Card — full width featured */}
        <motion.div
          ref={bundleRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`relative rounded-3xl overflow-hidden border-2 transition-all mb-16 ${
            highlightedBook === 'bundle' ? 'border-brand' : 'border-brand/50'
          }`}
        >
          {/* Backgrounds */}
          <div className="absolute inset-0 bg-[#0d0d0d]" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-[#25d366]/8 rounded-full blur-[100px] pointer-events-none" />

          {/* TOP STRIP — badge + title row */}
          <div className="relative z-10 flex items-center justify-between px-6 lg:px-10 pt-7 pb-0 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-brand text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-brand/40 whitespace-nowrap">
                {lang === 'ar' ? '🏆 الأكثر طلباً' : '🏆 Most Popular'}
              </span>
              <span className="bg-white/5 border border-white/10 text-white/60 text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
                {lang === 'ar' ? 'أفضل قيمة' : 'Best Value'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-yellow-400" fill="currentColor" />)}
              <span className="text-white/60 text-xs ms-1">{bundle.rating} · {bundle.downloads} {lang === 'ar' ? 'عميل' : 'clients'}</span>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="relative z-10 p-6 lg:p-10">

            {/* ── HERO ROW: visual left + info right ── */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 mb-8">

              {/* Visual column: book covers stacked + WhatsApp tag */}
              <div className="flex-shrink-0 flex flex-col items-center gap-4 lg:w-72">
                {/* Books side by side with overlap */}
                <div className="relative w-full flex items-end justify-center" style={{ height: 200 }}>
                  {books.map((b, i) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12, type: 'spring', stiffness: 180, damping: 20 }}
                      className="absolute rounded-2xl overflow-hidden border border-white/10"
                      style={{
                        width: 130,
                        height: 176,
                        boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
                        left: i === 0 ? '8%' : undefined,
                        right: i === 1 ? '8%' : undefined,
                        bottom: 0,
                        transform: `rotate(${i === 0 ? -4 : 4}deg)`,
                        zIndex: i === 0 ? 1 : 2,
                      }}
                    >
                      <Image src={b.image} alt={b.title[lang]} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </motion.div>
                  ))}
                  {/* Plus connector */}
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-surface border-2 border-border flex items-center justify-center shadow-lg">
                    <Plus size={14} className="text-white" />
                  </div>
                </div>

                {/* WhatsApp bonus tag */}
                <div className="w-full rounded-2xl overflow-hidden border border-[#25d366]/30" style={{ background: 'linear-gradient(135deg, #0d2e1e 0%, #0a2318 100%)' }}>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[#25d366]/15">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', boxShadow: '0 4px 12px rgba(37,211,102,0.4)' }}>
                      <Gift size={16} color="white" />
                    </div>
                    <p className="text-[#4ade80] text-sm font-bold leading-snug">
                      {lang === 'ar' ? 'متابعة شخصية عبر الواتساب' : 'Personal WhatsApp Support'}
                    </p>
                  </div>
                  <div className="px-4 py-3 flex flex-col gap-2">
                    {(lang === 'ar'
                      ? ['رد خلال 24 ساعة', 'متابعة أسبوعية', 'تعديل الخطة', 'دعم شهر كامل']
                      : ['Reply in 24h', 'Weekly check-in', 'Plan adjustments', '1 month support']
                    ).map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.35)' }}>
                          <Check size={8} color="#25d366" />
                        </div>
                        <span className="text-white/70 text-xs">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info column: title + bullets + price + CTA */}
              <div className="flex-1 flex flex-col">
                {/* Title block */}
                <div className="mb-6">
                  <span className="inline-block bg-brand/15 text-brand text-[11px] font-bold px-3 py-1 rounded-full mb-3 border border-brand/20 uppercase tracking-wide">
                    {lang === 'ar' ? 'برنامج متكامل' : 'Complete Program'}
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-2 leading-tight">
                    {bundle.title[lang]}
                  </h2>
                  <p className="text-text-secondary text-sm leading-relaxed">{bundle.subtitle[lang]}</p>
                </div>

                {/* What's included — 2-col grid on larger screens */}
                <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-3">
                  {lang === 'ar' ? 'كل ما تحصل عليه' : 'Everything included'}
                </p>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
                  {bundle.valueProps[lang].map((item, i) => {
                    const isWhatsApp = i === 3
                    return (
                      <li key={i} className={`flex items-start gap-2.5 ${isWhatsApp ? 'sm:col-span-2' : ''}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isWhatsApp ? 'bg-[#25d366]/20 border border-[#25d366]/50' : 'bg-brand/20 border border-brand/40'}`}>
                          <Check size={9} className={isWhatsApp ? 'text-[#25d366]' : 'text-brand'} />
                        </span>
                        <span className="text-white/80 text-sm leading-snug flex items-center gap-2 flex-wrap">
                          {item}
                          {isWhatsApp && (
                            <span className="inline-flex items-center gap-1 bg-[#25d366]/15 border border-[#25d366]/35 text-[#25d366] text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                              <MessageCircle size={9} />
                              {lang === 'ar' ? 'حصري للباقة' : 'Bundle Only'}
                            </span>
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                {/* Price + CTA block */}
                <div className="mt-auto bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4">
                  {/* Price row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-white text-5xl font-extrabold tracking-tight">{formatPriceFor('bundle', lang)}</span>
                    <div className="flex flex-col gap-1 ms-auto">
                    </div>
                  </div>


                  {/* CTAs */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={buyBundle}
                    className="w-full flex items-center justify-center gap-3 bg-brand text-white py-4 rounded-2xl text-base font-bold shadow-lg shadow-brand/40 hover:shadow-brand/60 transition-all group"
                  >
                    <span>{t('booksPage.getBundle')}</span>
                    <Arrow size={18} className={`transition-transform ${lang === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart(bundle)}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border font-semibold transition-all text-sm ${
                      isInCart(bundle.id) ? 'bg-brand/10 border-brand text-brand' : 'border-border text-text-secondary hover:border-brand/40 hover:text-white'
                    }`}
                  >
                    <ShoppingCart size={16} />
                    <span>{isInCart(bundle.id) ? (lang === 'ar' ? 'في السلة ✓' : 'In Cart ✓') : (lang === 'ar' ? 'أضف للسلة' : 'Add to Cart')}</span>
                  </motion.button>
                  <div className="flex items-center justify-center gap-1.5 text-text-muted text-xs">
                    <Lock size={11} className="flex-shrink-0" />
                    <span>{lang === 'ar' ? 'دفع آمن · ضمان استرداد 7 أيام' : 'Secure pay · 7-day refund'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BOTTOM: testimonial ── */}
            <div className="border-t border-white/8 pt-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-sm font-bold shadow-md">م</div>
                  <div>
                    <p className="text-white text-sm font-bold">{lang === 'ar' ? 'محمد العتيبي' : 'Mohammed Al-Otaibi'}</p>
                    <p className="text-text-muted text-xs">{lang === 'ar' ? 'الرياض · خسر 9 كجم في 45 يوم' : 'Riyadh · Lost 9kg in 45 days'}</p>
                  </div>
                </div>
                <div className="flex-1 bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3">
                  <div className="flex gap-0.5 mb-1.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-yellow-400" fill="currentColor" />)}
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed">
                    {lang === 'ar'
                      ? '"خسرت 9 كيلو في شهر ونص. ما توقعت النتيجة تجي بهالسرعة. الباقة كاملة وما تحتاج تدور غيرها."'
                      : '"Lost 9kg in a month and a half. Didn\'t expect results this fast. The bundle covers everything — nothing missing."'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-6"
        >
          {[
            { icon: Lock, label: t('booksPage.securePay'), desc: t('booksPage.securePayDesc'), color: 'text-accent-green' },
            { icon: Zap, label: t('booksPage.instantDownload'), desc: t('booksPage.instantDownloadDesc'), color: 'text-brand' },
            { icon: Check, label: t('booksPage.qualityGuarantee'), desc: t('booksPage.qualityGuaranteeDesc'), color: 'text-accent-purple' },
          ].map((item, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-6 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <item.icon size={18} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">{item.label}</h3>
                <p className="text-text-muted text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  )
}
