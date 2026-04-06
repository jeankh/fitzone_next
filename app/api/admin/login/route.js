import { NextResponse } from 'next/server'
import { signToken, getCookieOptions } from '../../../../src/lib/auth'

export async function POST(req) {
  try {
    const { password } = await req.json()

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = await signToken()

    const res = NextResponse.json({ ok: true })
    res.cookies.set(getCookieOptions().name, token, getCookieOptions())
    return res
  } catch (err) {
    console.error('Login error:', err.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
