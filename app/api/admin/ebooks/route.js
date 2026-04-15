import { NextResponse } from 'next/server'
import { getRedis } from '../../../../src/lib/redis'

export const dynamic = 'force-dynamic'

const KV_KEY = 'fitzone_ebooks'

export async function GET() {
  try {
    const kv = getRedis()
    const data = await kv.hgetall(KV_KEY)
    return NextResponse.json(data || {})
  } catch {
    return NextResponse.json({})
  }
}
