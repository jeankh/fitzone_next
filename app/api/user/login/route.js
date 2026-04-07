import { NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword, signUserToken, getUserCookieOptions, checkLoginAttempts, resetLoginAttempts } from '../../../../src/lib/user-auth'
import { validateOrigin } from '../../../../src/lib/csrf'
import { apiError } from '../../../../src/lib/api-utils'

export async function POST(request) {
  if (!validateOrigin(request)) return apiError('Forbidden', 403)
  try {
    const { email, password } = await request.json()

    if (!email?.trim() || !password) {
      return apiError('Email and password are required', 400)
    }

    const allowed = await checkLoginAttempts(email)
    if (!allowed) {
      return apiError('Too many attempts. Try again in 15 minutes.', 429)
    }

    const raw = await getUserByEmail(email)
    if (!raw) {
      return apiError('Invalid email or password', 401)
    }

    const user = typeof raw === 'string' ? JSON.parse(raw) : raw
    const valid = await verifyPassword(user, password)
    if (!valid) {
      return apiError('Invalid email or password', 401)
    }

    await resetLoginAttempts(email)

    const token = await signUserToken({ userId: user.id, email: user.email, role: 'user' })
    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    })
    response.cookies.set(getUserCookieOptions(token))
    return response
  } catch (err) {
    console.error('Login error:', err.message)
    return apiError('Server error', 500)
  }
}
