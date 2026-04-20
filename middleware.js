import { NextResponse } from 'next/server'
import { verifyToken, getCookieName } from './src/lib/auth'
import { checkRateLimit } from './src/lib/ratelimit'
import { verifyUserToken } from './src/lib/user-auth'

const PUBLIC_ADMIN_ROUTES = ['/api/admin/login', '/api/admin/logout']
const PUBLIC_GET_ROUTES = ['/api/admin/prices', '/api/admin/currency-prices', '/api/admin/marketing', '/api/admin/blogs', '/api/checkout/success', '/api/user/me', '/api/user/purchases', '/api/user/verify-magic', '/api/user/cart', '/api/user/download']
const PUBLIC_POST_ROUTES = ['/api/checkout/create-checkout-session', '/api/webhooks/stripe', '/api/user/signup', '/api/user/login', '/api/user/logout', '/api/user/send-magic', '/api/user/send-reset', '/api/user/set-password', '/api/user/reset-password']
const WEBHOOK_ROUTES = ['/api/webhooks/stripe']
const INTERNAL_ROUTES = ['/api/events']

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 0. Skip rate limiting for webhooks (Stripe sends rapid retries)
  if (!WEBHOOK_ROUTES.some(r => pathname === r)) {
    if (pathname.startsWith('/api/')) {
      const blocked = await checkRateLimit(request)
      if (blocked) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
      }
    }
  }

  // 1. Auth: Allow login and logout without auth
  if (PUBLIC_ADMIN_ROUTES.some(r => pathname === r)) {
    return NextResponse.next()
  }

  // 2. Auth: Allow GET on public data routes
  if (request.method === 'GET' && PUBLIC_GET_ROUTES.some(r => pathname === r)) {
    return NextResponse.next()
  }

  // 3. Auth: Allow public POST to checkout, webhooks, user signup/login/logout
  if (request.method === 'POST' && PUBLIC_POST_ROUTES.some(r => pathname === r)) {
    return NextResponse.next()
  }

  // 3b. Allow user cart PUT (authenticated via user token inside handler)
  if (pathname === '/api/user/cart' && request.method === 'PUT') {
    return NextResponse.next()
  }

  // 3c. Allow internal server-to-server routes (events POST from webhooks etc.)
  if (INTERNAL_ROUTES.some(r => pathname === r) && request.method === 'POST') {
    const internalSecret = request.headers.get('x-internal-secret')
    if (internalSecret && internalSecret === process.env.INTERNAL_SECRET) {
      return NextResponse.next()
    }
  }

  // 4. Auth: Protect admin routes (requires admin token with role=admin)
  if (pathname.startsWith('/api/admin/')) {
    const token = request.cookies.get(getCookieName())?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.next()
  }

  // 5. All other API routes require admin auth (catch-all)
  const token = request.cookies.get(getCookieName())?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
