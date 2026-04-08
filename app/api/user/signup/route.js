import { NextResponse } from 'next/server'
import { createUser, signUserToken, getUserCookieOptions } from '../../../../src/lib/user-auth'
import { validateOrigin } from '../../../../src/lib/csrf'
import { apiError } from '../../../../src/lib/api-utils'

export async function POST(request) {
  if (!validateOrigin(request)) return apiError('Forbidden', 403)
  try {
    const { name, email, password, phone } = await request.json()

    if (!name?.trim() || !email?.trim() || !password) {
      return apiError('All fields are required', 400)
    }
    if (password.length < 8 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
      return apiError('Password must be 8+ characters with at least one letter and one number', 400)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiError('Invalid email', 400)
    }
    if (phone && !/^\+?[0-9]{7,15}$/.test(phone.replace(/[\s\-()]/g, ''))) {
      return apiError('Invalid phone number', 400)
    }

    const user = await createUser({ name: name.trim(), email, password, phone })
    if (!user) {
      return apiError('Email already registered', 409)
    }

    const token = await signUserToken({ userId: user.id, email: user.email, role: 'user' })
    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    })
    response.cookies.set(getUserCookieOptions(token))
    return response
  } catch (err) {
    console.error('Signup error:', err.message)
    return apiError('Server error', 500)
  }
}
