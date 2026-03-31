'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, CreditCard, Smartphone, Building2, Lock, Trash2, CheckCircle, ShoppingCart, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../context/LanguageContext'
import { useCart, trackEvent } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'

const paymentMethods = [
  { id: 'card', icon: CreditCard, label: { ar: 'بطاقة ائتمانية', en: 'Credit Card' } },
  { id: 'apple', icon: Smartphone, label: { ar: 'Apple Pay', en: 'Apple Pay' } },
  { id: 'bank', icon: Building2, label: { ar: 'تحويل بنكي', en: 'Bank Transfer' } },
]

// Validation helpers
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const validatePhone = (phone) => /^(\+?966|0)?5\d{8}$/.test(phone.replace(/\s/g, ''))
const validateCardNumber = (num) => {
  const digits = num.replace(/\s/g, '')
  if (digits.length !== 16 || !/^\d+$/.test(digits)) return false
  // Luhn check
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let d = parseInt(digits[digits.length - 1 - i])
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9 }
    sum += d
  }
  return sum % 10 === 0
}
const validateExpiry = (expiry) => {
  const match = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)
  if (!match) return false
  const month = parseInt(match[1])
  const year = parseInt('20' + match[2])
  const now = new Date()
  const expDate = new Date(year, month)
  return expDate > now
}
const validateCVV = (cvv) => /^\d{3,4}$/.test(cvv)

// Input formatting helpers
const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}
const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}
const formatPhone = (value) => {
  let digits = value.replace(/[^\d+]/g, '')
  if (digits.startsWith('+966')) return digits.slice(0, 13)
  if (digits.startsWith('966')) return '+' + digits.slice(0, 12)
  if (digits.startsWith('05')) return digits.slice(0, 10)
  if (digits.startsWith('5')) return digits.slice(0, 9)
  return digits
}
const formatCVV = (value) => value.replace(/\D/g, '').slice(0, 4)

export default function CheckoutPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const { formatPrice } = useCurrency()
  const { cart, removeFromCart, clearCart, getTotal, BOOKS_DATA } = useCart()

  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    cardNumber: '', expiry: '', cvv: '',
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let formatted = value

    if (name === 'cardNumber') formatted = formatCardNumber(value)
    else if (name === 'expiry') formatted = formatExpiry(value)
    else if (name === 'phone') formatted = formatPhone(value)
    else if (name === 'cvv') formatted = formatCVV(value)

    setFormData(prev => ({ ...prev, [name]: formatted }))

    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, formData[name])
  }

  const validateField = (name, value) => {
    let error = ''
    const req = lang === 'ar' ? 'مطلوب' : 'Required'

    switch (name) {
      case 'name':
        if (!value.trim()) error = req
        else if (value.trim().length < 3) error = lang === 'ar' ? 'الاسم قصير جداً' : 'Name too short'
        break
      case 'email':
        if (!value.trim()) error = req
        else if (!validateEmail(value)) error = lang === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email'
        break
      case 'phone':
        if (!value.trim()) error = req
        else if (!validatePhone(value)) error = lang === 'ar' ? 'رقم هاتف غير صالح (مثال: 05XXXXXXXX)' : 'Invalid phone (e.g. 05XXXXXXXX)'
        break
      case 'cardNumber':
        if (paymentMethod !== 'card') break
        if (!value.trim()) error = req
        else if (!validateCardNumber(value)) error = lang === 'ar' ? 'رقم بطاقة غير صالح' : 'Invalid card number'
        break
      case 'expiry':
        if (paymentMethod !== 'card') break
        if (!value.trim()) error = req
        else if (!validateExpiry(value)) error = lang === 'ar' ? 'تاريخ غير صالح أو منتهي' : 'Invalid or expired date'
        break
      case 'cvv':
        if (paymentMethod !== 'card') break
        if (!value.trim()) error = req
        else if (!validateCVV(value)) error = lang === 'ar' ? 'CVV غير صالح' : 'Invalid CVV'
        break
    }

    setErrors(prev => ({ ...prev, [name]: error }))
    return error === ''
  }

  const validateAll = () => {
    const fields = ['name', 'email', 'phone']
    if (paymentMethod === 'card') fields.push('cardNumber', 'expiry', 'cvv')

    const allTouched = {}
    fields.forEach(f => allTouched[f] = true)
    setTouched(allTouched)

    let valid = true
    fields.forEach(f => {
      if (!validateField(f, formData[f])) valid = false
    })
    return valid
  }

  const handleApplyCoupon = () => {
    // Demo: no valid coupons
    setCouponError(lang === 'ar' ? 'كود غير صالح' : 'Invalid coupon code')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateAll()) return
    if (!agreedToTerms) {
      setErrors(prev => ({ ...prev, terms: lang === 'ar' ? 'يجب الموافقة على الشروط' : 'You must agree to the terms' }))
      return
    }
    setShowConfirm(true)
  }

  const handleConfirmPayment = async () => {
    setShowConfirm(false)
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500))
    setIsProcessing(false)
    setIsSuccess(true)
    trackEvent('purchases')
    if (typeof window.gtag === 'function') window.gtag('event', 'purchase', { value: finalTotal, currency: 'SAR' })
    clearCart()
  }

  const getInputClass = (name) => {
    const base = 'w-full bg-background border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:outline-none transition-colors'
    if (touched[name] && errors[name]) return `${base} border-red-500 focus:border-red-400`
    if (touched[name] && !errors[name] && formData[name]) return `${base} border-accent-green/50 focus:border-accent-green`
    return `${base} border-border focus:border-brand`
  }

  // Empty cart
  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={32} className="text-text-muted" />
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {lang === 'ar' ? 'سلة التسوق فارغة' : 'Your Cart is Empty'}
          </h1>
          <p className="text-text-secondary mb-8">
            {lang === 'ar' ? 'أضف بعض البرامج للبدء' : 'Add some programs to get started'}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/programs')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-brand to-brand-dark text-white px-8 py-4 rounded-2xl font-bold"
          >
            <ShoppingCart size={20} />
            <span>{lang === 'ar' ? 'تصفح البرامج' : 'Browse Programs'}</span>
            <Arrow size={20} />
          </motion.button>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6 max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={48} className="text-accent-green" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-4">
            {lang === 'ar' ? 'تم الشراء بنجاح!' : 'Purchase Successful!'}
          </h1>
          <p className="text-text-secondary mb-8 leading-relaxed">
            {lang === 'ar'
              ? 'شكراً لك! سيتم إرسال البرامج إلى بريدك الإلكتروني خلال دقائق. تحقق أيضاً من رسائل الواتساب.'
              : 'Thank you! The programs will be sent to your email within minutes. Also check your WhatsApp messages.'
            }
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-brand to-brand-dark text-white px-8 py-4 rounded-2xl font-bold"
          >
            <span>{lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const finalTotal = getTotal()

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => router.push('/programs')}
            className={`flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6 ${lang === 'en' ? 'flex-row-reverse' : ''}`}
          >
            <Arrow size={20} className={lang === 'ar' ? '' : 'rotate-180'} />
            <span>{lang === 'ar' ? 'العودة للبرامج' : 'Back to Programs'}</span>
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl sm:text-4xl font-bold">
              {lang === 'ar' ? 'إتمام الشراء' : 'Checkout'}
            </h1>
            <span className="text-text-muted text-sm">
              {cart.length} {lang === 'ar' ? 'عنصر في السلة' : cart.length === 1 ? 'item in cart' : 'items in cart'}
            </span>
          </div>
        </div>

        {/* Mobile Order Summary (above form on mobile) */}
        <div className="lg:hidden mb-8">
          <details className="bg-surface border border-border rounded-2xl overflow-hidden">
            <summary className="flex items-center justify-between p-5 cursor-pointer">
              <span className="font-bold">{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'} ({cart.length})</span>
              <span className="text-brand font-bold">{formatPrice(finalTotal, lang)}</span>
            </summary>
            <div className="px-5 pb-5 border-t border-border">
              {cart.map((bookId) => {
                const book = BOOKS_DATA[bookId]
                if (!book) return null
                return (
                  <div key={bookId} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{book.icon}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{lang === 'ar' ? book.titleAr : book.titleEn}</p>
                        <p className="text-text-muted text-xs">{formatPrice(book.price, lang)}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(bookId)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          </details>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Order Summary - Desktop Sidebar */}
          <div className="lg:col-span-2 hidden lg:block">
            <div className="bg-surface border border-border rounded-2xl p-6 sticky top-28">
              <h2 className="text-lg font-bold mb-6">
                {lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              <div className="space-y-4 mb-6">
                {cart.map((bookId) => {
                  const book = BOOKS_DATA[bookId]
                  if (!book) return null
                  return (
                    <div key={bookId} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{book.icon}</span>
                        <div>
                          <p className="text-white font-semibold text-sm">{lang === 'ar' ? book.titleAr : book.titleEn}</p>
                          <p className="text-text-muted text-xs">{formatPrice(book.price, lang)}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(bookId)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Coupon Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError('') }}
                    placeholder={lang === 'ar' ? 'كود الخصم' : 'Coupon code'}
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim()}
                    className="px-4 py-2 bg-white/[0.05] border border-border rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:border-brand/30 transition-all disabled:opacity-40"
                  >
                    {lang === 'ar' ? 'تطبيق' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-red-400 text-xs mt-1">{couponError}</p>}
              </div>

              {/* Totals */}
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-xl font-bold">
                  <span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-brand">{formatPrice(finalTotal, lang)}</span>
                </div>
              </div>

              {/* Trust */}
              <div className="flex items-center gap-2 mt-6 text-text-muted text-xs">
                <Lock size={14} />
                <span>{lang === 'ar' ? 'معاملة آمنة ومشفرة' : 'Secure & encrypted transaction'}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              {/* Contact Info */}
              <div className="bg-surface border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-6">
                  {lang === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-text-secondary text-sm mb-2">
                      {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('name')}
                      className={getInputClass('name')}
                      placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    />
                    {touched.name && errors.name && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-text-secondary text-sm mb-2">
                      {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('email')}
                      className={getInputClass('email')}
                      placeholder="email@example.com"
                    />
                    {touched.email && errors.email && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-text-secondary text-sm mb-2">
                      {lang === 'ar' ? 'رقم الهاتف (واتساب)' : 'Phone (WhatsApp)'} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('phone')}
                      className={getInputClass('phone')}
                      placeholder="+966 5XX XXX XXXX"
                      dir="ltr"
                    />
                    {touched.phone && errors.phone && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-surface border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-6">
                  {lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                </h2>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => { setPaymentMethod(method.id); setErrors(prev => ({ ...prev, cardNumber: '', expiry: '', cvv: '' })) }}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        paymentMethod === method.id
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-border text-text-secondary hover:border-border-hover'
                      }`}
                    >
                      <method.icon size={24} />
                      <span className="text-xs font-medium">{method.label[lang]}</span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {paymentMethod === 'card' && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-text-secondary text-sm mb-2">
                          {lang === 'ar' ? 'رقم البطاقة' : 'Card Number'} <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur('cardNumber')}
                          className={getInputClass('cardNumber')}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          dir="ltr"
                        />
                        {touched.cardNumber && errors.cardNumber && (
                          <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.cardNumber}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-text-secondary text-sm mb-2">
                            {lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry'} <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            name="expiry"
                            value={formData.expiry}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('expiry')}
                            className={getInputClass('expiry')}
                            placeholder="MM/YY"
                            maxLength={5}
                            dir="ltr"
                          />
                          {touched.expiry && errors.expiry && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.expiry}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-text-secondary text-sm mb-2">
                            CVV <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="password"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('cvv')}
                            className={getInputClass('cvv')}
                            placeholder="•••"
                            maxLength={4}
                            dir="ltr"
                          />
                          {touched.cvv && errors.cvv && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.cvv}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'apple' && (
                    <motion.div
                      key="apple"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-center py-8"
                    >
                      <p className="text-text-secondary">
                        {lang === 'ar' ? 'سيتم توجيهك إلى Apple Pay لإتمام الدفع' : 'You will be redirected to Apple Pay to complete payment'}
                      </p>
                    </motion.div>
                  )}

                  {paymentMethod === 'bank' && (
                    <motion.div
                      key="bank"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-background rounded-xl p-4 space-y-2"
                    >
                      <p className="text-white font-semibold">{lang === 'ar' ? 'معلومات الحساب البنكي:' : 'Bank Account Information:'}</p>
                      <p className="text-text-secondary text-sm">{lang === 'ar' ? 'البنك: الراجحي' : 'Bank: Al Rajhi'}</p>
                      <p className="text-text-secondary text-sm" dir="ltr">{lang === 'ar' ? 'رقم الحساب: ' : 'Account: '}SA0000000000000000000</p>
                      <p className="text-text-secondary text-sm">{lang === 'ar' ? 'الاسم: HADIDI' : 'Name: HADIDI'}</p>
                      <p className="text-brand text-xs mt-4">{lang === 'ar' ? 'أرسل إيصال التحويل عبر واتساب' : 'Send transfer receipt via WhatsApp'}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => { setAgreedToTerms(e.target.checked); setErrors(prev => ({ ...prev, terms: '' })) }}
                  className="mt-1 w-4 h-4 rounded accent-brand cursor-pointer"
                />
                <label htmlFor="terms" className="text-text-secondary text-sm cursor-pointer">
                  {lang === 'ar'
                    ? <>أوافق على <a href="/terms" target="_blank" className="text-brand hover:underline">الشروط والأحكام</a> و<a href="/refund" target="_blank" className="text-brand hover:underline">سياسة الاسترداد</a></>
                    : <>I agree to the <a href="/terms" target="_blank" className="text-brand hover:underline">Terms & Conditions</a> and <a href="/refund" target="_blank" className="text-brand hover:underline">Refund Policy</a></>
                  }
                </label>
              </div>
              {errors.terms && <p className="text-red-400 text-xs flex items-center gap-1 -mt-4"><AlertCircle size={12} />{errors.terms}</p>}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isProcessing}
                whileHover={{ scale: isProcessing ? 1 : 1.01 }}
                whileTap={{ scale: isProcessing ? 1 : 0.99 }}
                className="w-full bg-gradient-to-r from-brand to-brand-dark text-white py-4 rounded-2xl font-bold text-lg glow-brand disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{lang === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    <span>{lang === 'ar' ? `ادفع ${formatPrice(finalTotal, lang)}` : `Pay ${formatPrice(finalTotal, lang)}`}</span>
                  </>
                )}
              </motion.button>

              {/* Payment badges */}
              <div className="flex items-center justify-center gap-4 opacity-50">
                <span className="text-2xl">💳</span>
                <span className="text-2xl">🍎</span>
                <span className="text-2xl">🏦</span>
                <span className="text-xs text-text-muted">{lang === 'ar' ? 'دفع آمن' : 'Secure Payment'}</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface border border-border rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-brand" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {lang === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}
              </h3>
              <p className="text-text-secondary mb-6">
                {lang === 'ar'
                  ? `سيتم خصم ${formatPrice(finalTotal, lang)}. هل تريد المتابعة؟`
                  : `You will be charged ${formatPrice(finalTotal, lang)}. Continue?`
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-border text-text-secondary hover:bg-white/5 transition-colors"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand to-brand-dark text-white font-bold"
                >
                  {lang === 'ar' ? 'تأكيد' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
