import { NextResponse } from 'next/server'
import { getUserByEmail, createPasswordResetToken } from '../../../../src/lib/user-auth'
import { apiError } from '../../../../src/lib/api-utils'
import { validateOrigin } from '../../../../src/lib/csrf'
import { getFromEmail, getResend } from '../../../../src/lib/email'
import { buildResetPasswordEmail } from '../../../../src/lib/emails'

export async function POST(request) {
  if (!validateOrigin(request)) return apiError('Forbidden', 403)
  try {
    const { email, lang } = await request.json()
    if (!email?.trim()) return apiError('Email is required', 400)

    const raw = await getUserByEmail(email)
    if (!raw) return NextResponse.json({ ok: true })

    const user = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!user.hasPassword) return NextResponse.json({ ok: true })

    const token = await createPasswordResetToken(user.id)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${request.headers.get('host')}`
    const resetUrl = `${baseUrl}/account/reset-password?token=${token}`

    const resend = await getResend()
    const template = buildResetPasswordEmail({ resetUrl, lang: lang === 'en' ? 'en' : 'ar' })

    await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: template.subject,
      html: template.html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Send reset error:', err.message)
    return apiError('Server error', 500)
  }
}
