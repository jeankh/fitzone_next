'use client'
import { LanguageProvider } from '../context/LanguageContext'
import { CartProvider } from '../context/CartContext'
import { CurrencyProvider } from '../context/CurrencyContext'

export default function Providers({ children }) {
  return (
    <CurrencyProvider>
      <LanguageProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </LanguageProvider>
    </CurrencyProvider>
  )
}
