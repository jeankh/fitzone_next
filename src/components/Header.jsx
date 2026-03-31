'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { cn } from '../lib/utils'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { lang, setLang, t } = useLanguage()
  const { cart, setIsCartOpen } = useCart()
  const pathname = usePathname()
  const router = useRouter()


  const navItems = [
    { label: t('nav.home'), path: '/', isHash: false },
    { label: t('nav.books'), path: '/programs', isHash: false },
    { label: t('nav.results'), path: '/results', isHash: false },
    { label: t('nav.blog'), path: '/blog', isHash: false },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (path) => {
    setMobileMenuOpen(false)
    if (path.startsWith('/#')) {
      const sectionId = path.replace('/#', '')
      if (pathname !== '/') {
        router.push('/')
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      router.push(path)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isActive = (path) => {
    if (path === '/') return pathname === '/'
    if (path.startsWith('/#')) return false
    return pathname === path
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Background layer — always visible on mobile, fades in on desktop on scroll */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-300',
          scrolled
            ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-lg shadow-black/20'
            : 'bg-background/95 backdrop-blur-xl border-b border-border lg:bg-transparent lg:backdrop-blur-none lg:border-transparent lg:shadow-none'
        )}
      />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 group">
            <img src="/fitzone-logo.jpeg" alt="FitZone" className="w-11 h-11 rounded-xl object-contain" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">FitZone</span>
              <span className="text-[10px] text-text-muted tracking-[2px]">TEAM</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-border rounded-full p-1.5">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                  isActive(item.path) ? 'bg-brand/10 text-brand' : 'text-text-secondary hover:text-white hover:bg-white/5'
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex border border-white/20 rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm">
              <button
                onClick={() => setLang('ar')}
                className={cn('px-3 py-2 text-sm font-semibold transition-all', lang === 'ar' ? 'bg-brand/15 text-brand' : 'text-text-muted hover:bg-white/5 hover:text-white')}
              >
                ع
              </button>
              <button
                onClick={() => setLang('en')}
                className={cn('px-3 py-2 text-sm font-semibold transition-all', lang === 'en' ? 'bg-brand/15 text-brand' : 'text-text-muted hover:bg-white/5 hover:text-white')}
              >
                EN
              </button>
            </div>

            {cart.length > 0 && (
              <button onClick={() => setIsCartOpen(true)} className="relative w-10 h-10 bg-brand/10 border border-brand/30 rounded-lg flex items-center justify-center text-brand hover:bg-brand/20 transition-colors">
                <ShoppingCart size={18} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand text-white text-xs font-bold rounded-full flex items-center justify-center">{cart.length}</span>
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/programs')}
              className="hidden sm:flex bg-gradient-to-r from-brand to-brand-dark text-white px-6 py-2.5 rounded-xl text-sm font-semibold glow-brand hover:glow-brand-hover transition-all"
            >
              {t('nav.getBooks')}
            </motion.button>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-white/20 bg-black/30 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="flex flex-col gap-1.5">
                <span className={cn('w-5 h-0.5 bg-white transition-all', mobileMenuOpen && 'rotate-45 translate-y-2')} />
                <span className={cn('w-5 h-0.5 bg-white transition-all', mobileMenuOpen && 'opacity-0')} />
                <span className={cn('w-5 h-0.5 bg-white transition-all', mobileMenuOpen && '-rotate-45 -translate-y-2')} />
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Menu — full width overlay */}
      <motion.div
        initial={false}
        animate={{ opacity: mobileMenuOpen ? 1 : 0, y: mobileMenuOpen ? 0 : -10 }}
        transition={{ duration: 0.2 }}
        className={cn('lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-background/98 backdrop-blur-xl border-t border-border overflow-y-auto', mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none')}
        onClick={() => setMobileMenuOpen(false)}
      >
        <nav className="flex flex-col gap-2 p-6" onClick={e => e.stopPropagation()}>
          {navItems.map((item) => (
            <button key={item.path} onClick={() => handleNavClick(item.path)} className={cn('px-4 py-4 rounded-xl text-lg font-medium transition-all', lang === 'ar' ? 'text-right' : 'text-left', isActive(item.path) ? 'bg-brand/10 text-brand' : 'text-text-secondary hover:text-white hover:bg-white/5')}>
              {item.label}
            </button>
          ))}
          <button onClick={() => { setMobileMenuOpen(false); router.push('/programs') }} className="mt-4 bg-gradient-to-r from-brand to-brand-dark text-white px-6 py-4 rounded-xl text-lg font-semibold">
            {t('nav.getBooks')}
          </button>
        </nav>
      </motion.div>
    </motion.header>
  )
}
