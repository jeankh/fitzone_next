import { NextResponse } from 'next/server'
import { createUser, signUserToken, getUserCookieOptions } from '../../../../src/lib/user-auth'
import { validateOrigin } from '../../../../src/lib/csrf'

export async function POST(request) {
  if (!validateOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { name, email, password, phone } = await request.json()

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const user = await createUser({ name: name.trim(), email, password, phone })
    if (!user) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
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
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
