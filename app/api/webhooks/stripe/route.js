import { NextResponse } from 'next/server'
import { getStripe } from '../../../../src/lib/stripe'

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
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

    console.log('✅ Payment completed:', {
      email,
      phone,
      name,
      items,
      amount,
      currency,
      lang,
    })

    // TODO: Send confirmation email via Resend
    // TODO: Send WhatsApp notification
    // TODO: Track purchase event

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
