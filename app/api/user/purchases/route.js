import { NextResponse } from 'next/server'
import { verifyUserToken, getUserPurchases, parseItems } from '../../../../src/lib/user-auth'

export async function GET(request) {
  try {
    const token = request.cookies.get('fitzone_user_token')?.value
    if (!token) return NextResponse.json({ purchases: [] })

    const payload = await verifyUserToken(token)
    if (!payload) return NextResponse.json({ purchases: [] })

    const purchases = await getUserPurchases(payload.userId)
    // Normalize items to an array so the client doesn't have to know about
    // the legacy storage shapes (comma string, JSON string, or array).
    const normalized = purchases.map(p => ({ ...p, items: parseItems(p?.items) }))
    return NextResponse.json({ purchases: normalized })
  } catch {
    return NextResponse.json({ purchases: [] })
  }
}
