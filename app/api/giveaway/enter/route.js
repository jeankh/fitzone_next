import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const kv = Redis.fromEnv()
const CONFIG_KEY = 'fitzone_giveaway'
const ENTRIES_KEY = 'fitzone_giveaway_entries'

export async function POST(request) {
  try {
    const { name, email, phone } = await request.json()

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'all_fields_required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
    }

    // Check giveaway config
    const raw = await kv.get(CONFIG_KEY)
    const config = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null
    if (!config || !config.active) {
      return NextResponse.json({ error: 'no_active_giveaway' }, { status: 400 })
    }
    if (config.endDate && new Date() > new Date(config.endDate)) {
      return NextResponse.json({ error: 'giveaway_ended' }, { status: 400 })
    }

    // Check max entries
    if (config.maxEntries) {
      const count = await kv.llen(ENTRIES_KEY)
      if (count >= config.maxEntries) {
        return NextResponse.json({ error: 'entries_full' }, { status: 400 })
      }
    }

    // Duplicate check by email (first 1000 entries)
    const existing = await kv.lrange(ENTRIES_KEY, 0, 999)
    const duplicate = (existing || []).some(item => {
      try {
        const entry = typeof item === 'string' ? JSON.parse(item) : item
        return entry?.email?.toLowerCase() === email.toLowerCase()
      } catch { return false }
    })
    if (duplicate) {
      return NextResponse.json({ error: 'already_entered' }, { status: 400 })
    }

    // Save entry
    const entry = { name: name.trim(), email: email.trim(), phone: phone.trim(), enteredAt: new Date().toISOString() }
    await kv.lpush(ENTRIES_KEY, JSON.stringify(entry))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
