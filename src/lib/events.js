import { getRedis } from './redis'

const KV_KEY = 'fitzone_events'
const VALID_KEYS = ['cart_adds', 'bundle_upgrades', 'checkout_starts', 'purchases']

// Server-side counter increment. Used by routes that already authenticated
// the caller (webhook, checkout/success) so they don't have to loop back
// through the public /api/events endpoint with INTERNAL_SECRET.
export async function incrementEventCount(key) {
  if (!VALID_KEYS.includes(key)) return
  try { await getRedis().hincrby(KV_KEY, key, 1) } catch {}
}
