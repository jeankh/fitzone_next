'use client'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from '../sections/Footer'
import WhatsAppButton from './WhatsAppButton'
import CartModal from './CartModal'
import CheckoutModal from './CheckoutModal'
import ScrollToTop from './ScrollToTop'

export default function ShellWrapper({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname === '/admin'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ScrollToTop />
      {!isAdmin && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppButton />}
      {!isAdmin && <CartModal />}
      {!isAdmin && <CheckoutModal />}
    </div>
  )
}
