import { NextResponse } from 'next/server'
import { verifyUserToken } from '../../../../src/lib/user-auth'
import { getRedis } from '../../../../src/lib/redis'

const CART_PREFIX = 'fitzone_cart_'

export async function GET(request) {
  try {
    const token = request.cookies.get('fitzone_user_token')?.value
    if (!token) return NextResponse.json({ cart: [] })

    const payload = await verifyUserToken(token)
    if (!payload?.userId) return NextResponse.json({ cart: [] })

    const kv = getRedis()
    const raw = await kv.get(`${CART_PREFIX}${payload.userId}`)
    const cart = Array.isArray(raw) ? raw : []
    return NextResponse.json({ cart })
  } catch {
    return NextResponse.json({ cart: [] })
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get('fitzone_user_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyUserToken(token)
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { cart } = await request.json()
    if (!Array.isArray(cart)) return NextResponse.json({ error: 'Invalid cart' }, { status: 400 })

    const validItems = cart.filter(id => ['transformation', 'nutrition', 'bundle'].includes(id))
    const kv = getRedis()
    await kv.set(`${CART_PREFIX}${payload.userId}`, JSON.stringify(validItems), { ex: 90 * 24 * 60 * 60 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Cart save error:', err.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
