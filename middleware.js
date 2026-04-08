import { NextResponse } from 'next/server'
import { verifyToken, getCookieName } from './src/lib/auth'
import { checkRateLimit } from './src/lib/ratelimit'
import { verifyUserToken } from './src/lib/user-auth'

const PUBLIC_ADMIN_ROUTES = ['/api/admin/login', '/api/admin/logout']
const PUBLIC_GET_ROUTES = ['/api/admin/prices', '/api/admin/currency-prices', '/api/admin/marketing', '/api/admin/bank', '/api/admin/blogs', '/api/admin/giveaway', '/api/checkout/success', '/api/giveaway/info', '/api/user/me', '/api/user/purchases', '/api/user/verify-magic']
const PUBLIC_POST_ROUTES = ['/api/checkout/create-checkout-session', '/api/giveaway/enter', '/api/webhooks/stripe', '/api/user/signup', '/api/user/login', '/api/user/logout', '/api/user/send-magic', '/api/user/set-password']

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 1. Rate limiting (all api routes)
  if (pathname.startsWith('/api/')) {
    const blocked = await checkRateLimit(request)
    if (blocked) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }
  }

  // 2. Auth: Allow login and logout without auth
  if (PUBLIC_ADMIN_ROUTES.some(r => pathname === r)) {
    return NextResponse.next()
  }

  // 3. Auth: Allow GET on public data routes
  if (request.method === 'GET' && PUBLIC_GET_ROUTES.some(r => pathname === r)) {
    return NextResponse.next()
  }

  // 4. Auth: Allow public POST to checkout, giveaway, webhooks, user signup/login/logout
  if (request.method === 'POST' && PUBLIC_POST_ROUTES.some(r => pathname === r)) {
    return NextResponse.next()
  }

  // 5. Auth: Protect admin routes (requires admin token)
  const token = request.cookies.get(getCookieName())?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
