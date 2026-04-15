'use client'
import dynamic from 'next/dynamic'
import { CurrencyProvider } from '../context/CurrencyContext'
import { LanguageProvider } from '../context/LanguageContext'
import { CartProvider } from '../context/CartContext'
import { UserProvider } from '../context/UserContext'
import { MarketingProvider } from '../context/MarketingContext'

const ShellWrapper = dynamic(() => import('./ShellWrapper'), { ssr: false })

export default function ClientLayout({ children, prices, currencyPrices, marketing }) {
  return (
    <CurrencyProvider>
      <LanguageProvider>
        <UserProvider>
          <MarketingProvider initialMarketing={marketing}>
            <CartProvider initialPrices={prices} initialCurrencyPrices={currencyPrices}>
              <ShellWrapper>{children}</ShellWrapper>
            </CartProvider>
          </MarketingProvider>
        </UserProvider>
      </LanguageProvider>
    </CurrencyProvider>
  )
}
