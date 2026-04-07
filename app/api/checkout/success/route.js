import { NextResponse } from 'next/server'
import { getStripe } from '../../../../src/lib/stripe'
import { Redis } from '@upstash/redis'

const kv = Redis.fromEnv()
const PURCHASES_KEY = 'fitzone_purchases'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    try {
      const existing = await kv.lrange(PURCHASES_KEY, 0, -1)
      const alreadyStored = existing.some(item => {
        try { return JSON.parse(item).id === session.id } catch { return false }
      })

      if (!alreadyStored) {
        const { items, phone, name, lang } = session.metadata || {}
        await kv.lpush(PURCHASES_KEY, JSON.stringify({
          id: session.id,
          email: session.customer_email || '',
          phone: phone || '',
          name: name || '',
          items: items || '',
          amount: session.amount_total || 0,
          currency: session.currency || 'sar',
          lang: lang || 'ar',
          status: session.payment_status || 'paid',
          createdAt: new Date().toISOString(),
        }))
      }
    } catch (e) {
      console.error('Failed to store purchase:', e.message)
    }

    return NextResponse.json({
      id: session.id,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      payment_status: session.payment_status,
    })
  } catch (err) {
    console.error('Session retrieve error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
