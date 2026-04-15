import Script from 'next/script'
import './globals.css'
import ClientLayout from '../src/components/ClientLayout'
import { Analytics } from '@vercel/analytics/next'
import { getStripe, PRICE_IDS } from '../src/lib/stripe'

const PRICE_DEFAULTS = { transformation: 79, nutrition: 79, bundle: 158 }
const MARKETING_DEFAULTS = { whatsapp: '966500000000', whatsapp_visible: 'true', social_buttons: '[]' }
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function fetchPrices() {
  try {
    const stripe = getStripe()
    const [t, n, b] = await Promise.all([
      stripe.prices.retrieve(PRICE_IDS.transformation),
      stripe.prices.retrieve(PRICE_IDS.nutrition),
      stripe.prices.retrieve(PRICE_IDS.bundle),
    ])
    return {
      transformation: t.unit_amount / 100,
      nutrition:       n.unit_amount / 100,
      bundle:          b.unit_amount / 100,
      currency:        t.currency.toUpperCase(), // all share the same base currency
    }
  } catch (err) {
    console.error('Failed to fetch Stripe prices, using defaults:', err.message)
    return { ...PRICE_DEFAULTS, currency: 'SAR' }
  }
}

async function fetchMarketing() {
  try {
    return await fetch(`${BASE_URL}/api/admin/marketing`, { next: { tags: ['marketing'] } }).then(r => r.json())
  } catch {
    return MARKETING_DEFAULTS
  }
}

export const metadata = {
  title: 'FitZone | برامج التنشيف وخسارة الدهون',
  description: 'برامج تدريبية متخصصة في التنشيف وبناء الجسم وخسارة الدهون من فريق FitZone. تدريب + تغذية + متابعة شخصية عبر الواتساب.',
  keywords: 'FitZone, فيت زون, برامج لياقة, تنشيف, خسارة دهون, تغذية',
  openGraph: {
    title: 'FitZone | برامج التنشيف وخسارة الدهون',
    description: 'برامج تدريبية متخصصة في التنشيف وبناء الجسم وخسارة الدهون مع متابعة شخصية عبر الواتساب.',
    images: [{ url: '/fitzone-hero.jpeg', width: 1200, height: 630 }],
    siteName: 'FitZone',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitZone | برامج التنشيف وخسارة الدهون',
    description: 'برامج تدريبية متخصصة في التنشيف وبناء الجسم وخسارة الدهون.',
    images: ['/fitzone-hero.jpeg'],
  },
  icons: {
    icon: '/fitzone-logo-zoom.jpeg',
    apple: '/fitzone-logo-zoom.jpeg',
  },
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default async function RootLayout({ children }) {
  const [prices, marketing] = await Promise.all([
    fetchPrices(),
    fetchMarketing(),
  ])

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
        {GA_ID && (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
      </head>
      <body>
        <ClientLayout prices={prices} marketing={marketing}>
          {children}
        </ClientLayout>
        <Analytics />
      </body>
    </html>
  )
}
