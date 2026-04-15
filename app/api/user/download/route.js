import { NextResponse } from 'next/server'
import { verifyUserToken, getUserPurchases } from '../../../../src/lib/user-auth'
import { getRedis } from '../../../../src/lib/redis'

export const dynamic = 'force-dynamic'

const KV_KEY = 'fitzone_ebooks'
const VALID_IDS = ['transformation', 'nutrition', 'bundle']

export async function GET(request) {
  try {
    const token = request.cookies.get('fitzone_user_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyUserToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product')
    if (!VALID_IDS.includes(productId)) return NextResponse.json({ error: 'Invalid product' }, { status: 400 })

    // Verify the user has purchased this product
    const purchases = await getUserPurchases(payload.userId)
    const hasPurchased = purchases.some(p => {
      const items = (p.items || '').split(',').map(s => s.trim())
      return items.includes(productId) || items.includes('bundle')
    })

    if (!hasPurchased) return NextResponse.json({ error: 'Not purchased' }, { status: 403 })

    // Get the ebook URL from Redis
    const kv = getRedis()
    const ebooks = await kv.hgetall(KV_KEY)
    const url = ebooks?.[productId]

    if (!url) return NextResponse.json({ error: 'File not available yet' }, { status: 404 })

    return NextResponse.json({ url })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
