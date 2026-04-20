import { NextResponse } from 'next/server'
import { getRedis } from '../../../../src/lib/redis'
import { parseItems } from '../../../../src/lib/user-auth'

const PURCHASES_KEY = 'fitzone_purchases'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 0
    const limit = Number(searchParams.get('limit')) || 20
    const kv = getRedis()

    const raw = await kv.lrange(PURCHASES_KEY, page * limit, page * limit + limit - 1)
    const purchases = raw.map(item => {
      try {
        const p = typeof item === 'string' ? JSON.parse(item) : item
        return p ? { ...p, items: parseItems(p.items) } : null
      } catch { return null }
    }).filter(Boolean)

    let stats = { total: 0, totalRevenue: 0, revenueByCurrency: {}, itemCounts: {} }
    if (page === 0) {
      const all = await kv.lrange(PURCHASES_KEY, 0, -1)
      const parsed = all.map(item => { try { return typeof item === 'string' ? JSON.parse(item) : item } catch { return null } }).filter(Boolean)
      stats.total = parsed.length
      stats.totalRevenue = parsed.reduce((sum, p) => sum + (p.amount || 0), 0)
      for (const p of parsed) {
        const c = (p.currency || 'sar').toUpperCase()
        stats.revenueByCurrency[c] = (stats.revenueByCurrency[c] || 0) + (p.amount || 0)
      }
      for (const p of parsed) {
        const items = parseItems(p.items)
        for (const id of items) stats.itemCounts[id] = (stats.itemCounts[id] || 0) + 1
      }
    }

    return NextResponse.json({ purchases, stats })
  } catch {
    return NextResponse.json({ purchases: [], stats: { total: 0, totalRevenue: 0, revenueByCurrency: {}, itemCounts: {} } })
  }
}
