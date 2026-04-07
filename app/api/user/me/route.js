import { NextResponse } from 'next/server'
import { verifyUserToken, getUserByEmail } from '../../../../src/lib/user-auth'

export async function GET(request) {
  try {
    const token = request.cookies.get('fitzone_user_token')?.value
    if (!token) return NextResponse.json({ user: null })

    const payload = await verifyUserToken(token)
    if (!payload) return NextResponse.json({ user: null })

    const raw = await getUserByEmail(payload.email)
    if (!raw) return NextResponse.json({ user: null })

    const user = typeof raw === 'string' ? JSON.parse(raw) : raw
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt },
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
