import { NextResponse } from 'next/server'
import { getStripe } from '../../../../src/lib/stripe'
import { Redis } from '@upstash/redis'
import { verifyUserToken, addUserPurchase, getOrCreateUser, signUserToken, getUserCookieOptions } from '../../../../src/lib/user-auth'

const kv = Redis.fromEnv()
const PURCHASES_KEY = 'fitzone_purchases'

function getResend() {
  const { Resend } = require('resend')
  return new Resend(process.env.RESEND_API_KEY)
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

    let accountCreated = null

    try {
      const existing = await kv.lrange(PURCHASES_KEY, 0, -1)
      const alreadyStored = existing.some(item => {
        try { return JSON.parse(item).id === session.id } catch { return false }
      })

      if (!alreadyStored) {
        const { items, phone, name, lang } = session.metadata || {}
        const purchase = {
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
        }
        await kv.lpush(PURCHASES_KEY, JSON.stringify(purchase))

        // Auto-create account for the buyer if they don't have one
        const buyerEmail = session.customer_email
        let userId = null

        if (buyerEmail) {
          const { user, isNew, generatedPassword } = await getOrCreateUser({
            name: name || buyerEmail.split('@')[0],
            email: buyerEmail,
            phone: phone || '',
          })

          userId = user.id
          await addUserPurchase(user.id, purchase)

          if (isNew) {
            accountCreated = { email: buyerEmail, password: generatedPassword }

            // Send credentials email
            try {
              const isAr = lang === 'ar'
              const subject = isAr ? 'تم إنشاء حسابك - FitZone' : 'Your Account Has Been Created - FitZone'
              const html = isAr
                ? `<div dir="rtl" style="font-family:system-ui;max-width:480px;margin:0 auto;padding:24px;color:#fff;background:#0a0a0a;border-radius:16px">
                    <h2 style="color:#ef4444;margin-bottom:16px">🎉 تم إنشاء حسابك!</h2>
                    <p style="color:#ccc">لقد أنشأنا لك حساباً تلقائياً عند شرائك. يمكنك الآن متابعة مشترياتك وتحميل برامجك.</p>
                    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin:16px 0">
                      <p style="color:#999;font-size:12px;margin:0 0 8px">بيانات الدخول:</p>
                      <p style="color:#fff;font-size:14px;margin:0">البريد: <strong>${buyerEmail}</strong></p>
                      <p style="color:#fff;font-size:14px;margin:4px 0 0">كلمة المرور: <strong style="color:#ef4444">${generatedPassword}</strong></p>
                    </div>
                    <a href="https://www.fitzoneapp.com/account/login" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin-top:8px">تسجيل الدخول</a>
                  </div>`
                : `<div style="font-family:system-ui;max-width:480px;margin:0 auto;padding:24px;color:#fff;background:#0a0a0a;border-radius:16px">
                    <h2 style="color:#ef4444;margin-bottom:16px">🎉 Your Account Has Been Created!</h2>
                    <p style="color:#ccc">We automatically created an account for you with your purchase. You can now track your purchases and download your programs.</p>
                    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin:16px 0">
                      <p style="color:#999;font-size:12px;margin:0 0 8px">Your login credentials:</p>
                      <p style="color:#fff;font-size:14px;margin:0">Email: <strong>${buyerEmail}</strong></p>
                      <p style="color:#fff;font-size:14px;margin:4px 0 0">Password: <strong style="color:#ef4444">${generatedPassword}</strong></p>
                    </div>
                    <a href="https://www.fitzoneapp.com/account/login" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin-top:8px">Sign In</a>
                  </div>`

              getResend().emails.send({
                from: process.env.FROM_EMAIL || 'orders@fitzone.com',
                to: buyerEmail,
                subject,
                html,
              }).catch(() => {})
            } catch {}
          }
        }

        // Also store for logged-in user (if different from buyer)
        if (!userId) {
          const userToken = req.cookies.get('fitzone_user_token')?.value
          if (userToken) {
            const payload = await verifyUserToken(userToken)
            if (payload?.userId) {
              await addUserPurchase(payload.userId, purchase)
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to store purchase:', e.message)
    }

    const response = NextResponse.json({
      id: session.id,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      payment_status: session.payment_status,
      accountCreated,
    })

    // Auto-login the user
    if (accountCreated && session.customer_email) {
      const raw = await getOrCreateUser({ name: (session.metadata?.name || ''), email: session.customer_email, phone: '' })
      const token = await signUserToken({ userId: raw.user.id, email: raw.user.email, role: 'user' })
      response.cookies.set(getUserCookieOptions(token))
    }

    return response
  } catch (err) {
    console.error('Session retrieve error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
