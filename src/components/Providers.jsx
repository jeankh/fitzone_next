'use client'
import { LanguageProvider } from '../context/LanguageContext'
import { CartProvider } from '../context/CartContext'
import { CurrencyProvider } from '../context/CurrencyContext'
import { MarketingProvider } from '../context/MarketingContext'

export default function Providers({ children }) {
  return (
    <CurrencyProvider>
      <LanguageProvider>
        <CartProvider>
          <MarketingProvider>
            {children}
          </MarketingProvider>
        </CartProvider>
      </LanguageProvider>
    </CurrencyProvider>
  )
}
