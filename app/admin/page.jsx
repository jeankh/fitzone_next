import { kv } from '@vercel/kv'
import AdminDashboard from '../../src/page-components/AdminPage'

const VALID_KEYS = ['cart_adds', 'bundle_upgrades', 'checkout_starts', 'purchases']
const KV_KEY = 'fitzone_events'

export const dynamic = 'force-dynamic'

async function getEventCounts() {
  try {
    const data = await kv.hgetall(KV_KEY)
    const counts = {}
    for (const key of VALID_KEYS) {
      counts[key] = Number(data?.[key] ?? 0)
    }
    return counts
  } catch {
    const counts = {}
    for (const key of VALID_KEYS) counts[key] = 0
    return counts
  }
}

export default async function AdminPage() {
  const events = await getEventCounts()
  return <AdminDashboard initialEvents={events} />
}
