'use client'
import { motion } from 'framer-motion'
import { MessageCircle, Clock, RefreshCw, CheckCircle, Shield, ArrowLeft, ArrowRight } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useRouter } from 'next/navigation'

const features = [
  { icon: Clock,        ar: 'رد خلال 24 ساعة',           en: 'Reply within 24 hours' },
  { icon: RefreshCw,    ar: 'متابعة أسبوعية لتقدمك',      en: 'Weekly progress check-in' },
  { icon: CheckCircle,  ar: 'تعديل الخطة حسب نتائجك',    en: 'Plan adjustments based on results' },
  { icon: Shield,       ar: 'دعم كامل لمدة شهر',          en: 'Full support for one month' },
]

const chatMessages = [
  { from: 'client', ar: 'وين أبدأ إذا ما تمرنت قبل؟',                          en: "Where do I start if I've never trained before?" },
  { from: 'team',   ar: 'ابدأ بالبرنامج الأول، راح أرسلك الجدول اليوم ✅',      en: "Start with the first program, I'll send the schedule today ✅" },
  { from: 'client', ar: 'كيف أعرف إذا التمرين صح؟',                            en: "How do I know if I'm doing the exercise correctly?" },
  { from: 'team',   ar: 'أرسلي فيديو وأصحح لك مباشرة 💪',                       en: "Send me a video and I'll correct you directly 💪" },
  { from: 'client', ar: 'وش آكل قبل التمرين؟',                                  en: 'What should I eat before training?' },
  { from: 'team',   ar: 'كارب + بروتين قبل ساعة. عندك خيارات في الدليل 🥗',     en: 'Carbs + protein 1 hour before. Options in the guide 🥗' },
]

export default function WhatsAppSection() {
  const { lang } = useLanguage()
  const router = useRouter()
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  return (
    <section id="support" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background — lighter, no heavy blur on mobile */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#25d366]/[0.03] to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#25d366]/4 rounded-full blur-[80px] pointer-events-none hidden lg:block" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Text Side ── */}
          <motion.div
            initial={{ opacity: 0, x: lang === 'ar' ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#25d366]/10 border border-[#25d366]/25 px-5 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-[#25d366] rounded-full" />
              <MessageCircle size={14} className="text-[#25d366]" />
              <span className="text-[#25d366] text-sm font-semibold">
                {lang === 'ar' ? 'متابعة شخصية' : 'Personal Support'}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5 leading-tight">
              {lang === 'ar' ? 'مش لحالك' : "You're Not"}<br />
              <span className="text-[#25d366]">{lang === 'ar' ? 'في الرحلة' : 'Alone in This'}</span>
            </h2>

            <p className="text-text-secondary text-lg leading-relaxed mb-10 font-tajawal max-w-lg">
              {lang === 'ar'
                ? 'مع الباقة الكاملة تحصل على متابعة شخصية من فريق FitZone عبر الواتساب. نجيب على أسئلتك، نصحح مسارك، ونعدّل الخطة حسب تقدمك.'
                : 'With the complete bundle, get personal follow-up from the FitZone team via WhatsApp. We answer your questions, correct your path, and adjust the plan based on your progress.'
              }
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white/[0.03] border border-[#25d366]/15 rounded-2xl px-4 py-3.5"
                >
                  <div className="w-8 h-8 bg-[#25d366]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon size={15} className="text-[#25d366]" />
                  </div>
                  <span className="text-white/90 text-sm font-medium leading-snug">{lang === 'ar' ? feature.ar : feature.en}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => router.push('/programs')}
              className="flex items-center gap-3 bg-[#25d366] text-white px-8 py-4 rounded-2xl text-base font-bold shadow-lg shadow-[#25d366]/25 hover:bg-[#20bd5a] transition-colors"
            >
              <MessageCircle size={18} />
              <span>{lang === 'ar' ? 'احصل على المتابعة الشخصية' : 'Get Personal Support'}</span>
              <Arrow size={16} />
            </button>
          </motion.div>

          {/* ── Phone Mockup (static — no per-message animations) ── */}
          <motion.div
            initial={{ opacity: 0, x: lang === 'ar' ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="relative w-72">

              {/* Phone frame */}
              <div className="bg-[#111b21] rounded-[2.5rem] border-[5px] border-[#222] shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden">

                {/* Status bar */}
                <div className="bg-[#111b21] px-6 pt-3 pb-1 flex justify-between items-center">
                  <span className="text-white/80 text-xs font-medium">9:41</span>
                  <div className="w-16 h-3 bg-[#111b21] rounded-full" />
                  <div className="flex gap-1 items-center">
                    <div className="w-4 h-2 bg-white/60 rounded-sm" />
                    <div className="w-1 h-2 bg-white/40 rounded-sm" />
                  </div>
                </div>

                {/* WhatsApp header */}
                <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3 border-b border-white/5">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#25d366] to-[#128c7e] rounded-full flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 shadow-lg">
                    FZ
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">FitZone Team</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#25d366] rounded-full" />
                      <p className="text-[#25d366] text-xs">{lang === 'ar' ? 'متاح الآن' : 'online now'}</p>
                    </div>
                  </div>
                  <MessageCircle size={16} className="text-white/30" />
                </div>

                {/* Chat area — fully static */}
                <div className="bg-[#0b141a] p-3 space-y-2.5 min-h-[300px]">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.from === 'team' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[82%] px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                        msg.from === 'team'
                          ? 'bg-[#1f2c34] text-white rounded-2xl rounded-tl-sm'
                          : 'bg-[#005c4b] text-white rounded-2xl rounded-tr-sm'
                      }`}>
                        {lang === 'ar' ? msg.ar : msg.en}
                        {msg.from === 'team' && (
                          <span className="block text-[#25d366]/60 text-[9px] mt-0.5 text-end">✓✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input bar */}
                <div className="bg-[#1f2c34] px-3 py-2.5 flex items-center gap-2 border-t border-white/5">
                  <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
                    <p className="text-white/25 text-xs">{lang === 'ar' ? 'اكتب رسالة...' : 'Message...'}</p>
                  </div>
                  <div className="w-9 h-9 bg-[#25d366] rounded-full flex items-center justify-center shadow-lg shadow-[#25d366]/30 flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
                  </div>
                </div>
              </div>

              {/* Floating badge — quick reply (static) */}
              <div className="absolute -top-5 -right-5 bg-surface border border-border rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl z-10">
                <div className="w-9 h-9 bg-[#25d366]/15 rounded-xl flex items-center justify-center text-base">
                  ⚡
                </div>
                <div>
                  <p className="text-white font-bold text-xs">{lang === 'ar' ? 'رد سريع' : 'Quick Reply'}</p>
                  <p className="text-text-muted text-[11px]">{lang === 'ar' ? 'خلال 24 ساعة' : 'Within 24h'}</p>
                </div>
              </div>

              {/* Floating badge — clients (static) */}
              <div className="absolute -bottom-5 -left-5 bg-surface border border-border rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl z-10">
                <div className="w-9 h-9 bg-brand/15 rounded-xl flex items-center justify-center text-base">
                  🏆
                </div>
                <div>
                  <p className="text-white font-bold text-xs">{lang === 'ar' ? '+1000 عميل' : '1000+ Clients'}</p>
                  <p className="text-text-muted text-[11px]">{lang === 'ar' ? 'تابعناهم بنجاح' : 'Successfully supported'}</p>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
