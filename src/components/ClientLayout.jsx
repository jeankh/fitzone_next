'use client'
import dynamic from 'next/dynamic'
import { CurrencyProvider } from '../context/CurrencyContext'
import { LanguageProvider } from '../context/LanguageContext'
import { CartProvider } from '../context/CartContext'
import { UserProvider } from '../context/UserContext'

const ShellWrapper = dynamic(() => import('./ShellWrapper'), { ssr: false })

export default function ClientLayout({ children }) {
  return (
    <CurrencyProvider>
      <LanguageProvider>
        <UserProvider>
          <CartProvider>
            <ShellWrapper>{children}</ShellWrapper>
          </CartProvider>
        </UserProvider>
      </LanguageProvider>
    </CurrencyProvider>
  )
}
