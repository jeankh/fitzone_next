'use client'
import dynamic from 'next/dynamic'
import { CurrencyProvider } from '../context/CurrencyContext'
import { LanguageProvider } from '../context/LanguageContext'
import { CartProvider } from '../context/CartContext'

const ShellWrapper = dynamic(() => import('./ShellWrapper'), { ssr: false })

export default function ClientLayout({ children }) {
  return (
    <CurrencyProvider>
      <LanguageProvider>
        <CartProvider>
          <ShellWrapper>{children}</ShellWrapper>
        </CartProvider>
      </LanguageProvider>
    </CurrencyProvider>
  )
}
