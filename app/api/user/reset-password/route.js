import { NextResponse } from 'next/server'
import { consumePasswordResetToken, resetUserPassword } from '../../../../src/lib/user-auth'
import { apiError } from '../../../../src/lib/api-utils'
import { validateOrigin } from '../../../../src/lib/csrf'

export async function POST(request) {
  if (!validateOrigin(request)) return apiError('Forbidden', 403)
  try {
    const { token, password } = await request.json()

    if (!token || !password) return apiError('Token and password are required', 400)
    if (password.length < 8 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
      return apiError('Password must be 8+ chars with at least one letter and one number', 400)
    }

    const userId = await consumePasswordResetToken(token)
    if (!userId) return apiError('Invalid or expired reset link', 400)

    await resetUserPassword(userId, password)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Reset password error:', err.message)
    return apiError('Server error', 500)
  }
}
