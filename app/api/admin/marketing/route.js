import { NextResponse } from 'next/server'
import { sanitizeObject } from '../../../../src/lib/sanitize'
import { validateOrigin } from '../../../../src/lib/csrf'
import { MARKETING_DEFAULTS, normalizeMarketingData, normalizeWhatsApp, parseStoredSocials } from '../../../../src/lib/marketing'
import { getRedis } from '../../../../src/lib/redis'

const KV_KEY = 'fitzone_marketing'

const DEFAULTS = MARKETING_DEFAULTS

const ALLOWED = ['whatsapp', 'socials']

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
}

export async function GET() {
  try {
    const kv = getRedis()
    const data = await kv.hgetall(KV_KEY)
    const normalized = normalizeMarketingData(data || {})
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
    const updates = sanitizeObject(body, ['whatsapp'])
    if (updates.whatsapp !== undefined) updates.whatsapp = normalizeWhatsApp(updates.whatsapp)
    if (body.socials !== undefined) updates.socials = JSON.stringify(parseStoredSocials(body.socials))
    if (Object.keys(updates).length > 0) {
      await kv.hset(KV_KEY, updates)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
