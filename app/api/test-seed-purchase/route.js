import { NextResponse } from 'next/server'
import { getRedis } from '../../../src/lib/redis'

export const dynamic = 'force-dynamic'

// TEMPORARY TEST ROUTE — REMOVE AFTER TESTING
export async function GET() {
  const kv = getRedis()
  const email = 'jankhoja2@gmail.com'

  // Find user by email
  const raw = await kv.hget('fitzone_users', email)
  if (!raw) return NextResponse.json({ error: 'User not found' })
  const userData = typeof raw === 'string' ? JSON.parse(raw) : raw
  const userId = userData.id
  if (!userId) return NextResponse.json({ error: 'No user ID' })

  const purchase = {
    id: 'test_' + Date.now(),
    items: 'bundle',
    amount: 15800,
    currency: 'sar',
    status: 'paid',
    createdAt: new Date().toISOString(),
  }

  await kv.lpush(`fitzone_user_purchases_${userId}`, JSON.stringify(purchase))
  return NextResponse.json({ ok: true, purchase })
}
