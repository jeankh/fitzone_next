'use client'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import Image from 'next/image'

const transformations = [
  {
    id: 1,
    name: { ar: 'أحمد محمد', en: 'Ahmed Mohamed' },
    location: { ar: 'الرياض، السعودية', en: 'Riyadh, Saudi Arabia' },
    result: { ar: '-١٥ كجم', en: '-15 kg' },
    duration: { ar: 'في ٩٠ يوم', en: 'in 90 days' },
    quote: { ar: 'البرامج واضحة جداً وسهلة التطبيق. بدأت أرى النتائج من الأسبوع الثاني!', en: 'The programs are very clear and easy to follow. I started seeing results from week two!' },
    beforePhoto: 'https://images.pexels.com/photos/9927899/pexels-photo-9927899.jpeg?w=400',
    afterPhoto: 'https://images.unsplash.com/photo-1549476464-37392f717541?w=400&q=80',
    beforeEmoji: '👤',
    afterEmoji: '💪',
    accentColor: 'from-brand to-brand-darker',
  },
  {
    id: 2,
    name: { ar: 'سارة العتيبي', en: 'Sara Al-Otaibi' },
    location: { ar: 'جدة، السعودية', en: 'Jeddah, Saudi Arabia' },
    result: { ar: '-١٢ كجم', en: '-12 kg' },
    duration: { ar: 'في ٦٠ يوم', en: 'in 60 days' },
    quote: { ar: 'أخيراً فهمت التغذية الصحيحة. الوجبات لذيذة ومشبعة ومافيها حرمان!', en: 'I finally understood proper nutrition. Meals are delicious and filling with no deprivation!' },
    beforePhoto: 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg?w=400',
    afterPhoto: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80',
    beforeEmoji: '👤',
    afterEmoji: '🏃‍♀️',
    accentColor: 'from-purple-500 to-purple-700',
  },
  {
    id: 3,
    name: { ar: 'خالد الراشد', en: 'Khalid Al-Rashed' },
    location: { ar: 'الدمام، السعودية', en: 'Dammam, Saudi Arabia' },
    result: { ar: '+٨ كجم', en: '+8 kg' },
    duration: { ar: 'عضلات في ١٢٠ يوم', en: 'muscle in 120 days' },
    quote: { ar: 'التمارين مصورة بوضوح تام. بنيت عضلات بدون ما أحتاج مدرب شخصي!', en: 'Exercises are illustrated perfectly. I built muscle without needing a personal trainer!' },
    beforePhoto: 'https://images.pexels.com/photos/6551133/pexels-photo-6551133.jpeg?w=400',
    afterPhoto: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    beforeEmoji: '👤',
    afterEmoji: '🏋️',
    accentColor: 'from-accent-green to-green-700',
  },
]

function TransformationPhoto({ photo, emoji, label, accentClass, lang, side }) {
  if (!photo) {
    return (
      <div className={`flex items-center justify-center relative h-full ${accentClass ? `bg-gradient-to-br ${accentClass}` : 'bg-gradient-to-br from-surface-muted to-surface'}`}>
        <span className="text-7xl opacity-40 group-hover:scale-110 transition-transform duration-500">{emoji}</span>
        <span className={`absolute bottom-3 ${side === 'before' ? (lang === 'ar' ? 'right-3' : 'left-3') : (lang === 'ar' ? 'left-3' : 'right-3')} bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg`}>
          {label}
        </span>
      </div>
    )
  }
  return (
    <div className="relative h-full overflow-hidden">
      <Image src={photo} alt="" fill className="object-cover object-top" />
      <span className={`absolute bottom-3 ${side === 'before' ? (lang === 'ar' ? 'right-3' : 'left-3') : (lang === 'ar' ? 'left-3' : 'right-3')} bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg`}>
        {label}
      </span>
    </div>
  )
}

export default function Transformations() {
  const { lang, t } = useLanguage()

  const stats = [
    { value: lang === 'ar' ? '+١٠٠٠' : '1000+', label: t('transformations.stats.s1') },
    { value: lang === 'ar' ? '٩٨%' : '98%', label: t('transformations.stats.s2') },
    { value: lang === 'ar' ? '-١٢' : '-12', label: t('transformations.stats.s3') },
    { value: lang === 'ar' ? '٦٠' : '60', label: t('transformations.stats.s4') },
  ]

  return (
    <section id="transformations" className="pt-12 lg:pt-16 pb-24 lg:pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2.5 bg-brand/10 border border-brand/20 px-6 py-2.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
            <span className="text-brand text-sm font-semibold">{t('transformations.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">{t('transformations.title')}</h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            {t('transformations.subtitle')}
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {transformations.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-surface border border-border rounded-3xl overflow-hidden card-hover group"
            >
              {/* Before/After */}
              <div className="relative h-56 grid grid-cols-2">
                <TransformationPhoto
                  photo={item.beforePhoto}
                  emoji={item.beforeEmoji}
                  label={t('transformations.before')}
                  accentClass={null}
                  lang={lang}
                  side="before"
                />
                <TransformationPhoto
                  photo={item.afterPhoto}
                  emoji={item.afterEmoji}
                  label={t('transformations.after')}
                  accentClass={item.accentColor}
                  lang={lang}
                  side="after"
                />
                {/* Arrow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl z-10 group-hover:scale-110 transition-transform">
                  {lang === 'ar' ? <ArrowLeft size={20} className="text-brand" /> : <ArrowRight size={20} className="text-brand" />}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{item.name[lang]}</h3>
                    <p className="text-text-muted text-sm">{item.location[lang]}</p>
                  </div>
                  <div className={lang === 'ar' ? 'text-left' : 'text-right'}>
                    <span className="text-accent-green text-xl font-extrabold block">{item.result[lang]}</span>
                    <span className="text-text-muted text-xs">{item.duration[lang]}</span>
                  </div>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed border-t border-border pt-4">
                  "{item.quote[lang]}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-brand/15 to-brand/5 border border-brand/15 rounded-3xl p-8 lg:p-12"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`text-center ${
                  index < stats.length - 1 ? `${lang === 'ar' ? 'lg:border-l' : 'lg:border-r'} border-white/10` : ''
                }`}
              >
                <motion.span
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-brand text-4xl lg:text-5xl font-extrabold block mb-2"
                >
                  {stat.value}
                </motion.span>
                <span className="text-text-secondary text-sm lg:text-base">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
