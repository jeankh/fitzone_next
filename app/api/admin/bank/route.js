import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const kv = Redis.fromEnv()
const KV_KEY = 'fitzone_bank'
const DEFAULTS = {
  bankName_ar: 'الراجحي',
  bankName_en: 'Al Rajhi Bank',
  iban: 'SA0000000000000000000',
  beneficiaryName_ar: 'HADIDI',
  beneficiaryName_en: 'HADIDI',
}
const ALLOWED = Object.keys(DEFAULTS)

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
      if (key in body) updates[key] = String(body[key])
    }
    if (Object.keys(updates).length > 0) await kv.hset(KV_KEY, updates)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
