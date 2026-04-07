import { NextResponse } from 'next/server'
import { getStripe, PRICE_IDS } from '../../../../src/lib/stripe'
import { validateOrigin } from '../../../../src/lib/csrf'

export async function POST(req) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { items, email, phone, name, lang } = await req.json()

    if (!items || !items.length) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    const lineItems = items.map(id => {
      const priceId = PRICE_IDS[id]
      if (!priceId) throw new Error(`No price ID for item: ${id}`)
      return {
        price: priceId,
        quantity: 1,
      }
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get('host')}`

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: email,
      metadata: {
        items: JSON.stringify(items),
        phone,
        name,
        lang: lang || 'ar',
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      locale: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err.message)
    return NextResponse.json({ error: 'Payment processing failed. Please try again.' }, { status: 500 })
  }
}
