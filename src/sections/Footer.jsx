'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useMarketing } from '../context/MarketingContext'
import Image from 'next/image'

function TikTokIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.5 2h-3v13.2a2.7 2.7 0 1 1-2.7-2.7c.2 0 .5 0 .7.1V9.5a5.7 5.7 0 1 0 5 5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.4 4.4 0 0 1-4.3-4.3V2z"/>
    </svg>
  )
}

const SOCIAL_LINKS = [
  { label: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/fitzoneapp1' },
  { label: 'TikTok',    icon: TikTokIcon, href: 'https://www.tiktok.com/@fitzoneapp' },
]

export default function Footer() {
  const { lang } = useLanguage()
  const { whatsapp, whatsapp_visible } = useMarketing()

  const whatsappVisible = whatsapp_visible !== 'false' && whatsapp_visible !== false

  const footerLinks = {
    books: [
      { label: lang === 'ar' ? 'خطة التحول الشامل' : 'Transformation Plan', href: '/programs', bookId: 'transformation' },
      { label: lang === 'ar' ? 'دليل التغذية' : 'Nutrition Guide', href: '/programs', bookId: 'nutrition' },
      { label: lang === 'ar' ? 'الباقة الكاملة' : 'Complete Bundle', href: '/programs', bookId: 'bundle' },
    ],
    links: [
      { label: lang === 'ar' ? 'قصص النجاح' : 'Success Stories', href: '/results' },
      { label: lang === 'ar' ? 'المدونة' : 'Blog', href: '/blog' },
      ...(whatsappVisible ? [{ label: lang === 'ar' ? 'تواصل معنا' : 'Contact Us', href: `https://wa.me/${whatsapp}`, external: true }] : []),
    ],
    legal: [
      { label: lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy', href: '/privacy' },
      { label: lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions', href: '/terms' },
      { label: lang === 'ar' ? 'سياسة الاسترداد' : 'Refund Policy', href: '/refund' },
    ],
  }

  const paymentMethods = [
    { icon: '🔒', label: lang === 'ar' ? 'Stripe آمن' : 'Secure Stripe' },
    { icon: '⚡', label: lang === 'ar' ? 'تسليم فوري' : 'Instant Delivery' },
    { icon: '🛡️', label: lang === 'ar' ? 'SSL مشفر' : 'SSL Encrypted' },
    { icon: '💬', label: lang === 'ar' ? 'دعم واتساب' : 'WhatsApp Support' },
  ]

  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <Image src="/fitzone-logo.jpeg" alt="FitZone" width={44} height={44} className="w-11 h-11 rounded-xl object-contain" />
              <span className="text-xl font-bold text-white">FitZone</span>
            </Link>

            <p className="text-text-secondary text-sm leading-relaxed mb-6 font-tajawal">
              {lang === 'ar'
                ? 'برامج تدريبية متخصصة في التغذية والتمارين الرياضية. نساعدك على تحقيق أهدافك الصحية بطريقة علمية ومستدامة.'
                : 'Specialized training programs in nutrition and exercise. We help you achieve your health goals scientifically.'
              }
            </p>

            <div className="flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  whileHover={{ scale: 1.08, y: -2 }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all bg-white/[0.05] border border-border text-text-secondary hover:bg-brand/15 hover:border-brand/40 hover:text-brand"
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Books Column */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5">
              {lang === 'ar' ? 'البرامج' : 'Programs'}
            </h4>
            <ul className="space-y-3.5">
              {footerLinks.books.map((link, index) => (
                <li key={index}>
                  <Link
                    href={`${link.href}?highlight=${link.bookId}`}
                    className="text-text-secondary text-sm hover:text-brand hover:-translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5">
              {lang === 'ar' ? 'روابط' : 'Links'}
            </h4>
            <ul className="space-y-3.5">
              {footerLinks.links.map((link, index) => (
                <li key={index}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary text-sm hover:text-brand hover:-translate-x-1 transition-all inline-block"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-text-secondary text-sm hover:text-brand hover:-translate-x-1 transition-all inline-block"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5">
              {lang === 'ar' ? 'قانوني' : 'Legal'}
            </h4>
            <ul className="space-y-3.5">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-text-secondary text-sm hover:text-brand hover:-translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col lg:flex-row items-center justify-between gap-6">
          <p className="text-text-muted text-sm">
            {lang === 'ar' ? '© 2025 FitZone. جميع الحقوق محفوظة' : '© 2025 FitZone. All rights reserved'}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white/[0.04] border border-border px-3.5 py-2 rounded-lg flex items-center gap-2 text-text-secondary text-xs"
              >
                <span>{method.icon}</span>
                <span>{method.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
