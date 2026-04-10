import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import { sanitizeObject } from '../../../../src/lib/sanitize'
import { validateOrigin } from '../../../../src/lib/csrf'
import { MARKETING_DEFAULTS, normalizeMarketingValue } from '../../../../src/lib/marketing'

const kv = Redis.fromEnv()
const KV_KEY = 'fitzone_marketing'

const DEFAULTS = MARKETING_DEFAULTS

const ALLOWED = ['whatsapp', 'twitter', 'instagram', 'youtube',
                 'whatsapp_visible', 'twitter_visible', 'instagram_visible', 'youtube_visible']

export async function GET() {
  try {
    const data = await kv.hgetall(KV_KEY)
    // Upstash hgetall returns booleans for 'true'/'false' strings — normalize back to strings
    const normalized = {}
    for (const [k, v] of Object.entries(data || {})) normalized[k] = normalizeMarketingValue(k, v)
    return NextResponse.json({ ...DEFAULTS, ...normalized })
  } catch {
    return NextResponse.json(DEFAULTS)
  }
}

export async function POST(request) {
  if (!validateOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
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
