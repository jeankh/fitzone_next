import { NextResponse } from 'next/server'
import { getStripe, PRICE_IDS } from '../../../../src/lib/stripe'
import { revalidateTag } from 'next/cache'

export const dynamic = 'force-dynamic'

// Fetch live unit_amount from Stripe for each product.
// Returns prices in the base currency of each Price ID (SAR).
export async function GET() {
  try {
    const stripe = getStripe()
    const [transformation, nutrition, bundle] = await Promise.all([
      stripe.prices.retrieve(PRICE_IDS.transformation),
      stripe.prices.retrieve(PRICE_IDS.nutrition),
      stripe.prices.retrieve(PRICE_IDS.bundle),
    ])

    return NextResponse.json(
      {
        transformation: { amount: transformation.unit_amount / 100, currency: transformation.currency.toUpperCase() },
        nutrition:       { amount: nutrition.unit_amount / 100,       currency: nutrition.currency.toUpperCase() },
        bundle:          { amount: bundle.unit_amount / 100,          currency: bundle.currency.toUpperCase() },
      },
      { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch (err) {
    console.error('Failed to fetch Stripe prices:', err.message)
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
  }
}

// Called by admin to manually bust the cache (e.g. after changing price in Stripe)
export async function POST() {
  revalidateTag('stripe-prices')
  return NextResponse.json({ ok: true })
}
