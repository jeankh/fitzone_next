import { NextResponse } from 'next/server'
import { getRedis } from '../../../src/lib/redis'

export const dynamic = 'force-dynamic'

const KV_KEY = 'fitzone_ebooks'

// TEMPORARY TEST ROUTE — REMOVE BEFORE PRODUCTION
export async function GET() {
  const kv = getRedis()
  const ebooks = await kv.hgetall(KV_KEY)
  return NextResponse.json(ebooks || {})
}
