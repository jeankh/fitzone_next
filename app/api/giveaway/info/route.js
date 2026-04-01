import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const kv = Redis.fromEnv()
const CONFIG_KEY  = 'fitzone_giveaway'
const ENTRIES_KEY = 'fitzone_giveaway_entries'

// Public endpoint — returns config (no private entry data) + total entry count
export async function GET() {
  try {
    const [raw, count] = await Promise.all([
      kv.get(CONFIG_KEY),
      kv.llen(ENTRIES_KEY),
    ])
    const config = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null
    return NextResponse.json({ config, totalCount: count || 0 })
  } catch {
    return NextResponse.json({ config: null, totalCount: 0 })
  }
}
