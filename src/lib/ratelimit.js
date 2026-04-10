import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let redis = null
let rateLimiters = null

function getRedis() {
  if (!redis) {
    try { redis = Redis.fromEnv() } catch { return null }
  }
  return redis
}

function getLimiters() {
  if (!rateLimiters) {
    const r = getRedis()
    if (!r) return null
    rateLimiters = {
      login: new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(5, '15 m'), prefix: 'rl:login' }),
      checkout: new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(10, '15 m'), prefix: 'rl:checkout' }),
      events: new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(60, '1 m'), prefix: 'rl:events' }),
      general: new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(30, '10 s'), prefix: 'rl:general' }),
    }
  }
  return rateLimiters
}

export async function checkRateLimit(request) {
  const limiters = getLimiters()
  if (!limiters) return null

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  const { pathname } = request.nextUrl

  let limiter
  if (pathname === '/api/admin/login') limiter = limiters.login
  else if (pathname.startsWith('/api/checkout/')) limiter = limiters.checkout
  else if (pathname === '/api/events' && request.method === 'POST') limiter = limiters.events
  else limiter = limiters.general

  const { success } = await limiter.limit(ip)
  return success ? null : true
}
