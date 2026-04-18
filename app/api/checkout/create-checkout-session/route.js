import { NextResponse } from 'next/server'
import { getStripe, PRICE_IDS } from '../../../../src/lib/stripe'
import { validateOrigin } from '../../../../src/lib/csrf'

export async function POST(req) {
  try {
    const { items, email, phone, name, lang, currency } = await req.json()

    if (!items || !items.length) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    const lineItems = items.map(id => {
      const priceId = PRICE_IDS[id]
      if (!priceId) throw new Error(`No price ID for item: ${id}`)
      return { price: priceId, quantity: 1 }
    })

    const baseUrl = 'https://www.fitzoneapp.com'
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/checkout`

    const stripe = getStripe()

    // Ask Stripe to charge in the visitor's currency if that Price has a currency_option for it.
    // Stripe silently ignores unsupported currencies only if the Price has currency_options
    // configured — otherwise it errors. We pre-check to avoid surprise failures.
    let sessionCurrency
    if (currency && typeof currency === 'string') {
      const lower = currency.toLowerCase()
      try {
        const firstPrice = await stripe.prices.retrieve(lineItems[0].price, { expand: ['currency_options'] })
        const baseMatches = firstPrice.currency === lower
        const hasOption = firstPrice.currency_options && firstPrice.currency_options[lower]
        if (baseMatches || hasOption) sessionCurrency = lower
      } catch (e) {
        console.error('Currency precheck failed, falling back to base:', e.message)
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: email,
      ...(sessionCurrency ? { currency: sessionCurrency } : {}),
      metadata: {
        items: JSON.stringify(items),
        phone,
        name,
        lang: lang || 'ar',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err.message, err.type, err.code, err.stack)
    return NextResponse.json({ error: 'Payment processing failed. Please try again.' }, { status: 500 })
  }
}
