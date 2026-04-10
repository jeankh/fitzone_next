import { NextResponse } from 'next/server'
import { getUserByEmail, createMagicToken } from '../../../../src/lib/user-auth'
import { apiError } from '../../../../src/lib/api-utils'
import { validateOrigin } from '../../../../src/lib/csrf'
import { getFromEmail, getResend } from '../../../../src/lib/email'
import { buildMagicLinkEmail } from '../../../../src/lib/emails'

async function sendMagicEmail({ email, name, magicUrl, lang }) {
  const resend = await getResend()
  const template = buildMagicLinkEmail({ email, name, magicUrl, lang })
  return resend.emails.send({ from: getFromEmail(), to: email, subject: template.subject, html: template.html })
}

export async function POST(request) {
  if (!validateOrigin(request)) return apiError('Forbidden', 403)
  try {
    const { email, lang } = await request.json()
    if (!email?.trim()) return apiError('Email is required', 400)

    const raw = await getUserByEmail(email)
    if (!raw) {
      return NextResponse.json({ ok: true })
    }

    const user = typeof raw === 'string' ? JSON.parse(raw) : raw
    const token = await createMagicToken(user.id)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${request.headers.get('host')}`
    const magicUrl = `${baseUrl}/api/user/verify-magic?token=${token}`

    await sendMagicEmail({ email, name: user.name, magicUrl, lang: lang === 'en' ? 'en' : 'ar' })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Send magic error:', err.message)
    return apiError('Server error', 500)
  }
}
