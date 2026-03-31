'use client'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Star, TrendingDown, TrendingUp, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '../context/LanguageContext'

const transformations = [
  {
    id: 1,
    name: { ar: 'أحمد محمد', en: 'Ahmed Mohamed' },
    location: { ar: 'الرياض، السعودية', en: 'Riyadh, Saudi Arabia' },
    age: 32,
    result: { ar: '-١٥ كجم', en: '-15 kg' },
    duration: { ar: '٩٠ يوم', en: '90 days' },
    quote: { ar: 'البرامج واضحة جداً وسهلة التطبيق. بدأت أرى النتائج من الأسبوع الثاني! كنت متردد في البداية لكن النتائج تتحدث عن نفسها.', en: 'The programs are very clear and easy to follow. I started seeing results from the second week! I was hesitant at first but the results speak for themselves.' },
    beforeEmoji: '👤',
    afterEmoji: '💪',
    accentColor: 'from-brand to-brand-darker',
    stats: { weightLost: 15, muscleGain: 3, bodyFat: -8 },
  },
  {
    id: 2,
    name: { ar: 'سارة العتيبي', en: 'Sara Al-Otaibi' },
    location: { ar: 'جدة، السعودية', en: 'Jeddah, Saudi Arabia' },
    age: 28,
    result: { ar: '-١٢ كجم', en: '-12 kg' },
    duration: { ar: '٦٠ يوم', en: '60 days' },
    quote: { ar: 'أخيراً فهمت التغذية الصحيحة. الوجبات لذيذة ومشبعة ومافيها حرمان! أنصح كل بنت تبدأ رحلتها مع هذه البرامج.', en: 'I finally understood proper nutrition. The meals are delicious, filling, and no deprivation! I recommend every woman starts her journey with these programs.' },
    beforeEmoji: '👤',
    afterEmoji: '🏃‍♀️',
    accentColor: 'from-purple-500 to-purple-700',
    stats: { weightLost: 12, muscleGain: 2, bodyFat: -6 },
  },
  {
    id: 3,
    name: { ar: 'خالد الراشد', en: 'Khalid Al-Rashed' },
    location: { ar: 'الدمام، السعودية', en: 'Dammam, Saudi Arabia' },
    age: 35,
    result: { ar: '+٨ كجم', en: '+8 kg' },
    duration: { ar: '١٢٠ يوم', en: '120 days' },
    quote: { ar: 'التمارين مصورة بوضوح تام. بنيت عضلات بدون ما أحتاج مدرب شخصي! الاستثمار في البرامج كان أفضل قرار.', en: 'The exercises are illustrated very clearly. I built muscle without needing a personal trainer! Investing in the programs was the best decision.' },
    beforeEmoji: '👤',
    afterEmoji: '🏋️',
    accentColor: 'from-accent-green to-green-700',
    stats: { weightLost: 0, muscleGain: 8, bodyFat: -5 },
    isGain: true,
  },
  {
    id: 4,
    name: { ar: 'نورة الشمري', en: 'Noura Al-Shammari' },
    location: { ar: 'الكويت', en: 'Kuwait' },
    age: 25,
    result: { ar: '-١٠ كجم', en: '-10 kg' },
    duration: { ar: '٤٥ يوم', en: '45 days' },
    quote: { ar: 'بعد الولادة كنت محتاجة خطة واضحة ومناسبة لوقتي المحدود. هذه البرامج كانت الحل المثالي!', en: 'After giving birth I needed a clear plan suitable for my limited time. These programs were the perfect solution!' },
    beforeEmoji: '👤',
    afterEmoji: '✨',
    accentColor: 'from-pink-500 to-rose-600',
    stats: { weightLost: 10, muscleGain: 1, bodyFat: -7 },
  },
  {
    id: 5,
    name: { ar: 'عبدالله القحطاني', en: 'Abdullah Al-Qahtani' },
    location: { ar: 'المدينة المنورة', en: 'Madinah' },
    age: 40,
    result: { ar: '-٢٠ كجم', en: '-20 kg' },
    duration: { ar: '١٨٠ يوم', en: '180 days' },
    quote: { ar: 'في عمر الأربعين ظننت أن الوقت فات. لكن هذه البرامج أثبتت العكس. صحتي تحسنت بشكل ملحوظ.', en: 'At 40 I thought it was too late. But these programs proved otherwise. My health improved significantly.' },
    beforeEmoji: '👤',
    afterEmoji: '🎯',
    accentColor: 'from-blue-500 to-blue-700',
    stats: { weightLost: 20, muscleGain: 4, bodyFat: -12 },
  },
  {
    id: 6,
    name: { ar: 'ريم الحربي', en: 'Reem Al-Harbi' },
    location: { ar: 'الرياض، السعودية', en: 'Riyadh, Saudi Arabia' },
    age: 30,
    result: { ar: '-٨ كجم', en: '-8 kg' },
    duration: { ar: '٣٠ يوم', en: '30 days' },
    quote: { ar: 'نتائج سريعة وملموسة! الأهم أنني تعلمت كيف أحافظ على الوزن بعد ما خسرته.', en: 'Quick and tangible results! Most importantly, I learned how to maintain my weight after losing it.' },
    beforeEmoji: '👤',
    afterEmoji: '🌟',
    accentColor: 'from-amber-500 to-orange-600',
    stats: { weightLost: 8, muscleGain: 2, bodyFat: -4 },
  },
]

export default function ResultsPage() {
  const { lang, t } = useLanguage()

  const stats = [
    { icon: Users, value: t('resultsPage.stat1'), label: t('resultsPage.stat1Label') },
    { icon: Star, value: t('resultsPage.stat2'), label: t('resultsPage.stat2Label') },
    { icon: TrendingDown, value: t('resultsPage.stat3'), label: t('resultsPage.stat3Label') },
    { icon: Clock, value: t('resultsPage.stat4'), label: t('resultsPage.stat4Label') },
  ]

  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2.5 bg-brand/10 border border-brand/20 px-6 py-2.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
            <span className="text-brand text-sm font-semibold">{t('resultsPage.badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            {t('resultsPage.title')}
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            {t('resultsPage.subtitle')}
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-surface border border-border rounded-2xl p-6 text-center hover:border-brand/30 transition-all"
            >
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon size={24} className="text-brand" />
              </div>
              <p className="text-brand text-3xl font-extrabold mb-1">{stat.value}</p>
              <p className="text-text-secondary text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Transformations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {transformations.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-surface border border-border rounded-3xl overflow-hidden hover:border-brand/30 hover:-translate-y-2 transition-all duration-300 group"
            >
              {/* Before/After */}
              <div className="relative h-48 grid grid-cols-2">
                <div className="bg-gradient-to-br from-surface-muted to-surface flex items-center justify-center relative">
                  <span className="text-6xl opacity-40 group-hover:scale-110 transition-transform duration-500">
                    {item.beforeEmoji}
                  </span>
                  <span className={`absolute bottom-3 bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg ${lang === 'ar' ? 'right-3' : 'left-3'}`}>
                    {t('resultsPage.before')}
                  </span>
                </div>
                <div className={`bg-gradient-to-br ${item.accentColor} flex items-center justify-center relative`}>
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
                    {item.afterEmoji}
                  </span>
                  <span className={`absolute bottom-3 bg-black/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg ${lang === 'ar' ? 'left-3' : 'right-3'}`}>
                    {t('resultsPage.after')}
                  </span>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl z-10 group-hover:scale-110 transition-transform">
                  <Arrow size={20} className="text-brand" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{item.name[lang]}</h3>
                    <p className="text-text-muted text-sm">{item.location[lang]} • {item.age} {t('resultsPage.years')}</p>
                  </div>
                  <div className={lang === 'ar' ? 'text-left' : 'text-right'}>
                    <span className={`text-xl font-extrabold block ${item.isGain ? 'text-blue-400' : 'text-accent-green'}`}>
                      {item.result[lang]}
                    </span>
                    <span className="text-text-muted text-xs flex items-center gap-1 justify-end">
                      <Clock size={12} />
                      {item.duration[lang]}
                    </span>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="flex gap-3 mb-4">
                  {item.stats.weightLost > 0 && (
                    <div className="flex items-center gap-1 bg-accent-green/10 text-accent-green text-xs px-2 py-1 rounded-lg">
                      <TrendingDown size={12} />
                      <span>{item.stats.weightLost} {t('resultsPage.kg')}</span>
                    </div>
                  )}
                  {item.stats.muscleGain > 0 && (
                    <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded-lg">
                      <TrendingUp size={12} />
                      <span>{item.stats.muscleGain} {t('resultsPage.kgMuscle')}</span>
                    </div>
                  )}
                </div>

                <p className="text-text-secondary text-sm leading-relaxed border-t border-border pt-4">
                  "{item.quote[lang]}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-brand/15 to-brand/5 border border-brand/20 rounded-3xl p-8 lg:p-12 text-center"
        >
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">{t('resultsPage.ctaTitle')}</h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            {t('resultsPage.ctaDesc')}
          </p>
          <Link
            to="/programs"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-brand to-brand-dark text-white px-8 py-4 rounded-2xl text-lg font-bold hover:-translate-y-1 transition-transform group"
          >
            <span>{t('resultsPage.ctaButton')}</span>
            <Arrow size={20} className={`transition-transform ${lang === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
