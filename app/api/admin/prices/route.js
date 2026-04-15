import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { validateOrigin } from '../../../../src/lib/csrf'

const kv = Redis.fromEnv()
const KV_KEY = 'fitzone_prices'
const CACHE_TAG = 'prices'

const DEFAULTS = { transformation: 79, nutrition: 79, bundle: 158 }

export async function GET() {
  try {
    const data = await kv.hgetall(KV_KEY)
    return NextResponse.json(
      {
        transformation: Number(data?.transformation ?? DEFAULTS.transformation),
        nutrition: Number(data?.nutrition ?? DEFAULTS.nutrition),
        bundle: Number(data?.bundle ?? DEFAULTS.bundle),
      },
      { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch {
    return NextResponse.json(DEFAULTS)
  }
}

export async function POST(request) {
  if (!validateOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const { transformation, nutrition, bundle } = await request.json()
    if (transformation) await kv.hset(KV_KEY, { transformation: Number(transformation) })
    if (nutrition) await kv.hset(KV_KEY, { nutrition: Number(nutrition) })
    if (bundle) await kv.hset(KV_KEY, { bundle: Number(bundle) })
    revalidateTag(CACHE_TAG)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
