import Script from 'next/script'
import './globals.css'
import ClientLayout from '../src/components/ClientLayout'
import { Analytics } from '@vercel/analytics/next'

const PRICE_DEFAULTS = { transformation: 79, nutrition: 79, bundle: 158 }
const MARKETING_DEFAULTS = { whatsapp: '966500000000', whatsapp_visible: 'true', social_buttons: '[]' }
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function fetchPrices() {
  try {
    const [prices, currencyPrices] = await Promise.all([
      fetch(`${BASE_URL}/api/admin/prices`, { next: { tags: ['prices'] } }).then(r => r.json()),
      fetch(`${BASE_URL}/api/admin/currency-prices`, { next: { tags: ['currency-prices'] } }).then(r => r.json()),
    ])
    return { prices, currencyPrices }
  } catch {
    return { prices: PRICE_DEFAULTS, currencyPrices: {} }
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
  const [{ prices, currencyPrices }, marketing] = await Promise.all([
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
        <ClientLayout prices={prices} currencyPrices={currencyPrices} marketing={marketing}>
          {children}
        </ClientLayout>
        <Analytics />
      </body>
    </html>
  )
}
