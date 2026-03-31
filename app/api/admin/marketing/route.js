import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const kv = Redis.fromEnv()
const KV_KEY = 'fitzone_marketing'

const DEFAULTS = {
  whatsapp: '966500000000',
  twitter: 'https://x.com/',
  instagram: 'https://instagram.com/',
  youtube: 'https://youtube.com/',
}

export async function GET() {
  try {
    const data = await kv.hgetall(KV_KEY)
    return NextResponse.json({ ...DEFAULTS, ...data })
  } catch {
    return NextResponse.json(DEFAULTS)
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const allowed = ['whatsapp', 'twitter', 'instagram', 'youtube']
    const updates = {}
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key]
    }
    if (Object.keys(updates).length > 0) {
      await kv.hset(KV_KEY, updates)
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
