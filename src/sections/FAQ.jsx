'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageCircle } from 'lucide-react'
import { cn } from '../lib/utils'
import { useLanguage } from '../context/LanguageContext'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)
  const { lang, t } = useLanguage()

  const faqs = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
    { question: t('faq.q6'), answer: t('faq.a6') },
  ]

  return (
    <section id="faq" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent-green/10 border border-accent-green/20 px-5 py-2 rounded-full mb-6">
              <span className="text-lg">❓</span>
              <span className="text-accent-green text-sm font-semibold">{t('faq.badge')}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
              {t('faq.title')}
            </h2>

            <p className="text-text-secondary text-lg leading-relaxed mb-8 font-tajawal">
              {t('faq.subtitle')}
            </p>

            <motion.a
              href="https://wa.me/966500000000"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 bg-white/[0.04] border border-border px-6 py-4 rounded-2xl text-white font-semibold hover:bg-[#25d366] hover:border-[#25d366] transition-all group"
            >
              <MessageCircle size={22} className="text-[#25d366] group-hover:text-white transition-colors" />
              <span>{t('faq.whatsapp')}</span>
            </motion.a>
          </motion.div>

          {/* FAQ Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={cn(
                  'bg-surface border rounded-2xl overflow-hidden transition-all',
                  openIndex === index ? 'border-brand/30' : 'border-border hover:border-border-hover'
                )}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                  className={`w-full px-6 py-5 flex items-center justify-between gap-4 ${lang === 'ar' ? 'text-right' : 'text-left'} hover:bg-white/[0.02] transition-colors`}
                >
                  <p className="text-white font-semibold text-base">{faq.question}</p>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                      openIndex === index
                        ? 'bg-brand/15 text-brand rotate-45'
                        : 'bg-white/5 text-text-muted'
                    )}
                  >
                    <Plus size={18} />
                  </div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-5 pt-0">
                        <p className="text-text-secondary text-sm leading-relaxed border-t border-border pt-5 font-tajawal">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
