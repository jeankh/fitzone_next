import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { validateOrigin } from '../../../../src/lib/csrf'
import { sanitize } from '../../../../src/lib/sanitize'

const kv = Redis.fromEnv()
const CONFIG_KEY  = 'fitzone_giveaway'
const ENTRIES_KEY = 'fitzone_giveaway_entries'
const EMAIL_SET   = 'fitzone_giveaway_emails'

function makeCode() {
  return randomBytes(5).toString('hex')
}

export async function POST(request) {
  if (!validateOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const body = await request.json()
    const { name, email, phone, referredBy, optIn, _hp } = body

    if (_hp && _hp.trim() !== '') {
      return NextResponse.json({ ok: true })
    }

    if (!name?.trim() || !email?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'all_fields_required' }, { status: 400 })
    }
    const cleanName = sanitize(name).slice(0, 100)
    const cleanEmail = sanitize(email).slice(0, 200)
    const cleanPhone = sanitize(phone).slice(0, 30)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
    }

    const raw = await kv.get(CONFIG_KEY)
    const config = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null
    if (!config || !config.active) {
      return NextResponse.json({ error: 'no_active_giveaway' }, { status: 400 })
    }
    if (config.endDate && new Date() > new Date(config.endDate)) {
      return NextResponse.json({ error: 'giveaway_ended' }, { status: 400 })
    }

    if (config.maxEntries) {
      const count = await kv.llen(ENTRIES_KEY)
      if (count >= config.maxEntries) {
        return NextResponse.json({ error: 'entries_full' }, { status: 400 })
      }
    }

    const normalizedEmail = cleanEmail.toLowerCase().trim()

    const added = await kv.sadd(EMAIL_SET, normalizedEmail)
    if (added === 0) {
      return NextResponse.json({ error: 'already_entered' }, { status: 400 })
    }

    let referrerEntry = null
    if (referredBy?.trim()) {
      const allItems = await kv.lrange(ENTRIES_KEY, 0, -1)
      const parsedEntries = (allItems || []).map(item => {
        try { return typeof item === 'string' ? JSON.parse(item) : item } catch { return null }
      }).filter(Boolean)
      referrerEntry = parsedEntries.find(e => e?.referralCode === referredBy.trim())
    }

    const referralCode = makeCode()
    const baseEntries = 1
    const bonusEntries = referrerEntry ? 1 : 0
    const totalEntries = baseEntries + bonusEntries

    const entry = {
      name:         cleanName,
      email:        cleanEmail,
      phone:        cleanPhone,
      enteredAt:    new Date().toISOString(),
      referralCode,
      referredBy:   referrerEntry?.email || null,
      entries:      totalEntries,
      optIn:        !!optIn,
    }
    await kv.lpush(ENTRIES_KEY, JSON.stringify(entry))

    if (referrerEntry) {
      const updatedReferrer = { ...referrerEntry, entries: (referrerEntry.entries || 1) + 3, referrals: (referrerEntry.referrals || 0) + 1 }
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
