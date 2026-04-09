import { NextResponse } from 'next/server'
import { getUserByEmail, createMagicToken } from '../../../../src/lib/user-auth'
import { apiError } from '../../../../src/lib/api-utils'
import { validateOrigin } from '../../../../src/lib/csrf'

async function sendMagicEmail({ email, name, magicUrl, lang }) {
  const { default: Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const subject = lang === 'ar' ? 'رابط الدخول إلى حسابك - FitZone' : 'Your Login Link - FitZone'
  const html = lang === 'ar'
    ? `<div dir="rtl" style="font-family:system-ui;max-width:480px;margin:0 auto;padding:24px;color:#fff;background:#0a0a0a;border-radius:16px">
        <h2 style="color:#ef4444;margin-bottom:16px">مرحباً ${(name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')}!</h2>
        <p style="color:#ccc">اضغط على الزر أدناه لتسجيل الدخول إلى حسابك:</p>
        <a href="${magicUrl}" style="display:inline-block;background:#ef4444;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;margin:20px 0">تسجيل الدخول</a>
        <p style="color:#666;font-size:11px;margin-top:12px">هذا الرابط صالح لمدة 15 دقيقة. إذا لم تطلب هذا الرابط، تجاهل هذه الرسالة.</p>
      </div>`
    : `<div style="font-family:system-ui;max-width:480px;margin:0 auto;padding:24px;color:#fff;background:#0a0a0a;border-radius:16px">
        <h2 style="color:#ef4444;margin-bottom:16px">Hello ${(name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')}!</h2>
        <p style="color:#ccc">Click the button below to sign in to your account:</p>
        <a href="${magicUrl}" style="display:inline-block;background:#ef4444;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;margin:20px 0">Sign In</a>
        <p style="color:#666;font-size:11px;margin-top:12px">This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
      </div>`

  return resend.emails.send({ from: process.env.FROM_EMAIL || 'orders@fitzone.com', to: email, subject, html })
}

export async function POST(request) {
  if (!validateOrigin(request)) return apiError('Forbidden', 403)
  try {
    const { email } = await request.json()
    if (!email?.trim()) return apiError('Email is required', 400)

    const raw = await getUserByEmail(email)
    if (!raw) {
      return NextResponse.json({ ok: true })
    }

    const user = typeof raw === 'string' ? JSON.parse(raw) : raw
    const token = await createMagicToken(user.id)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${request.headers.get('host')}`
    const magicUrl = `${baseUrl}/api/user/verify-magic?token=${token}`

    try { await sendMagicEmail({ email, name: user.name, magicUrl, lang: 'ar' }) } catch (e) { console.error('Magic email error:', e.message) }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Send magic error:', err.message)
    return apiError('Server error', 500)
  }
}
