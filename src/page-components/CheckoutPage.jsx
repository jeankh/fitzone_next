'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, ArrowLeft, CreditCard, Smartphone, Building2, Lock,
  Trash2, CheckCircle, ShoppingCart, AlertCircle, ChevronDown,
  Search, Shield, Zap, User, Mail, Phone, Tag, Gift
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AsYouType, isValidPhoneNumber, isPossiblePhoneNumber, getExampleNumber, parsePhoneNumber } from 'libphonenumber-js'
import examples from 'libphonenumber-js/mobile/examples'
import { useLanguage } from '../context/LanguageContext'
import { useCart, trackEvent } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'

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

// Get the example national number for a country (used as placeholder)
function getPlaceholder(countryCode) {
  try {
    const ex = getExampleNumber(countryCode, examples)
    return ex ? ex.formatNational() : ''
  } catch { return '' }
}

// Validate phone — uses isPossiblePhoneNumber (length-based, more lenient)
// isValidPhoneNumber is too strict and rejects valid real numbers
function validatePhone(nationalNumber, countryCode) {
  if (!nationalNumber.trim()) return false
  const digits = nationalNumber.replace(/\D/g, '')
  if (digits.length < 5) return false
  try {
    const full = `${COUNTRIES.find(c => c.code === countryCode)?.dial}${digits}`
    return isPossiblePhoneNumber(full, countryCode)
  } catch { return false }
}

// Format as user types using AsYouType
function formatAsYouType(value, countryCode) {
  try {
    const digits = value.replace(/\D/g, '')
    const formatter = new AsYouType(countryCode)
    // Feed digits one by one to get proper national formatting
    let result = ''
    for (const d of digits) result = formatter.input(d)
    return result
  } catch { return value }
}

// Get max digit length for a country from example number
function getMaxLen(countryCode) {
  try {
    const ex = getExampleNumber(countryCode, examples)
    return ex ? ex.nationalNumber.length + 4 : 15 // +4 for spaces/dashes
  } catch { return 15 }
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

// ── Card Brand Detector ───────────────────────────────────────────────────────
function detectCardBrand(num) {
  const n = num.replace(/\s/g, '')
  if (/^4/.test(n))           return { name: 'Visa',       color: '#1a1f71', pattern: '✦ ✦✦✦✦ ✦✦✦✦ ' }
  if (/^5[1-5]/.test(n))      return { name: 'Mastercard', color: '#252525', pattern: '✦ ✦✦✦✦ ✦✦✦✦ ' }
  if (/^3[47]/.test(n))       return { name: 'Amex',       color: '#007b5e', pattern: '✦ ✦✦✦✦✦✦ ' }
  return null
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

// ── Validation helpers ────────────────────────────────────────────────────────
const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
const validateCardNumber = (num) => {
  const d = num.replace(/\s/g, '')
  if (d.length !== 16 || !/^\d+$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < d.length; i++) {
    let n = parseInt(d[d.length - 1 - i])
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9 }
    sum += n
  }
  return sum % 10 === 0
}
const validateExpiry = (exp) => {
  const m = exp.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)
  if (!m) return false
  return new Date(parseInt('20' + m[2]), parseInt(m[1])) > new Date()
}
const validateCVV = (cvv) => /^\d{3,4}$/.test(cvv)
const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
const formatExpiry = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? d.slice(0,2)+'/'+d.slice(2) : d }
const formatCVV = (v) => v.replace(/\D/g, '').slice(0, 4)

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
  const { formatPrice, countryCode } = useCurrency()
  const { cart, removeFromCart, clearCart, addToCart, getTotal, getMissingBook, wasAutoUpgraded, BOOKS_DATA } = useCart()
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  const [paymentMethod,   setPaymentMethod]   = useState('card')
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [bankDetails,     setBankDetails]     = useState(null)

  useEffect(() => {
    fetch('/api/admin/bank').then(r => r.json()).then(setBankDetails).catch(() => {})
  }, [])

  useEffect(() => {
    if (!countryCode) return
    const match = COUNTRIES.find(c => c.code === countryCode)
    if (match) { setSelectedCountry(match); setFormData(p => ({ ...p, phone: '' })) }
  }, [countryCode])
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', cardNumber: '', expiry: '', cvv: '' })
  const [errors,   setErrors]   = useState({})
  const [touched,  setTouched]  = useState({})
  const [agreed,   setAgreed]   = useState(false)
  const [coupon,   setCoupon]   = useState('')
  const [couponErr,setCouponErr]= useState('')
  const [processing,setProcessing]=useState(false)
  const [success,  setSuccess]  = useState(false)
  const [confirm,  setConfirm]  = useState(false)
  const [showCVV,  setShowCVV]  = useState(false)

  const cardBrand = detectCardBrand(formData.cardNumber)
  const finalTotal = getTotal()

  const handleInput = (e) => {
    const { name, value } = e.target
    let v = value
    if (name === 'cardNumber') v = formatCardNumber(value)
    else if (name === 'expiry') v = formatExpiry(value)
    else if (name === 'phone') v = formatAsYouType(value, selectedCountry.code).slice(0, getMaxLen(selectedCountry.code))
    else if (name === 'cvv') v = formatCVV(value)
    setFormData(p => ({ ...p, [name]: v }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const validateField = (name, value) => {
    const req = lang === 'ar' ? 'مطلوب' : 'Required'
    let err = ''
    switch (name) {
      case 'name':       if (!value.trim()) err = req; else if (value.trim().length < 3) err = lang === 'ar' ? 'الاسم قصير جداً' : 'Too short'; break
      case 'email':      if (!value.trim()) err = req; else if (!validateEmail(value)) err = lang === 'ar' ? 'بريد غير صالح' : 'Invalid email'; break
      case 'phone':      if (!value.trim()) err = req; else if (!validatePhone(value, selectedCountry.code)) err = lang === 'ar' ? `رقم غير صالح — مثال: ${getPlaceholder(selectedCountry.code)}` : `Invalid number — e.g. ${getPlaceholder(selectedCountry.code)}`; break
      case 'cardNumber': if (paymentMethod !== 'card') break; if (!value.trim()) err = req; else if (!validateCardNumber(value)) err = lang === 'ar' ? 'رقم بطاقة غير صالح' : 'Invalid card'; break
      case 'expiry':     if (paymentMethod !== 'card') break; if (!value.trim()) err = req; else if (!validateExpiry(value)) err = lang === 'ar' ? 'تاريخ منتهي' : 'Expired or invalid'; break
      case 'cvv':        if (paymentMethod !== 'card') break; if (!value.trim()) err = req; else if (!validateCVV(value)) err = lang === 'ar' ? 'CVV غير صالح' : 'Invalid CVV'; break
    }
    setErrors(p => ({ ...p, [name]: err }))
    return err === ''
  }

  const handleBlur = (name) => { setTouched(p => ({ ...p, [name]: true })); validateField(name, formData[name]) }

  const validateAll = () => {
    const fields = ['name', 'email', 'phone', ...(paymentMethod === 'card' ? ['cardNumber', 'expiry', 'cvv'] : [])]
    fields.forEach(f => setTouched(p => ({ ...p, [f]: true })))
    return fields.every(f => validateField(f, formData[f]))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateAll()) return
    if (!agreed) { setErrors(p => ({ ...p, terms: lang === 'ar' ? 'يجب الموافقة على الشروط' : 'Please agree to terms' })); return }
    setConfirm(true)
  }

  const handleConfirm = async () => {
    setConfirm(false); setProcessing(true)
    await new Promise(r => setTimeout(r, 2500))
    setProcessing(false); setSuccess(true)
    trackEvent('purchases')
    if (typeof window.gtag === 'function') window.gtag('event', 'purchase', { value: finalTotal, currency: 'SAR' })
    clearCart()
  }

  const inputCls = "w-full bg-transparent px-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none"

  // ── Empty Cart ──
  if (cart.length === 0 && !success) return (
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

  // ── Success ──
  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={44} className="text-emerald-400" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 className="text-3xl font-bold text-white mb-3">{lang === 'ar' ? 'تم الشراء بنجاح! 🎉' : 'Purchase Successful! 🎉'}</h1>
          <p className="text-white/50 mb-8 leading-relaxed text-sm">
            {lang === 'ar' ? 'سيتم إرسال برامجك إلى بريدك الإلكتروني خلال دقائق. تحقق أيضاً من رسائل الواتساب.' : 'Your programs will be sent to your email within minutes. Also check your WhatsApp.'}
          </p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 bg-brand text-white px-8 py-3.5 rounded-2xl font-semibold">
            {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <button onClick={() => router.push('/programs')}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm mb-5 group">
            <ArrowLeft size={15} className={`transition-transform group-hover:-translate-x-0.5 ${lang === 'en' ? 'rotate-180' : ''}`} />
            {lang === 'ar' ? 'العودة للبرامج' : 'Back to Programs'}
          </button>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-brand text-xs font-semibold tracking-widest uppercase mb-1">{lang === 'ar' ? 'إتمام الشراء' : 'Checkout'}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{lang === 'ar' ? 'أكمل طلبك' : 'Complete Your Order'}</h1>
            </div>
            <div className="flex items-center gap-1.5 text-white/30 text-xs">
              <Shield size={13} className="text-emerald-400/70" />
              <span className="text-emerald-400/70">{lang === 'ar' ? 'دفع آمن' : 'Secure checkout'}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── Left: Form (3/5) ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Contact Info */}
            <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-xl bg-brand/15 flex items-center justify-center">
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

            {/* Payment Method */}
            <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-xl bg-brand/15 flex items-center justify-center">
                  <CreditCard size={13} className="text-brand" />
                </div>
                <h2 className="text-white font-semibold text-sm">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</h2>
              </div>

              {/* Method Tabs */}
              <div className="flex gap-2 mb-5 p-1 bg-black/30 rounded-2xl">
                {[
                  { id: 'card',  icon: CreditCard,  label: { ar: 'بطاقة', en: 'Card' } },
                  { id: 'apple', icon: Smartphone,   label: { ar: 'Apple Pay', en: 'Apple Pay' } },
                  { id: 'bank',  icon: Building2,    label: { ar: 'تحويل', en: 'Bank' } },
                ].map(m => (
                  <button key={m.id} type="button"
                    onClick={() => { setPaymentMethod(m.id); setErrors(p => ({ ...p, cardNumber: '', expiry: '', cvv: '' })) }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      paymentMethod === m.id
                        ? 'bg-brand text-white shadow-lg shadow-brand/25'
                        : 'text-white/40 hover:text-white/70'
                    }`}>
                    <m.icon size={15} />{m.label[lang]}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* Card Form */}
                {paymentMethod === 'card' && (
                  <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }} className="space-y-4">

                    {/* Visual Card Widget */}
                    <div className="relative h-36 rounded-2xl overflow-hidden mb-5"
                      style={{ background: cardBrand ? `linear-gradient(135deg, ${cardBrand.color}, #0d0d0d)` : 'linear-gradient(135deg, #1a1a2e, #0d0d0d)' }}>
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }} />
                      <div className="absolute top-4 left-5 right-5 flex items-center justify-between">
                        <div className="w-8 h-6 bg-yellow-400/80 rounded-md" />
                        {cardBrand && <span className="text-white/60 text-xs font-semibold tracking-widest uppercase">{cardBrand.name}</span>}
                      </div>
                      <div className="absolute bottom-4 left-5 right-5">
                        <p className="text-white/60 font-mono text-base tracking-[0.2em] mb-1">
                          {formData.cardNumber || '•••• •••• •••• ••••'}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-white/40 text-xs font-mono">{formData.expiry || 'MM/YY'}</p>
                          <p className="text-white/40 text-xs">{formData.name || (lang === 'ar' ? 'اسم حامل البطاقة' : 'CARD HOLDER')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Number */}
                    <FloatingInput icon={CreditCard} error={errors.cardNumber} touched={touched.cardNumber}
                      hint={cardBrand ? cardBrand.name : undefined}>
                      <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleInput} onBlur={() => handleBlur('cardNumber')}
                        placeholder="1234 5678 9012 3456" maxLength={19} dir="ltr"
                        className={inputCls} />
                    </FloatingInput>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Expiry */}
                      <FloatingInput error={errors.expiry} touched={touched.expiry}>
                        <input type="text" name="expiry" value={formData.expiry} onChange={handleInput} onBlur={() => handleBlur('expiry')}
                          placeholder="MM / YY" maxLength={5} dir="ltr"
                          className={inputCls} />
                      </FloatingInput>

                      {/* CVV */}
                      <FloatingInput error={errors.cvv} touched={touched.cvv}>
                        <div className="relative">
                          <input type={showCVV ? 'text' : 'password'} name="cvv" value={formData.cvv} onChange={handleInput} onBlur={() => handleBlur('cvv')}
                            placeholder="CVV" maxLength={4} dir="ltr"
                            className={inputCls + ' pr-10'} />
                          <button type="button" onClick={() => setShowCVV(p => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors text-xs">
                            {showCVV ? '👁' : '🔒'}
                          </button>
                        </div>
                      </FloatingInput>
                    </div>
                  </motion.div>
                )}

                {/* Apple Pay */}
                {paymentMethod === 'apple' && (
                  <motion.div key="apple" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">🍎</span>
                    </div>
                    <p className="text-white/50 text-sm text-center">
                      {lang === 'ar' ? 'سيتم توجيهك إلى Apple Pay لإتمام الدفع بأمان' : "You'll be redirected to Apple Pay to complete payment securely"}
                    </p>
                  </motion.div>
                )}

                {/* Bank Transfer */}
                {paymentMethod === 'bank' && (
                  <motion.div key="bank" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl bg-black/30 border border-white/8 p-4 space-y-3">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">{lang === 'ar' ? 'معلومات الحساب البنكي' : 'Bank Account Details'}</p>
                    {[
                      { label: lang === 'ar' ? 'البنك' : 'Bank',      value: lang === 'ar' ? (bankDetails?.bankName_ar || '—') : (bankDetails?.bankName_en || '—') },
                      { label: lang === 'ar' ? 'رقم الحساب' : 'IBAN', value: bankDetails?.iban || '—', mono: true },
                      { label: lang === 'ar' ? 'الاسم' : 'Name',      value: lang === 'ar' ? (bankDetails?.beneficiaryName_ar || '—') : (bankDetails?.beneficiaryName_en || '—') },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-white/30 text-sm">{row.label}</span>
                        <span className={`text-white text-sm ${row.mono ? 'font-mono' : 'font-medium'}`} dir="ltr">{row.value}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-white/8">
                      <p className="text-brand text-xs flex items-center gap-1.5">
                        <Zap size={11} />{lang === 'ar' ? 'أرسل إيصال التحويل عبر واتساب بعد الدفع' : 'Send transfer receipt via WhatsApp after payment'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Terms + Submit */}
            <div className="space-y-4">
              {/* Terms */}
              <button type="button" onClick={() => { setAgreed(p => !p); setErrors(p => ({ ...p, terms: '' })) }}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  agreed ? 'bg-emerald-500/8 border-emerald-500/25' : 'bg-white/[0.02] border-white/8 hover:border-white/15'
                }`}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                  agreed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                }`}>
                  {agreed && <CheckCircle size={12} className="text-white" />}
                </div>
                <p className="text-white/50 text-xs text-left">
                  {lang === 'ar'
                    ? <span>أوافق على <a href="/terms" target="_blank" onClick={e => e.stopPropagation()} className="text-brand hover:underline">الشروط والأحكام</a> و<a href="/refund" target="_blank" onClick={e => e.stopPropagation()} className="text-brand hover:underline">سياسة الاسترداد</a></span>
                    : <span>I agree to the <a href="/terms" target="_blank" onClick={e => e.stopPropagation()} className="text-brand hover:underline">Terms & Conditions</a> and <a href="/refund" target="_blank" onClick={e => e.stopPropagation()} className="text-brand hover:underline">Refund Policy</a></span>
                  }
                </p>
              </button>
              {errors.terms && <p className="text-red-400 text-xs flex items-center gap-1.5 pl-1"><AlertCircle size={11} />{errors.terms}</p>}

              {/* Pay Button */}
              <motion.button type="button" onClick={handleSubmit} disabled={processing}
                whileHover={{ scale: processing ? 1 : 1.01 }} whileTap={{ scale: processing ? 1 : 0.99 }}
                className="w-full relative overflow-hidden bg-gradient-to-r from-brand to-brand-dark text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-brand/20 disabled:opacity-60">
                <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
                {processing
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{lang === 'ar' ? 'جاري المعالجة…' : 'Processing…'}</>
                  : <><Lock size={16} />{lang === 'ar' ? `ادفع الآن ${formatPrice(finalTotal, lang)}` : `Pay Now ${formatPrice(finalTotal, lang)}`}</>
                }
              </motion.button>

              {/* Trust row */}
              <div className="flex items-center justify-center gap-4 pt-1">
                {['256-bit SSL', lang === 'ar' ? 'دفع آمن' : 'Secure', lang === 'ar' ? 'مشفر' : 'Encrypted'].map(t => (
                  <div key={t} className="flex items-center gap-1 text-white/20 text-xs">
                    <Shield size={10} />{t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Order Summary (2/5) ── */}
          <div className="lg:col-span-2">
            <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-5 sticky top-28">
              <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {cart.map(bookId => {
                  const book = BOOKS_DATA[bookId]; if (!book) return null
                  return (
                    <div key={bookId} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/6 group">
                      <span className="text-2xl shrink-0">{book.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{lang === 'ar' ? book.titleAr : book.titleEn}</p>
                        <p className="text-brand text-sm font-bold">{formatPrice(book.price, lang)}</p>
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
                        className="rounded-2xl overflow-hidden border border-[#25d366]/30 bg-[#25d366]/5 mb-4">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#25d366]/10 border-b border-[#25d366]/20">
                          <Gift size={13} className="text-[#25d366] flex-shrink-0" />
                          <span className="text-[#25d366] text-xs font-bold">
                            {lang === 'ar' ? '🎁 أضف البرنامج الثاني واحصل على متابعة واتساب شهر كامل!' : '🎁 Add the 2nd program & get 1 month WhatsApp support!'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 p-4">
                          <div className="w-10 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                            <img src={missingBookData.image} alt="" className="w-full h-full object-cover" />
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
                        className="flex items-center gap-3 rounded-2xl bg-[#25d366]/10 border border-[#25d366]/30 px-4 py-3 mb-4">
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

              {/* Coupon */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-black/30 border border-white/8 rounded-xl px-3 focus-within:border-brand/40 transition-colors">
                    <Tag size={13} className="text-white/25 shrink-0" />
                    <input value={coupon} onChange={e => { setCoupon(e.target.value); setCouponErr('') }}
                      placeholder={lang === 'ar' ? 'كود الخصم' : 'Coupon code'}
                      className="flex-1 bg-transparent py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none" />
                  </div>
                  <button type="button" onClick={() => setCouponErr(lang === 'ar' ? 'كود غير صالح' : 'Invalid code')}
                    disabled={!coupon.trim()}
                    className="px-3 py-2 bg-white/5 border border-white/8 rounded-xl text-white/50 hover:text-white text-sm transition-colors disabled:opacity-30">
                    {lang === 'ar' ? 'تطبيق' : 'Apply'}
                  </button>
                </div>
                {couponErr && <p className="text-red-400 text-xs mt-1.5 pl-1">{couponErr}</p>}
              </div>

              {/* Divider */}
              <div className="border-t border-white/8 pt-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">{lang === 'ar' ? 'المجموع' : 'Subtotal'}</span>
                  <span className="text-white text-sm">{formatPrice(finalTotal, lang)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-white/50 text-sm">{lang === 'ar' ? 'الضريبة' : 'Tax'}</span>
                  <span className="text-emerald-400 text-sm text-xs">{lang === 'ar' ? 'مشمولة' : 'Included'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-white/10">
                <span className="text-white font-bold">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span className="text-brand text-xl font-bold">{formatPrice(finalTotal, lang)}</span>
              </div>

              {/* Security badge */}
              <div className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <Shield size={13} className="text-emerald-400/70" />
                <span className="text-emerald-400/70 text-xs">{lang === 'ar' ? 'مدفوعات مشفرة وآمنة 100%' : '100% Secure & Encrypted'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      <AnimatePresence>
        {confirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setConfirm(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-sm w-full">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-5">
                <Lock size={24} className="text-brand" />
              </div>
              <h3 className="text-white text-xl font-bold text-center mb-2">{lang === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}</h3>
              <p className="text-white/40 text-sm text-center mb-6">
                {lang === 'ar' ? `سيتم خصم ${formatPrice(finalTotal, lang)} من وسيلة دفعك` : `${formatPrice(finalTotal, lang)} will be charged to your payment method`}
              </p>

              {/* Summary lines */}
              <div className="bg-white/[0.03] rounded-2xl p-4 mb-6 space-y-2">
                {cart.map(id => { const b = BOOKS_DATA[id]; return b ? (
                  <div key={id} className="flex items-center justify-between text-sm">
                    <span className="text-white/60 flex items-center gap-2"><span>{b.icon}</span>{lang === 'ar' ? b.titleAr : b.titleEn}</span>
                    <span className="text-white font-medium">{formatPrice(b.price, lang)}</span>
                  </div>
                ) : null })}
                <div className="pt-2 border-t border-white/8 flex justify-between font-bold">
                  <span className="text-white/60">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-brand">{formatPrice(finalTotal, lang)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-sm font-medium">
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand to-brand-dark text-white font-bold text-sm shadow-lg shadow-brand/20">
                  {lang === 'ar' ? 'تأكيد الدفع' : 'Confirm & Pay'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
