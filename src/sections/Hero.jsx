'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Play, ArrowLeft, ArrowRight, Check, Download, Star, Gift, Plus } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import Image from 'next/image'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const avatars = [
  { letter: 'أ', color: 'from-blue-500 to-blue-700' },
  { letter: 'س', color: 'from-pink-500 to-pink-700' },
  { letter: 'م', color: 'from-purple-500 to-purple-700' },
  { letter: 'ن', color: 'from-green-500 to-green-700' },
]

export default function Hero() {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  const guarantees = [
    { icon: Check, text: t('hero.guarantee1') },
    { icon: Check, text: t('hero.guarantee2') },
    { icon: Check, text: t('hero.guarantee3') },
  ]

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="relative pt-28 lg:pt-32 pb-8 lg:pb-12 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Trust Row */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center">
                {avatars.map((avatar, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatar.color} border-[3px] border-background flex items-center justify-center text-sm font-semibold text-white ${lang === 'ar' ? '-mr-3 first:mr-0' : '-ml-3 first:ml-0'} hover:scale-110 hover:z-10 transition-transform cursor-pointer`}
                  >
                    {avatar.letter}
                  </div>
                ))}
                <div className={`w-9 h-9 rounded-full bg-white/10 border-[3px] border-background flex items-center justify-center text-[11px] font-semibold text-white ${lang === 'ar' ? '-mr-3' : '-ml-3'}`}>
                  +1K
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex gap-0.5 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm text-text-secondary">{t('hero.rating')}</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight"
            >
              {t('hero.headline1')}
              <br />
              <span className="text-gradient">{t('hero.headline2')}</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-text-secondary leading-relaxed mb-10 max-w-lg font-tajawal"
            >
              {t('hero.subheadline')}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-12">
              <motion.button
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection('books')}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-brand to-brand-dark text-white px-8 py-4 rounded-2xl text-lg font-bold glow-brand hover:glow-brand-hover transition-all group"
              >
                <span>{t('hero.cta1')}</span>
                <Arrow size={20} className={`transition-transform ${lang === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection('transformations')}
                className="flex items-center justify-center gap-3 bg-white/5 border border-border text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/10 hover:border-border-hover transition-all group"
              >
                <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-brand/20 group-hover:text-brand transition-all">
                  <Play size={18} fill="currentColor" />
                </span>
                <span>{t('hero.cta2')}</span>
              </motion.button>
            </motion.div>

            {/* Guarantees */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
              {guarantees.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-text-secondary hover:text-white transition-colors">
                  <span className="w-6 h-6 rounded-full bg-accent-green/15 flex items-center justify-center">
                    <item.icon size={14} className="text-accent-green" />
                  </span>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Bundle Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Card */}
            <div className="relative bg-surface border border-border rounded-3xl p-6 flex flex-col gap-5 shadow-2xl shadow-black/40">

              {/* Floating badge — downloads */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 right-6 bg-surface border border-border rounded-2xl px-4 py-2.5 flex items-center gap-3 z-20 shadow-lg"
              >
                <div className="w-9 h-9 bg-accent-green rounded-xl flex items-center justify-center">
                  <Download size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">5000+</p>
                  <p className="text-text-muted text-xs">{t('hero.downloads')}</p>
                </div>
              </motion.div>

              {/* Book covers fanned */}
              <div className="relative w-full flex items-end justify-center" style={{ height: 210 }}>
                {[
                  { src: '/fitzone-workout.jpeg', rotate: -5, left: '6%', zIndex: 1 },
                  { src: '/fitzone-nutrition.jpeg', rotate: 5, right: '6%', zIndex: 2 },
                ].map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.15, type: 'spring', stiffness: 180, damping: 20 }}
                    className="absolute rounded-2xl overflow-hidden border border-white/10"
                    style={{
                      width: 140,
                      height: 188,
                      boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
                      left: b.left,
                      right: b.right,
                      bottom: 0,
                      transform: `rotate(${b.rotate}deg)`,
                      zIndex: b.zIndex,
                    }}
                  >
                    <Image src={b.src} alt="" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </motion.div>
                ))}
                {/* Plus connector */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full bg-surface border-2 border-border flex items-center justify-center shadow-lg">
                  <Plus size={14} className="text-white" />
                </div>
                {/* Floating review badge */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  className="absolute bottom-0 left-0 bg-surface border border-border rounded-2xl px-3 py-2 z-20 shadow-lg"
                >
                  <div className="flex gap-0.5 text-yellow-400 mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                  </div>
                  <p className="text-white/80 text-xs font-medium">"{t('hero.review')}"</p>
                </motion.div>
              </div>

              {/* WhatsApp tag */}
              <div className="rounded-2xl overflow-hidden border border-[#25d366]/30" style={{ background: 'linear-gradient(135deg, #0d2e1e 0%, #0a2318 100%)' }}>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#25d366]/15">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', boxShadow: '0 4px 12px rgba(37,211,102,0.4)' }}>
                    <Gift size={16} color="white" />
                  </div>
                  <p className="text-[#4ade80] text-sm font-bold">
                    {lang === 'ar' ? 'متابعة شخصية عبر الواتساب' : 'Personal WhatsApp Support'}
                  </p>
                </div>
                <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2">
                  {(lang === 'ar'
                    ? ['رد خلال 24 ساعة', 'متابعة أسبوعية', 'تعديل الخطة', 'دعم شهر كامل']
                    : ['Reply within 24h', 'Weekly check-in', 'Plan adjustments', '1 month support']
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

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection('books')}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-brand to-brand-dark text-white py-4 rounded-2xl text-base font-bold shadow-lg shadow-brand/40 hover:shadow-brand/60 transition-all group"
              >
                <span>{lang === 'ar' ? 'احصل على الباقة الآن' : 'Get the Bundle Now'}</span>
                <Arrow size={18} className={`transition-transform ${lang === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
              </motion.button>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
