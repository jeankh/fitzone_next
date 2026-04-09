import { NextResponse } from 'next/server'
import { getUserByEmail, createPasswordResetToken } from '../../../../src/lib/user-auth'
import { apiError } from '../../../../src/lib/api-utils'
import { validateOrigin } from '../../../../src/lib/csrf'

export async function POST(request) {
  if (!validateOrigin(request)) return apiError('Forbidden', 403)
  try {
    const { email } = await request.json()
    if (!email?.trim()) return apiError('Email is required', 400)

    const raw = await getUserByEmail(email)
    if (!raw) return NextResponse.json({ ok: true })

    const user = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!user.hasPassword) return NextResponse.json({ ok: true })

    const token = await createPasswordResetToken(user.id)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${request.headers.get('host')}`
    const resetUrl = `${baseUrl}/account/reset-password?token=${token}`

    try {
      const { default: Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      const subject = 'إعادة تعيين كلمة المرور - FitZone'
      const html = `<div dir="rtl" style="font-family:system-ui;max-width:480px;margin:0 auto;padding:24px;color:#fff;background:#0a0a0a;border-radius:16px">
        <h2 style="color:#ef4444;margin-bottom:16px">إعادة تعيين كلمة المرور</h2>
        <p style="color:#ccc">لقد تلقينا طلباً لإعادة تعيين كلمة مرورك. اضغط على الزر أدناه لاختيار كلمة مرور جديدة:</p>
        <a href="${resetUrl}" style="display:inline-block;background:#ef4444;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:bold;margin:20px 0">إعادة تعيين كلمة المرور</a>
        <p style="color:#666;font-size:11px;margin-top:12px">هذا الرابط صالح لمدة 15 دقيقة. إذا لم تطلب هذا التغيير، تجاهل هذه الرسالة.</p>
      </div>`

      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'orders@fitzone.com',
        to: email,
        subject,
        html,
      })
    } catch (e) { console.error('Reset email error:', e.message) }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Send reset error:', err.message)
    return apiError('Server error', 500)
  }
}
