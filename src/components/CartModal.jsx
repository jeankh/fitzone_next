'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, ArrowLeft, ArrowRight, Gift, Zap } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useCurrency } from '../context/CurrencyContext'
import Image from 'next/image'

export default function CartModal() {
  const {
    cart,
    removeFromCart,
    addToCart,
    getTotal,
    getSavings,
    getMissingBook,
    wasAutoUpgraded,
    isCartOpen,
    setIsCartOpen,
    openCheckout,
    BOOKS_DATA,
  } = useCart()
  const { lang } = useLanguage()
  const { formatPrice } = useCurrency()
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight

  const missingBook = getMissingBook()
  const missingBookData = missingBook ? BOOKS_DATA[missingBook] : null

  if (!isCartOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setIsCartOpen(false)}
      >
        <motion.div
          initial={{ x: lang === 'ar' ? -400 : 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: lang === 'ar' ? -400 : 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`absolute top-0 ${lang === 'ar' ? 'left-0 border-r' : 'right-0 border-l'} h-full w-full max-w-md bg-surface border-border overflow-hidden flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <ShoppingBag size={24} className="text-brand" />
              <h2 className="text-xl font-bold text-white">
                {lang === 'ar' ? 'سلة المشتريات' : 'Shopping Cart'}
              </h2>
              <span className="bg-brand text-white text-xs font-bold px-2 py-1 rounded-full">
                {cart.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag size={48} className="text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">
                  {lang === 'ar' ? 'السلة فارغة' : 'Cart is empty'}
                </p>
              </div>
            ) : (
              <>
                <AnimatePresence>
                  {cart.map((bookId) => {
                    const book = BOOKS_DATA[bookId]
                    if (!book) return null
                    return (
                      <motion.div
                        key={bookId}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: lang === 'ar' ? 100 : -100 }}
                        className="flex items-center gap-4 bg-white/[0.03] border border-border rounded-2xl p-4"
                      >
                        {bookId === 'bundle' ? (
                          <div className="relative w-16 h-20 flex-shrink-0">
                            <Image src={book.image} alt="" width={48} height={80} className="absolute top-0 left-0 w-12 h-20 object-cover rounded-lg border border-white/10 shadow-md" style={{ transform: 'rotate(-5deg)' }} />
                            <Image src={book.image2} alt="" width={48} height={80} className="absolute top-0 right-0 w-12 h-20 object-cover rounded-lg border border-white/10 shadow-md" style={{ transform: 'rotate(5deg)', zIndex: 1 }} />
                          </div>
                        ) : (
                          <div className="relative w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                            <Image src={book.image} alt="" fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm leading-snug">
                            {lang === 'ar' ? book.titleAr : book.titleEn}
                          </h3>
                          <p className="text-brand font-bold mt-0.5">
                            {formatPrice(book.price, lang)}
                          </p>
                          {bookId === 'bundle' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-accent-green font-semibold mt-1">
                              <Gift size={10} />
                              {lang === 'ar' ? 'يشمل متابعة واتساب' : 'Includes WhatsApp support'}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(bookId)}
                          className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={18} className="text-red-500" />
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {/* Upsell banner — suggest missing book + bundle upgrade */}
                {missingBookData && !cart.includes('bundle') && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden border border-accent-green/30 bg-accent-green/5"
                  >
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-accent-green/10 border-b border-accent-green/20">
                      <Gift size={13} className="text-accent-green flex-shrink-0" />
                      <span className="text-accent-green text-xs font-bold">
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
                        <p className="text-accent-green text-xs font-semibold mt-0.5">
                          {lang === 'ar'
                            ? '+ متابعة واتساب شهر كامل مع الباقة'
                            : '+ 1 month WhatsApp support with bundle'}
                        </p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => addToCart(missingBook)}
                        className="flex-shrink-0 bg-accent-green text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-green-500 transition-colors whitespace-nowrap"
                      >
                        {lang === 'ar' ? 'أضف الآن' : 'Add Now'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Bundle upgrade success message — only shown after auto-merge */}
                {wasAutoUpgraded && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-2xl bg-accent-green/10 border border-accent-green/30 px-4 py-3"
                  >
                    <div className="w-8 h-8 bg-accent-green/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Gift size={16} className="text-accent-green" />
                    </div>
                    <div>
                      <p className="text-accent-green text-sm font-bold">
                        {lang === 'ar' ? '🎉 تمت الترقية للباقة الكاملة!' : '🎉 Upgraded to the Complete Bundle!'}
                      </p>
                      <p className="text-text-muted text-xs mt-0.5">
                        {lang === 'ar' ? 'وفّرت مقارنةً بالشراء المنفرد' : 'You saved vs buying separately'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="flex-shrink-0 p-6 bg-surface border-t border-border">

              <div className="flex items-center justify-between mb-5">
                <span className="text-text-secondary">
                  {lang === 'ar' ? 'المجموع' : 'Total'}
                </span>
                <span className="text-white text-2xl font-bold">
                  {formatPrice(getTotal(), lang)}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCheckout}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-brand to-brand-dark text-white py-4 rounded-2xl font-bold text-lg glow-brand hover:glow-brand-hover transition-all group"
              >
                <span>{lang === 'ar' ? 'إتمام الشراء' : 'Checkout'}</span>
                <Arrow size={20} className={`transition-transform ${lang === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
