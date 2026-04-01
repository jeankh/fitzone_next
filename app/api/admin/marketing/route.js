import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const kv = Redis.fromEnv()
const KV_KEY = 'fitzone_marketing'

const DEFAULTS = {
  whatsapp: '966500000000',
  twitter: 'https://x.com/',
  instagram: 'https://instagram.com/',
  youtube: 'https://youtube.com/',
  whatsapp_visible: 'true',
  twitter_visible:  'true',
  instagram_visible:'true',
  youtube_visible:  'true',
}

const ALLOWED = ['whatsapp', 'twitter', 'instagram', 'youtube',
                 'whatsapp_visible', 'twitter_visible', 'instagram_visible', 'youtube_visible']

export async function GET() {
  try {
    const data = await kv.hgetall(KV_KEY)
    return NextResponse.json({ ...DEFAULTS, ...(data || {}) })
  } catch {
    return NextResponse.json(DEFAULTS)
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const updates = {}
    for (const key of ALLOWED) {
      if (body[key] !== undefined) updates[key] = String(body[key])
    }
    if (Object.keys(updates).length > 0) {
      await kv.hset(KV_KEY, updates)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
