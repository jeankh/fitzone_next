import { NextResponse } from 'next/server'
import { getStripe } from '../../../../src/lib/stripe'

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

    return NextResponse.json({
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
