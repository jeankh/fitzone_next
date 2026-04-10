import { NextResponse } from 'next/server'
import { sanitizeObject } from '../../../../src/lib/sanitize'
import { validateOrigin } from '../../../../src/lib/csrf'
import { MARKETING_DEFAULTS, normalizeMarketingValue } from '../../../../src/lib/marketing'
import { getRedis } from '../../../../src/lib/redis'

const KV_KEY = 'fitzone_marketing'

const DEFAULTS = MARKETING_DEFAULTS

const ALLOWED = ['whatsapp', 'twitter', 'instagram', 'youtube',
                 'whatsapp_visible', 'twitter_visible', 'instagram_visible', 'youtube_visible']

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
}

export async function GET() {
  try {
    const kv = getRedis()
    const data = await kv.hgetall(KV_KEY)
    // Upstash hgetall returns booleans for 'true'/'false' strings — normalize back to strings
    const normalized = {}
    for (const [k, v] of Object.entries(data || {})) normalized[k] = normalizeMarketingValue(k, v)
    return NextResponse.json({ ...DEFAULTS, ...normalized }, { headers: NO_STORE_HEADERS })
  } catch {
    return NextResponse.json(DEFAULTS, { headers: NO_STORE_HEADERS })
  }
}

export async function POST(request) {
  if (!validateOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const kv = getRedis()
    const body = await request.json()
    const updates = sanitizeObject(body, ALLOWED)
    for (const key of ALLOWED) {
      if (updates[key] !== undefined) updates[key] = normalizeMarketingValue(key, updates[key])
    }
    if (Object.keys(updates).length > 0) {
      await kv.hset(KV_KEY, updates)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
