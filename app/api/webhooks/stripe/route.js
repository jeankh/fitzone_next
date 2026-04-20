import { NextResponse } from 'next/server'
import { getStripe } from '../../../../src/lib/stripe'
import { getRedis } from '../../../../src/lib/redis'
import { getFromEmail, getResend } from '../../../../src/lib/email'
import { buildOrderConfirmationEmail } from '../../../../src/lib/emails'
import { parseItems } from '../../../../src/lib/user-auth'

const PURCHASES_KEY = 'fitzone_purchases'

async function sendConfirmationEmail({ email, name, items, lang }) {
  const template = buildOrderConfirmationEmail({ emailName: name, items, lang })

  return (await getResend()).emails.send({
    from: getFromEmail(),
    to: email,
    subject: template.subject,
    html: template.html,
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
    const parsedItems = parseItems(items)

    console.log('Payment completed:', { email, phone, name, items: parsedItems, amount, currency, lang })

    try {
      await getRedis().lpush(PURCHASES_KEY, JSON.stringify({
        id: session.id,
        email: email || '',
        phone: phone || '',
        name: name || '',
        items: parsedItems,
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
        await sendConfirmationEmail({ email, name, items: parsedItems, lang })
        console.log('Confirmation email sent to:', email)
      } catch (err) {
        console.error('Failed to send confirmation email:', err.message)
      }
    }

    if (phone) {
      console.log(`WhatsApp notification queued for ${phone} (implement with Twilio/WhatsApp Business API)`)
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fitzoneapp.com'}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': process.env.INTERNAL_SECRET || '',
        },
        body: JSON.stringify({ key: 'purchases' }),
      })
    } catch {}
  }

  return NextResponse.json({ received: true })
}
