import { NextResponse } from 'next/server'
import { getUserByEmail, signUserToken, getUserCookieOptions } from '../../../../src/lib/user-auth'
import { validateOrigin } from '../../../../src/lib/csrf'

export async function POST(request) {
  if (!validateOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { email, password } = await request.json()

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const raw = await getUserByEmail(email)
    if (!raw) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const user = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = await signUserToken({ userId: user.id, email: user.email, role: 'user' })
    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    })
    response.cookies.set(getUserCookieOptions(token))
    return response
  } catch (err) {
    console.error('Login error:', err.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
