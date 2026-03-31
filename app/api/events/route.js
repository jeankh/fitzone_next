import { Redis } from '@upstash/redis'

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})
import { NextResponse } from 'next/server'

const VALID_KEYS = ['cart_adds', 'bundle_upgrades', 'checkout_starts', 'purchases']
const KV_KEY = 'fitzone_events'

export async function GET() {
  try {
    const data = await kv.hgetall(KV_KEY)
    const counts = {}
    for (const key of VALID_KEYS) {
      counts[key] = Number(data?.[key] ?? 0)
    }
    return NextResponse.json(counts)
  } catch {
    const counts = {}
    for (const key of VALID_KEYS) counts[key] = 0
    return NextResponse.json(counts)
  }
}

export async function POST(request) {
  try {
    const { key } = await request.json()
    if (!VALID_KEYS.includes(key)) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
    }
    const newValue = await kv.hincrby(KV_KEY, key, 1)
    return NextResponse.json({ key, value: newValue })
  } catch {
    return NextResponse.json({ error: 'KV unavailable' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await kv.del(KV_KEY)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'KV unavailable' }, { status: 500 })
  }
}
