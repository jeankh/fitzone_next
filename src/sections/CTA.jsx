'use client'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../context/LanguageContext'

export default function CTA() {
  const { t, lang } = useLanguage()
  const router = useRouter()
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  const guarantees = [t('cta.g1'), t('cta.g2'), t('cta.g3')]

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6">
            {t('cta.title')}
          </h2>

          <p className="text-text-secondary text-lg leading-relaxed mb-10 max-w-xl mx-auto font-tajawal">
            {t('cta.subtitle')}
          </p>

          <motion.button
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/programs')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-brand to-brand-dark text-white px-10 py-5 rounded-2xl text-xl font-bold glow-brand hover:glow-brand-hover transition-all group"
          >
            <span>{t('cta.button')}</span>
            <Arrow size={24} className={`transition-transform ${lang === 'ar' ? 'group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`} />
          </motion.button>

          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {guarantees.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-text-secondary">
                <Check size={18} className="text-accent-green" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
