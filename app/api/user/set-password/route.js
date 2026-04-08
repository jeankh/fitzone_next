import { NextResponse } from 'next/server'
import { verifyUserToken, setUserPassword } from '../../../../src/lib/user-auth'

export async function POST(request) {
  try {
    const token = request.cookies.get('fitzone_user_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyUserToken(token)
    if (!payload?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { password } = await request.json()
    if (!password || password.length < 8 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
      return NextResponse.json({ error: 'Password must be 8+ chars with at least one letter and one number' }, { status: 400 })
    }

    await setUserPassword(payload.email, password)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Set password error:', err.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
