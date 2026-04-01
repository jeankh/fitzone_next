import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

const kv = Redis.fromEnv()
const CONFIG_KEY  = 'fitzone_giveaway'
const ENTRIES_KEY = 'fitzone_giveaway_entries'

// Generate a short unique referral code
function makeCode() {
  return randomBytes(5).toString('hex') // 10-char hex
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, referredBy, optIn, _hp } = body

    // Honeypot — bots fill hidden fields, humans don't
    if (_hp && _hp.trim() !== '') {
      return NextResponse.json({ ok: true }) // silently accept to not tip off bots
    }

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

    // Duplicate check by email (first 2000 entries)
    const existing = await kv.lrange(ENTRIES_KEY, 0, 1999)
    const parsedEntries = (existing || []).map(item => {
      try { return typeof item === 'string' ? JSON.parse(item) : item } catch { return null }
    }).filter(Boolean)

    const duplicate = parsedEntries.some(e => e?.email?.toLowerCase() === email.toLowerCase())
    if (duplicate) {
      return NextResponse.json({ error: 'already_entered' }, { status: 400 })
    }

    // Validate referral code — find referrer entry
    let referrerEntry = null
    if (referredBy?.trim()) {
      referrerEntry = parsedEntries.find(e => e?.referralCode === referredBy.trim())
    }

    const referralCode = makeCode()
    const baseEntries = 1
    const bonusEntries = referrerEntry ? 1 : 0 // new entrant gets +1 for using a referral link
    const totalEntries = baseEntries + bonusEntries

    // Save new entry
    const entry = {
      name:         name.trim(),
      email:        email.trim(),
      phone:        phone.trim(),
      enteredAt:    new Date().toISOString(),
      referralCode,
      referredBy:   referrerEntry?.email || null,
      entries:      totalEntries,
      optIn:        !!optIn,
    }
    await kv.lpush(ENTRIES_KEY, JSON.stringify(entry))

    // Credit referrer with +3 bonus entries — rebuild their entry with updated count
    if (referrerEntry) {
      const updatedReferrer = { ...referrerEntry, entries: (referrerEntry.entries || 1) + 3, referrals: (referrerEntry.referrals || 0) + 1 }
      // Remove old entry and re-push updated one
      const allItems = await kv.lrange(ENTRIES_KEY, 0, -1)
      const rebuilt = allItems.map(item => {
        try {
          const parsed = typeof item === 'string' ? JSON.parse(item) : item
          if (parsed?.email?.toLowerCase() === referrerEntry.email.toLowerCase()) {
            return JSON.stringify(updatedReferrer)
          }
          return item
        } catch { return item }
      })
      await kv.del(ENTRIES_KEY)
      for (let i = rebuilt.length - 1; i >= 0; i--) {
        await kv.lpush(ENTRIES_KEY, rebuilt[i])
      }
    }

    const totalCount = await kv.llen(ENTRIES_KEY)

    return NextResponse.json({
      ok: true,
      referralCode,
      totalEntries,
      totalCount,
      bonusFromReferral: bonusEntries > 0,
    })
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
