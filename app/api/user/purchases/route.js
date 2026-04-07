import { NextResponse } from 'next/server'
import { verifyUserToken, getUserPurchases } from '../../../../src/lib/user-auth'

export async function GET(request) {
  try {
    const token = request.cookies.get('fitzone_user_token')?.value
    if (!token) return NextResponse.json({ purchases: [] })

    const payload = await verifyUserToken(token)
    if (!payload) return NextResponse.json({ purchases: [] })

    const purchases = await getUserPurchases(payload.userId)
    return NextResponse.json({ purchases })
  } catch {
    return NextResponse.json({ purchases: [] })
  }
}
