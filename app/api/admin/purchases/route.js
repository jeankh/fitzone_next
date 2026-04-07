import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const kv = Redis.fromEnv()
const PURCHASES_KEY = 'fitzone_purchases'

export async function GET() {
  try {
    const raw = await kv.lrange(PURCHASES_KEY, 0, -1)
    const purchases = raw.map(item => {
      try { return typeof item === 'string' ? JSON.parse(item) : item } catch { return null }
    }).filter(Boolean)

    const totalRevenue = purchases.reduce((sum, p) => sum + (p.amount || 0), 0)
    const currencies = {}
    for (const p of purchases) {
      const c = (p.currency || 'sar').toUpperCase()
      currencies[c] = (currencies[c] || 0) + (p.amount || 0)
    }

    const itemCounts = {}
    for (const p of purchases) {
      const items = (p.items || '').split(',').filter(Boolean)
      for (const id of items) {
        itemCounts[id] = (itemCounts[id] || 0) + 1
      }
    }

    return NextResponse.json({
      purchases,
      stats: {
        total: purchases.length,
        totalRevenue,
        revenueByCurrency: currencies,
        itemCounts,
      },
    })
  } catch {
    return NextResponse.json({ purchases: [], stats: { total: 0, totalRevenue: 0, revenueByCurrency: {}, itemCounts: {} } })
  }
}
