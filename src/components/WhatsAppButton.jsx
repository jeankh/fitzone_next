'use client'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useMarketing } from '../context/MarketingContext'
import { getMarketingHref } from '../lib/marketing'

export default function WhatsAppButton() {
  const { lang } = useLanguage()
  const { whatsapp, loaded } = useMarketing()

  const whatsappHref = getMarketingHref('whatsapp', whatsapp)
  if (!loaded || !whatsappHref) return null

  return (
    <motion.a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.4, type: 'spring' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-6 ${lang === 'ar' ? 'left-6' : 'right-6'} z-50 w-14 h-14 bg-[#25d366] rounded-full flex items-center justify-center shadow-lg shadow-[#25d366]/40 animate-pulse-glow cursor-pointer group`}
    >
      <MessageCircle size={26} className="text-white group-hover:scale-110 transition-transform" />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-surface border border-border rounded-xl text-white text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-surface" />
      </div>
    </motion.a>
  )
}
