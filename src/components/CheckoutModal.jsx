'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Check, Loader2, ShieldCheck, Lock } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'

export default function CheckoutModal() {
  const {
    cart,
    getTotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    BOOKS_DATA
  } = useCart()
  const { lang } = useLanguage()
  
  const [step, setStep] = useState('form') // form, processing, success
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'card',
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = lang === 'ar' ? 'الاسم مطلوب' : 'Name is required'
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = lang === 'ar' ? 'البريد الإلكتروني غير صالح' : 'Invalid email'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = lang === 'ar' ? 'رقم الجوال مطلوب' : 'Phone is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setStep('processing')
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    setStep('success')
  }

  const handleClose = () => {
    if (step === 'success') {
      clearCart()
    }
    setIsCheckoutOpen(false)
    setStep('form')
    setFormData({ name: '', email: '', phone: '', paymentMethod: 'card' })
  }

  if (!isCheckoutOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg bg-surface border border-border rounded-3xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <CreditCard size={24} className="text-brand" />
              <h2 className="text-xl font-bold text-white">
                {step === 'success' 
                  ? (lang === 'ar' ? 'تم بنجاح!' : 'Success!') 
                  : (lang === 'ar' ? 'إتمام الشراء' : 'Checkout')}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          <div className="p-6">
            {/* Processing State */}
            {step === 'processing' && (
              <div className="text-center py-12">
                <Loader2 size={48} className="text-brand mx-auto mb-4 animate-spin" />
                <p className="text-white font-semibold text-lg mb-2">
                  {lang === 'ar' ? 'جاري معالجة الدفع...' : 'Processing payment...'}
                </p>
                <p className="text-text-secondary text-sm">
                  {lang === 'ar' ? 'يرجى الانتظار' : 'Please wait'}
                </p>
              </div>
            )}

            {/* Success State */}
            {step === 'success' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-accent-green" />
                </div>
                <h3 className="text-white font-bold text-2xl mb-3">
                  {lang === 'ar' ? 'تمت عملية الشراء بنجاح!' : 'Purchase Successful!'}
                </h3>
                <p className="text-text-secondary mb-6">
                  {lang === 'ar' 
                    ? 'سيتم إرسال رابط التحميل إلى بريدك الإلكتروني ورقم واتساب الخاص بك.' 
                    : 'Download link will be sent to your email and WhatsApp.'}
                </p>
                
                <div className="bg-white/[0.03] border border-border rounded-2xl p-4 mb-6">
                  <p className="text-text-muted text-sm mb-2">
                    {lang === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
                  </p>
                  <div className="space-y-2">
                    {cart.map(bookId => {
                      const book = BOOKS_DATA[bookId]
                      return (
                        <div key={bookId} className="flex items-center justify-between">
                          <span className="text-white text-sm">{lang === 'ar' ? book.titleAr : book.titleEn}</span>
                          <span className="text-brand text-sm font-bold">{book.icon}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-brand to-brand-dark text-white py-4 rounded-2xl font-bold text-lg"
                >
                  {lang === 'ar' ? 'تم' : 'Done'}
                </motion.button>
              </div>
            )}

            {/* Form State */}
            {step === 'form' && (
              <form onSubmit={handleSubmit}>
                {/* Order Summary */}
                <div className="bg-white/[0.03] border border-border rounded-2xl p-4 mb-6">
                  <p className="text-text-muted text-sm mb-3">
                    {lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                  </p>
                  <div className="space-y-2 mb-3">
                    {cart.map(bookId => {
                      const book = BOOKS_DATA[bookId]
                      return (
                        <div key={bookId} className="flex items-center justify-between text-sm">
                          <span className="text-white">{lang === 'ar' ? book.titleAr : book.titleEn}</span>
                          <span className="text-text-secondary">{book.price} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between font-bold pt-2 border-t border-border">
                    <span className="text-white">{lang === 'ar' ? 'المجموع' : 'Total'}</span>
                    <span className="text-brand text-xl">{getTotal()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-text-secondary text-sm mb-2">
                      {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full bg-white/[0.03] border ${errors.name ? 'border-red-500' : 'border-border'} rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-brand transition-colors`}
                      placeholder={lang === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-text-secondary text-sm mb-2">
                      {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full bg-white/[0.03] border ${errors.email ? 'border-red-500' : 'border-border'} rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-brand transition-colors`}
                      placeholder="email@example.com"
                      dir="ltr"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-text-secondary text-sm mb-2">
                      {lang === 'ar' ? 'رقم الجوال (واتساب)' : 'Phone (WhatsApp)'}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full bg-white/[0.03] border ${errors.phone ? 'border-red-500' : 'border-border'} rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-brand transition-colors`}
                      placeholder="+966 5XX XXX XXXX"
                      dir="ltr"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <label className="block text-text-secondary text-sm mb-3">
                      {lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'card', label: lang === 'ar' ? 'بطاقة ائتمانية' : 'Credit Card', icon: '💳' },
                        { id: 'apple', label: 'Apple Pay', icon: '🍎' },
                      ].map(method => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                          className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                            formData.paymentMethod === method.id
                              ? 'border-brand bg-brand/10 text-white'
                              : 'border-border bg-white/[0.02] text-text-secondary hover:bg-white/[0.05]'
                          }`}
                        >
                          <span>{method.icon}</span>
                          <span className="text-sm font-medium">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Security Note */}
                <div className="flex items-center gap-2 text-text-muted text-xs mb-6">
                  <Lock size={14} />
                  <span>{lang === 'ar' ? 'جميع المعاملات مشفرة وآمنة' : 'All transactions are encrypted and secure'}</span>
                  <ShieldCheck size={14} className="text-accent-green" />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-brand to-brand-dark text-white py-4 rounded-2xl font-bold text-lg glow-brand hover:glow-brand-hover transition-all"
                >
                  <span>
                    {lang === 'ar' ? `ادفع ${getTotal()} ر.س` : `Pay ${getTotal()} SAR`}
                  </span>
                </motion.button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
