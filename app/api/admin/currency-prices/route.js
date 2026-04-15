import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { validateOrigin } from '../../../../src/lib/csrf'

const kv = Redis.fromEnv()
const KV_KEY = 'fitzone_currency_prices'
const CACHE_TAG = 'currency-prices'
const VALID_KEY = /^(SAR|USD|EUR|GBP|AED|KWD|QAR|BHD|EGP)_(transformation|nutrition|bundle)$/

export async function GET() {
  try {
    const data = await kv.hgetall(KV_KEY)
    return NextResponse.json(
      data || {},
      { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch {
    return NextResponse.json({})
  }
}

export async function POST(request) {
  if (!validateOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const body = await request.json()
    const toSet = {}
    const toDelete = []
    for (const [key, val] of Object.entries(body)) {
      if (!VALID_KEY.test(key)) continue
      if (val === '' || val === null || val === undefined) {
        toDelete.push(key)
      } else {
        toSet[key] = String(Number(val))
      }
    }
    if (Object.keys(toSet).length > 0) await kv.hset(KV_KEY, toSet)
    for (const k of toDelete) await kv.hdel(KV_KEY, k)
    revalidateTag(CACHE_TAG)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
