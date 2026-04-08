import { NextResponse } from 'next/server'
import { getStripe } from '../../../../src/lib/stripe'
import { getRedis } from '../../../../src/lib/redis'

const PURCHASES_KEY = 'fitzone_purchases'

async function getResend() {
  const { default: Resend } = await import('resend')
  return new Resend(process.env.RESEND_API_KEY)
}

async function sendConfirmationEmail({ email, name, items, lang }) {
  const isAr = lang === 'ar'
  const itemNames = (items || '').split(',').map(id => {
    if (id === 'transformation') return isAr ? 'دليل التنشيف وبناء الجسم' : 'Shredding & Building Guide'
    if (id === 'nutrition') return isAr ? 'دليل خسارة الدهون' : 'Fat Loss Guide'
    if (id === 'bundle') return isAr ? 'الباقة الكاملة' : 'Complete Bundle'
    return id
  })

  const subject = isAr ? 'تأكيد طلبك - FitZone' : 'Order Confirmed - FitZone'
  const html = isAr
    ? `<div dir="rtl" style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#fff;background:#0a0a0a;border-radius:16px">
        <h2 style="color:#ef4444;margin-bottom:16px">✅ تم تأكيد طلبك!</h2>
        <p style="color:#ccc">مرحباً ${name || ''}،</p>
        <p style="color:#ccc">شكراً لطلبك. منتجاتك:</p>
        <ul style="color:#eee">${itemNames.map(n => `<li>${n}</li>`).join('')}</ul>
        <p style="color:#999;font-size:13px;margin-top:24px">سيتم التواصل معك عبر الواتساب قريباً لتسليم المنتجات. شكراً لثقتك بنا! 🙏</p>
      </div>`
    : `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#fff;background:#0a0a0a;border-radius:16px">
        <h2 style="color:#ef4444;margin-bottom:16px">✅ Order Confirmed!</h2>
        <p style="color:#ccc">Hi ${name || ''},</p>
        <p style="color:#ccc">Thanks for your purchase! Your items:</p>
        <ul style="color:#eee">${itemNames.map(n => `<li>${n}</li>`).join('')}</ul>
        <p style="color:#999;font-size:13px;margin-top:24px">We'll reach out via WhatsApp shortly to deliver your products. Thank you for trusting us! 🙏</p>
      </div>`

  return (await getResend()).emails.send({
    from: process.env.FROM_EMAIL || 'orders@fitzone.com',
    to: email,
    subject,
    html,
  })
}

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { items, phone, name, lang } = session.metadata || {}
    const email = session.customer_email
    const amount = session.amount_total
    const currency = session.currency

    console.log('Payment completed:', { email, phone, name, items, amount, currency, lang })

    try {
      await getRedis().lpush(PURCHASES_KEY, JSON.stringify({
        id: session.id,
        email: email || '',
        phone: phone || '',
        name: name || '',
        items: items || '',
        amount: amount || 0,
        currency: currency || 'sar',
        lang: lang || 'ar',
        status: session.payment_status || 'paid',
        createdAt: new Date().toISOString(),
      }))
    } catch (e) {
      console.error('Failed to store purchase:', e.message)
    }

    if (email) {
      try {
        await sendConfirmationEmail({ email, name, items, lang })
        console.log('Confirmation email sent to:', email)
      } catch (err) {
        console.error('Failed to send confirmation email:', err.message)
      }
    }

    if (phone) {
      console.log(`WhatsApp notification queued for ${phone} (implement with Twilio/WhatsApp Business API)`)
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://fitzone.vercel.app'}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'purchases' }),
      })
    } catch {}
  }

  return NextResponse.json({ received: true })
}
