import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'
import { validateOrigin } from '../../../../src/lib/csrf'

const kv = Redis.fromEnv()
const CONFIG_KEY = 'fitzone_giveaway'
const ENTRIES_KEY = 'fitzone_giveaway_entries'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const wantEntries = searchParams.get('entries') === '1'

    const raw = await kv.get(CONFIG_KEY)
    const config = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null
    const entryCount = await kv.llen(ENTRIES_KEY)

    if (wantEntries) {
      const items = await kv.lrange(ENTRIES_KEY, 0, -1)
      const entries = (items || []).map(item => {
        try { return typeof item === 'string' ? JSON.parse(item) : item } catch { return null }
      }).filter(Boolean)
      return NextResponse.json({ config, entryCount, entries })
    }

    return NextResponse.json({ config, entryCount })
  } catch {
    return NextResponse.json({ config: null, entryCount: 0 })
  }
}

export async function POST(request) {
  if (!validateOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const body = await request.json()
    await kv.set(CONFIG_KEY, JSON.stringify(body))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    if (searchParams.get('clearEntries') === '1') {
      await kv.del(ENTRIES_KEY)
      return NextResponse.json({ ok: true })
    }
    // Delete a specific entry by index
    const idx = parseInt(searchParams.get('index') || '-1', 10)
    if (idx >= 0) {
      const items = await kv.lrange(ENTRIES_KEY, 0, -1)
      const entries = (items || []).map(item => {
        try { return typeof item === 'string' ? JSON.parse(item) : item } catch { return null }
      }).filter(Boolean)
      entries.splice(idx, 1)
      await kv.del(ENTRIES_KEY)
      if (entries.length > 0) {
        // lpush adds to head, so push in reverse to maintain order
        for (let i = entries.length - 1; i >= 0; i--) {
          await kv.lpush(ENTRIES_KEY, JSON.stringify(entries[i]))
        }
      }
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Missing parameter' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
