import { NextResponse } from 'next/server'
import { getStripe } from '../../../../src/lib/stripe'
import { getOrCreateUser, addUserPurchase, createMagicToken } from '../../../../src/lib/user-auth'
import { getRedis } from '../../../../src/lib/redis'
import { getFromEmail, getResend } from '../../../../src/lib/email'

const PURCHASES_KEY = 'fitzone_purchases'

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

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
            const subject = lang === 'ar' ? 'حسابك جاهز - FitZone' : 'Your Account is Ready - FitZone'
            const html = lang === 'ar'
              ? `<div dir="rtl" style="font-family:system-ui;max-width:480px;margin:0 auto;padding:24px;color:#fff;background:#0a0a0a;border-radius:16px">
                  <h2 style="color:#ef4444;margin-bottom:16px">🎉 مرحباً ${escapeHtml(user.name)}!</h2>
                  <p style="color:#ccc">تم إنشاء حسابك تلقائياً عند شرائك. يمكنك الآن متابعة مشترياتك وتحميل برامجك.</p>
                  <a href="${magicUrl}" style="display:inline-block;background:#ef4444;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;margin:20px 0">فتح حسابي</a>
                  <p style="color:#666;font-size:11px;margin-top:12px">هذا الرابط صالح لمدة 15 دقيقة.</p>
                </div>`
              : `<div style="font-family:system-ui;max-width:480px;margin:0 auto;padding:24px;color:#fff;background:#0a0a0a;border-radius:16px">
                  <h2 style="color:#ef4444;margin-bottom:16px">🎉 Welcome ${escapeHtml(user.name)}!</h2>
                  <p style="color:#ccc">An account has been created for you with your purchase. You can now track your purchases and download your programs.</p>
                  <a href="${magicUrl}" style="display:inline-block;background:#ef4444;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;margin:20px 0">Open My Account</a>
                  <p style="color:#666;font-size:11px;margin-top:12px">This link expires in 15 minutes.</p>
                </div>`

            await (await getResend()).emails.send({
              from: getFromEmail(),
              to: buyerEmail,
              subject,
              html,
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
