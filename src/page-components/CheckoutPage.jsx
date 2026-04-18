'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ArrowLeft, Lock,
  Trash2, CheckCircle, ShoppingCart, AlertCircle, ChevronDown,
  Search, Shield, User, Mail, Phone, Gift, ExternalLink
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AsYouType, isPossiblePhoneNumber } from 'libphonenumber-js'
import { useLanguage } from '../context/LanguageContext'
import { useCart, trackEvent } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import { useUser } from '../context/UserContext'
import Image from 'next/image'

// ── Country list — no manual patterns, libphonenumber-js handles all validation
const COUNTRIES = [
  { code: 'SA', flag: '🇸🇦', dial: '+966', name: 'Saudi Arabia',     nameAr: 'السعودية'         },
  { code: 'AE', flag: '🇦🇪', dial: '+971', name: 'UAE',              nameAr: 'الإمارات'         },
  { code: 'KW', flag: '🇰🇼', dial: '+965', name: 'Kuwait',           nameAr: 'الكويت'           },
  { code: 'QA', flag: '🇶🇦', dial: '+974', name: 'Qatar',            nameAr: 'قطر'              },
  { code: 'BH', flag: '🇧🇭', dial: '+973', name: 'Bahrain',          nameAr: 'البحرين'          },
  { code: 'OM', flag: '🇴🇲', dial: '+968', name: 'Oman',             nameAr: 'عُمان'            },
  { code: 'JO', flag: '🇯🇴', dial: '+962', name: 'Jordan',           nameAr: 'الأردن'           },
  { code: 'EG', flag: '🇪🇬', dial: '+20',  name: 'Egypt',            nameAr: 'مصر'              },
  { code: 'LB', flag: '🇱🇧', dial: '+961', name: 'Lebanon',          nameAr: 'لبنان'            },
  { code: 'IQ', flag: '🇮🇶', dial: '+964', name: 'Iraq',             nameAr: 'العراق'           },
  { code: 'SY', flag: '🇸🇾', dial: '+963', name: 'Syria',            nameAr: 'سوريا'            },
  { code: 'PS', flag: '🇵🇸', dial: '+970', name: 'Palestine',        nameAr: 'فلسطين'           },
  { code: 'YE', flag: '🇾🇪', dial: '+967', name: 'Yemen',            nameAr: 'اليمن'            },
  { code: 'LY', flag: '🇱🇾', dial: '+218', name: 'Libya',            nameAr: 'ليبيا'            },
  { code: 'TN', flag: '🇹🇳', dial: '+216', name: 'Tunisia',          nameAr: 'تونس'             },
  { code: 'DZ', flag: '🇩🇿', dial: '+213', name: 'Algeria',          nameAr: 'الجزائر'          },
  { code: 'MA', flag: '🇲🇦', dial: '+212', name: 'Morocco',          nameAr: 'المغرب'           },
  { code: 'TR', flag: '🇹🇷', dial: '+90',  name: 'Turkey',           nameAr: 'تركيا'            },
  { code: 'GB', flag: '🇬🇧', dial: '+44',  name: 'United Kingdom',   nameAr: 'المملكة المتحدة'  },
  { code: 'US', flag: '🇺🇸', dial: '+1',   name: 'United States',    nameAr: 'الولايات المتحدة' },
  { code: 'CA', flag: '🇨🇦', dial: '+1',   name: 'Canada',           nameAr: 'كندا'             },
  { code: 'AU', flag: '🇦🇺', dial: '+61',  name: 'Australia',        nameAr: 'أستراليا'         },
  { code: 'FR', flag: '🇫🇷', dial: '+33',  name: 'France',           nameAr: 'فرنسا'            },
  { code: 'DE', flag: '🇩🇪', dial: '+49',  name: 'Germany',          nameAr: 'ألمانيا'          },
  { code: 'IT', flag: '🇮🇹', dial: '+39',  name: 'Italy',            nameAr: 'إيطاليا'          },
  { code: 'ES', flag: '🇪🇸', dial: '+34',  name: 'Spain',            nameAr: 'إسبانيا'          },
  { code: 'NL', flag: '🇳🇱', dial: '+31',  name: 'Netherlands',      nameAr: 'هولندا'           },
  { code: 'BE', flag: '🇧🇪', dial: '+32',  name: 'Belgium',          nameAr: 'بلجيكا'           },
  { code: 'SE', flag: '🇸🇪', dial: '+46',  name: 'Sweden',           nameAr: 'السويد'           },
  { code: 'NO', flag: '🇳🇴', dial: '+47',  name: 'Norway',           nameAr: 'النرويج'          },
  { code: 'DK', flag: '🇩🇰', dial: '+45',  name: 'Denmark',          nameAr: 'الدنمارك'         },
  { code: 'CH', flag: '🇨🇭', dial: '+41',  name: 'Switzerland',      nameAr: 'سويسرا'           },
  { code: 'AT', flag: '🇦🇹', dial: '+43',  name: 'Austria',          nameAr: 'النمسا'           },
  { code: 'PL', flag: '🇵🇱', dial: '+48',  name: 'Poland',           nameAr: 'بولندا'           },
  { code: 'PT', flag: '🇵🇹', dial: '+351', name: 'Portugal',         nameAr: 'البرتغال'         },
  { code: 'GR', flag: '🇬🇷', dial: '+30',  name: 'Greece',           nameAr: 'اليونان'          },
]

const PLACEHOLDERS = { SA: '05X XXX XXXX', AE: '05X XXX XXXX', KW: 'XXXX XXXX', QA: 'XXXX XXXX', BH: 'XXXX XXXX', OM: '9XXX XXXX', JO: '7XXX XXXX', EG: '0XX XXXX XXXX', LB: 'XX XXX XXX', IQ: '7XX XXX XXXX', SY: '9XX XXX XXX', PS: '5X XXX XXXX', YE: '7XX XXX XXX', LY: '09XX XXXXXX', TN: 'XX XXX XXX', DZ: '0XX XX XX XX', MA: '06XX XXXXXX', TR: '5XX XXX XX XX', GB: '07XXX XXXXXX', US: '(XXX) XXX-XXXX', CA: '(XXX) XXX-XXXX', AU: '04XX XXX XXX', FR: '06 XX XX XX XX', DE: '01XX XXXXXXX', IT: '3XX XXX XXXX', ES: '6XX XXX XXX', NL: '06 XXXXXXXX', BE: '04XX XX XX XX', SE: '07X XXX XX XX', NO: 'XXX XX XXX', DK: 'XX XX XX XX', CH: '07X XXX XX XX', AT: '06XX XXXXXX', PL: 'XXX XXX XXX', PT: '9XX XXX XXX', GR: '6XX XXX XXXX' }

function getPlaceholder(countryCode) {
  return PLACEHOLDERS[countryCode] || 'XXXXXXXX'
}

function validatePhone(nationalNumber, countryCode) {
  if (!nationalNumber.trim()) return false
  const digits = nationalNumber.replace(/\D/g, '')
  if (digits.length < 5) return false
  try {
    const full = `${COUNTRIES.find(c => c.code === countryCode)?.dial}${digits}`
    return isPossiblePhoneNumber(full, countryCode)
  } catch { return false }
}

function formatAsYouType(value, countryCode) {
  try {
    const digits = value.replace(/\D/g, '')
    const formatter = new AsYouType(countryCode)
    let result = ''
    for (const d of digits) result = formatter.input(d)
    return result
  } catch { return value }
}

function getMaxLen(countryCode) {
  return 15
}

// ── Country Picker ────────────────────────────────────────────────────────────
function CountryPicker({ selected, onChange, lang }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef()

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.nameAr.includes(query) || c.dial.includes(query)
  )

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Trigger button: flag + country name + dial code + chevron */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 h-full px-3 py-3.5 hover:bg-white/[0.05] transition-colors rounded-l-2xl"
      >
        <span className="text-xl leading-none">{selected.flag}</span>
        <div className="flex flex-col items-start leading-none">
          <span className="text-white/80 text-xs font-medium">{lang === 'ar' ? selected.nameAr : selected.name}</span>
          <span className="text-white/35 text-xs font-mono mt-0.5">{selected.dial}</span>
        </div>
        <ChevronDown size={12} className={`text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-72 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl z-[200] overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-white/[0.06]">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={lang === 'ar' ? 'ابحث عن دولة…' : 'Search country…'}
                  className="w-full bg-white/5 rounded-xl pl-8 pr-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-brand/40"
                />
              </div>
            </div>
            {/* List */}
            <div className="max-h-56 overflow-y-auto">
              {filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c); setOpen(false); setQuery('') }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left ${selected.code === c.code ? 'bg-brand/10' : ''}`}
                >
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="flex-1 text-white/80 text-sm">{lang === 'ar' ? c.nameAr : c.name}</span>
                  <span className="text-white/30 text-xs font-mono">{c.dial}</span>
                  {selected.code === c.code && <CheckCircle size={13} className="text-brand/70 shrink-0" />}
                </button>
              ))}
              {!filtered.length && (
                <p className="text-white/30 text-sm text-center py-5">
                  {lang === 'ar' ? 'لا نتائج' : 'No results'}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Floating Label Input ──────────────────────────────────────────────────────
function FloatingInput({ label, icon: Icon, error, touched, children, hint }) {
  return (
    <div className="space-y-1.5">
      <div className={`relative rounded-2xl border transition-all duration-200 bg-white/[0.03] overflow-hidden ${
        touched && error   ? 'border-red-500/60 ring-1 ring-red-500/20' :
        touched && !error  ? 'border-emerald-500/40 ring-1 ring-emerald-500/10' :
                             'border-white/10 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/15'
      }`}>
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Icon size={16} className={touched && error ? 'text-red-400/60' : touched && !error ? 'text-emerald-400/60' : 'text-white/25'} />
          </div>
        )}
        <div className={Icon ? 'pl-11' : ''}>{children}</div>
        {touched && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CheckCircle size={15} className="text-emerald-400/70" />
          </div>
        )}
        {touched && error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <AlertCircle size={15} className="text-red-400/70" />
          </div>
        )}
      </div>
      {touched && error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs flex items-center gap-1.5 pl-1">
          <AlertCircle size={11} />{error}
        </motion.p>
      )}
      {hint && !error && <p className="text-white/25 text-xs pl-1">{hint}</p>}
    </div>
  )
}

// ── Phone Field ──────────────────────────────────────────────────────────────
function PhoneField({ selectedCountry, onCountryChange, value, onChange, onBlur, error, touched, lang }) {
  const digits      = value.replace(/\D/g, '')
  const maxLen      = getMaxLen(selectedCountry.code)
  const placeholder = getPlaceholder(selectedCountry.code)
  const progress    = Math.min(digits.length / maxLen, 1)
  const isValid     = touched && !error && value
  const isError     = touched && !!error
  const isPossible  = digits.length > 2 && (() => {
    try { return isPossiblePhoneNumber(`${selectedCountry.dial}${digits}`, selectedCountry.code) } catch { return false }
  })()

  const borderCls = isError    ? 'border-red-500/50 ring-1 ring-red-500/15'
                  : isValid    ? 'border-emerald-500/40 ring-1 ring-emerald-500/10'
                  : isPossible ? 'border-brand/40'
                               : 'border-white/10 focus-within:border-brand/40 focus-within:ring-1 focus-within:ring-brand/10'

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <label className="text-white/40 text-xs font-medium flex items-center gap-1.5 px-0.5">
        <Phone size={11} />
        {lang === 'ar' ? 'رقم الهاتف (واتساب)' : 'Phone Number (WhatsApp)'}
      </label>

      {/* Single row: [country picker] | [number input] */}
      <div className={`relative flex items-stretch rounded-2xl border transition-all duration-200 bg-white/[0.03] ${borderCls}`}>

        {/* Left: country picker — flag + dial code + chevron */}
        <CountryPicker selected={selectedCountry} onChange={onCountryChange} lang={lang} />

        {/* Vertical divider */}
        <div className="w-px bg-white/[0.08] self-stretch" />

        {/* Right: number input */}
        <div className="relative flex-1">
          <input
            type="tel"
            name="phone"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={maxLen}
            dir="ltr"
            className="w-full h-full bg-transparent px-4 py-3.5 text-white text-sm font-mono tracking-wider placeholder:text-white/20 focus:outline-none pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {isValid && <CheckCircle size={14} className="text-emerald-400/80" />}
            {isError && <AlertCircle size={14} className="text-red-400/80" />}
          </div>
        </div>

        {/* Progress bar along the bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl overflow-hidden">
          <motion.div
            className={`h-full ${isError ? 'bg-red-500/50' : isValid ? 'bg-emerald-500/50' : 'bg-brand/50'}`}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {isError && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-red-400 text-xs flex items-center gap-1.5 px-0.5">
            <AlertCircle size={11} />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const { formatPriceFor, formatAmount, priceFor, countryCode, currencyCode } = useCurrency()
  const { cart, removeFromCart, clearCart, addToCart, getMissingBook, wasAutoUpgraded, BOOKS_DATA } = useCart()
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [redirecting,     setRedirecting]     = useState(false)

  useEffect(() => {
    if (!countryCode) return
    const match = COUNTRIES.find(c => c.code === countryCode)
    if (match) { setSelectedCountry(match); setFormData(p => ({ ...p, phone: '' })) }
  }, [countryCode])
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [errors,   setErrors]   = useState({})
  const [touched,  setTouched]  = useState({})
  const [agreed,   setAgreed]   = useState(false)
  const { user } = useUser()

  useEffect(() => {
    if (user && !formData.name && !formData.email) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || prev.phone,
      }))
    }
  }, [user])

  // Total in the visitor's currency, using Stripe's currency_options for each item.
  const finalTotal = cart.reduce((sum, id) => {
    const p = priceFor(id)
    return sum + (p ? p.amount : 0)
  }, 0)

  const handleInput = (e) => {
    const { name, value } = e.target
    let v = value
    if (name === 'phone') v = formatAsYouType(value, selectedCountry.code).slice(0, getMaxLen(selectedCountry.code))
    setFormData(p => ({ ...p, [name]: v }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const validateField = (name, value) => {
    const req = lang === 'ar' ? 'مطلوب' : 'Required'
    let err = ''
    switch (name) {
      case 'name':       if (!value.trim()) err = req; else if (value.trim().length < 3) err = lang === 'ar' ? 'الاسم قصير جداً' : 'Too short'; break
      case 'email':      if (!value.trim()) err = req; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) err = lang === 'ar' ? 'بريد غير صالح' : 'Invalid email'; break
      case 'phone':      if (!value.trim()) err = req; else if (!validatePhone(value, selectedCountry.code)) err = lang === 'ar' ? `رقم غير صالح — مثال: ${getPlaceholder(selectedCountry.code)}` : `Invalid number — e.g. ${getPlaceholder(selectedCountry.code)}`; break
    }
    setErrors(p => ({ ...p, [name]: err }))
    return err === ''
  }

  const handleBlur = (name) => { setTouched(p => ({ ...p, [name]: true })); validateField(name, formData[name]) }

  const validateAll = () => {
    const fields = ['name', 'email', 'phone']
    fields.forEach(f => setTouched(p => ({ ...p, [f]: true })))
    return fields.every(f => validateField(f, formData[f]))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateAll()) return
    if (!agreed) { setErrors(p => ({ ...p, terms: lang === 'ar' ? 'يجب الموافقة على الشروط' : 'Please agree to terms' })); return }

    setRedirecting(true)
    try {
      const phoneDigits = formData.phone.replace(/\D/g, '')
      const dial = selectedCountry.dial
      const fullPhone = `${dial}${phoneDigits}`

      const res = await fetch('/api/checkout/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          email: formData.email,
          phone: fullPhone,
          name: formData.name,
          lang,
          currency: currencyCode,
        }),
      })

      const data = await res.json()
      if (data.error) {
        setRedirecting(false)
        alert(data.error)
        return
      }
      window.location.href = data.url
    } catch (err) {
      setRedirecting(false)
      alert(lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, please try again')
    }
  }

  const inputCls = "w-full bg-transparent px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none"

  if (cart.length === 0) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={30} className="text-white/30" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">{lang === 'ar' ? 'سلة التسوق فارغة' : 'Cart is Empty'}</h1>
        <p className="text-white/40 mb-8 text-sm">{lang === 'ar' ? 'أضف بعض البرامج للبدء' : 'Add some programs to get started'}</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/programs')}
          className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-2xl font-semibold text-sm">
          <ShoppingCart size={16} />{lang === 'ar' ? 'تصفح البرامج' : 'Browse Programs'}<Arrow size={16} />
        </motion.button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <button onClick={() => router.push('/programs')}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm mb-5 group px-4 py-2 rounded-full border border-white/10 bg-white/[0.03]">
            <ArrowLeft size={15} className={`transition-transform group-hover:-translate-x-0.5 ${lang === 'en' ? 'rotate-180' : ''}`} />
            {lang === 'ar' ? 'العودة للبرامج' : 'Back to Programs'}
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl px-6 py-6 shadow-[0_10px_40px_rgba(0,0,0,0.22)]">
            <div>
              <p className="text-brand text-xs font-semibold tracking-widest uppercase mb-1">{lang === 'ar' ? 'إتمام الشراء' : 'Checkout'}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{lang === 'ar' ? 'أكمل طلبك' : 'Complete Your Order'}</h1>
              <p className="text-white/35 text-sm mt-2 max-w-xl">
                {lang === 'ar'
                  ? 'أدخل معلوماتك وسيتم تحويلك مباشرة إلى صفحة Stripe الآمنة لإتمام الدفع.'
                  : 'Enter your details and continue to Stripe to complete your payment securely.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                lang === 'ar' ? 'Stripe آمن' : 'Secure Stripe',
                lang === 'ar' ? 'تسليم فوري' : 'Instant delivery',
                'SSL',
              ].map(item => (
                <div key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3.5 py-2 text-white/55">
                  <Shield size={12} className="text-emerald-400/70" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">

          {/* ── Left: Form (3/5) ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Contact Info */}
            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-full bg-brand/15 border border-brand/20 flex items-center justify-center">
                  <User size={13} className="text-brand" />
                </div>
                <h2 className="text-white font-semibold text-sm">{lang === 'ar' ? 'معلومات التواصل' : 'Contact Information'}</h2>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <FloatingInput label={lang === 'ar' ? 'الاسم الكامل' : 'Full Name'} icon={User}
                  error={errors.name} touched={touched.name}>
                  <input type="text" name="name" value={formData.name} onChange={handleInput} onBlur={() => handleBlur('name')}
                    placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full name'}
                    className={inputCls} />
                </FloatingInput>

                {/* Email */}
                <FloatingInput label="Email" icon={Mail} error={errors.email} touched={touched.email}>
                  <input type="email" name="email" value={formData.email} onChange={handleInput} onBlur={() => handleBlur('email')}
                    placeholder="email@example.com"
                    className={inputCls} />
                </FloatingInput>

                {/* Phone */}
                <PhoneField
                  selectedCountry={selectedCountry}
                  onCountryChange={c => { setSelectedCountry(c); setFormData(p => ({ ...p, phone: '' })); setErrors(p => ({ ...p, phone: '' })); setTouched(p => ({ ...p, phone: false })) }}
                  value={formData.phone}
                  onChange={handleInput}
                  onBlur={() => handleBlur('phone')}
                  error={errors.phone}
                  touched={touched.phone}
                  lang={lang}
                />
              </div>
            </div>

            {/* Terms + Submit */}
            <div className="space-y-4">
              {/* Terms */}
              <button type="button" onClick={() => { setAgreed(p => !p); setErrors(p => ({ ...p, terms: '' })) }}
                className={`w-full flex items-center gap-3 p-4 rounded-[26px] border transition-all backdrop-blur-xl ${
                  agreed ? 'bg-emerald-500/8 border-emerald-500/25' : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                  agreed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                }`}>
                  {agreed && <CheckCircle size={12} className="text-white" />}
                </div>
                <p className="text-white/50 text-xs text-left leading-6">
                  {lang === 'ar'
                    ? <span>أوافق على <a href="/terms" target="_blank" onClick={e => e.stopPropagation()} className="text-brand hover:underline">الشروط والأحكام</a> و<a href="/refund" target="_blank" onClick={e => e.stopPropagation()} className="text-brand hover:underline">سياسة الاسترداد</a></span>
                    : <span>I agree to the <a href="/terms" target="_blank" onClick={e => e.stopPropagation()} className="text-brand hover:underline">Terms & Conditions</a> and <a href="/refund" target="_blank" onClick={e => e.stopPropagation()} className="text-brand hover:underline">Refund Policy</a></span>
                  }
                </p>
              </button>
              {errors.terms && <p className="text-red-400 text-xs flex items-center gap-1.5 pl-1"><AlertCircle size={11} />{errors.terms}</p>}

              {/* Pay Button */}
              <motion.button type="button" onClick={handleSubmit} disabled={redirecting}
                whileHover={{ scale: redirecting ? 1 : 1.01 }} whileTap={{ scale: redirecting ? 1 : 0.99 }}
                className="w-full relative overflow-hidden bg-gradient-to-r from-brand to-brand-dark text-white py-4 rounded-[26px] font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-brand/20 disabled:opacity-60">
                <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
                {redirecting
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{lang === 'ar' ? 'جاري التحويل…' : 'Redirecting…'}</>
                  : <><Lock size={16} />{lang === 'ar' ? `ادفع الآن ${formatAmount(finalTotal, lang)}` : `Pay Now ${formatAmount(finalTotal, lang)}`}</>
                }
              </motion.button>

              {/* Trust row */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {[
                  lang === 'ar' ? 'Stripe محمي' : 'Protected by Stripe',
                  '256-bit SSL',
                  lang === 'ar' ? 'دعم فوري' : 'Fast support',
                ].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-white/35 text-xs rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                    <Shield size={10} />{t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Order Summary (2/5) ── */}
          <div className="lg:col-span-2">
            <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-5 sticky top-28 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
              <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {cart.map(bookId => {
                  const book = BOOKS_DATA[bookId]; if (!book) return null
                  return (
                    <div key={bookId} className="flex items-center gap-3 p-3 rounded-[24px] bg-black/20 border border-white/10 group backdrop-blur-sm">
                      <span className="text-2xl shrink-0">{book.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{lang === 'ar' ? book.titleAr : book.titleEn}</p>
                        <p className="text-brand text-sm font-bold">{formatPriceFor(bookId, lang)}</p>
                      </div>
                      <button onClick={() => removeFromCart(bookId)}
                        className="w-7 h-7 rounded-lg bg-red-500/0 group-hover:bg-red-500/10 text-white/20 group-hover:text-red-400 flex items-center justify-center transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Upsell — suggest missing book + bundle upgrade */}
              {(() => {
                const missingBook = getMissingBook()
                const missingBookData = missingBook ? BOOKS_DATA[missingBook] : null
                return (
                  <>
                    {missingBookData && !cart.includes('bundle') && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-[26px] overflow-hidden border border-[#25d366]/30 bg-[#25d366]/5 mb-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#25d366]/10 border-b border-[#25d366]/20">
                          <Gift size={13} className="text-[#25d366] flex-shrink-0" />
                          <span className="text-[#25d366] text-xs font-bold">
                            {lang === 'ar' ? '🎁 أضف البرنامج الثاني واحصل على متابعة واتساب شهر كامل!' : '🎁 Add the 2nd program & get 1 month WhatsApp support!'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-4">
                          <div className="relative w-10 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                            <Image src={missingBookData.image} alt="" fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold leading-snug">
                              {lang === 'ar' ? missingBookData.titleAr : missingBookData.titleEn}
                            </p>
                            <p className="text-[#25d366] text-xs font-semibold mt-0.5">
                              {lang === 'ar' ? '+ متابعة واتساب شهر كامل مع الباقة' : '+ 1 month WhatsApp support with bundle'}
                            </p>
                          </div>
                          <motion.button whileTap={{ scale: 0.96 }} onClick={() => addToCart(missingBook)}
                            className="flex-shrink-0 bg-[#25d366] text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-green-500 transition-colors whitespace-nowrap">
                            {lang === 'ar' ? 'أضف الآن' : 'Add Now'}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                    {wasAutoUpgraded && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 rounded-[26px] bg-[#25d366]/10 border border-[#25d366]/30 px-4 py-3 mb-4 backdrop-blur-sm">
                        <div className="w-8 h-8 bg-[#25d366]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Gift size={16} className="text-[#25d366]" />
                        </div>
                        <div>
                          <p className="text-[#25d366] text-sm font-bold">
                            {lang === 'ar' ? '🎉 تمت الترقية للباقة الكاملة!' : '🎉 Upgraded to the Complete Bundle!'}
                          </p>
                          <p className="text-white/30 text-xs mt-0.5">
                            {lang === 'ar' ? 'وفّرت مقارنةً بالشراء المنفرد' : 'You saved vs buying separately'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </>
                )
              })()}

              {/* Divider */}
              <div className="border-t border-white/8 pt-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">{lang === 'ar' ? 'المجموع' : 'Subtotal'}</span>
                  <span className="text-white text-sm">{formatAmount(finalTotal, lang)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-white/50 text-sm">{lang === 'ar' ? 'الضريبة' : 'Tax'}</span>
                  <span className="text-emerald-400 text-sm text-xs">{lang === 'ar' ? 'مشمولة' : 'Included'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-white/10">
                <span className="text-white font-bold">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span className="text-brand text-xl font-bold">{formatAmount(finalTotal, lang)}</span>
              </div>

              {/* Security badge */}
              <div className="mt-4 flex items-center justify-center gap-2 py-3 rounded-full bg-emerald-500/5 border border-emerald-500/15">
                <Shield size={13} className="text-emerald-400/70" />
                <span className="text-emerald-400/70 text-xs">{lang === 'ar' ? 'مدفوعات مشفرة وآمنة 100%' : '100% Secure & Encrypted'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
