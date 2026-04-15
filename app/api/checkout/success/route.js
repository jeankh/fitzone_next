import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

import { getStripe } from '../../../../src/lib/stripe'
import { getOrCreateUser, addUserPurchase, createMagicToken } from '../../../../src/lib/user-auth'
import { getRedis } from '../../../../src/lib/redis'
import { getFromEmail, getResend } from '../../../../src/lib/email'
import { buildAccountCreatedEmail } from '../../../../src/lib/emails'

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

    // Auto-create account and link purchase
    let accountCreated = false
    try {
      const buyerEmail = session.customer_email
      if (buyerEmail) {
        const { user, isNew } = await getOrCreateUser({
          name: session.metadata?.name || buyerEmail.split('@')[0],
          email: buyerEmail,
          phone: session.metadata?.phone || '',
        })

        const purchase = {
          id: session.id,
          email: buyerEmail || '',
          phone: session.metadata?.phone || '',
          name: session.metadata?.name || '',
          items: session.metadata?.items || '',
          amount: session.amount_total || 0,
          currency: session.currency || 'sar',
          status: session.payment_status || 'paid',
          createdAt: new Date().toISOString(),
        }
        await addUserPurchase(user.id, purchase)

        // Also store in admin purchases list
        try {
          const kv = getRedis()
          const existing = await kv.lrange(PURCHASES_KEY, 0, -1)
          const alreadyStored = existing.some(item => {
            try { return JSON.parse(item).id === session.id } catch { return false }
          })
          if (!alreadyStored) {
            await kv.lpush(PURCHASES_KEY, JSON.stringify(purchase))
          }
        } catch {}

        accountCreated = isNew

        // Send magic link email for new accounts
        if (isNew) {
          const magicToken = await createMagicToken(user.id)
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get('host')}`
          const magicUrl = `${baseUrl}/api/user/verify-magic?token=${magicToken}`
          const lang = session.metadata?.lang || 'ar'

          try {
            const template = buildAccountCreatedEmail({ name: user.name, magicUrl, lang })

            await (await getResend()).emails.send({
              from: getFromEmail(),
              to: buyerEmail,
              subject: template.subject,
              html: template.html,
            })
          } catch (emailError) {
            console.error('Account email error:', emailError.message)
          }
        }
      }
    } catch (e) {
      console.error('Failed to process account:', e.message)
    }

    // Return minimal safe data (no PII, no passwords)
    return NextResponse.json({
      id: session.id,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      payment_status: session.payment_status,
      accountCreated,
    })
  } catch (err) {
    console.error('Session retrieve error:', err.message)
    return NextResponse.json({ error: 'Failed to retrieve order details' }, { status: 500 })
  }
}
