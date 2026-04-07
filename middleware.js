import { NextResponse } from 'next/server'
import { verifyToken, getCookieName } from './src/lib/auth'
import { checkRateLimit } from './src/lib/ratelimit'

const PUBLIC_ADMIN_ROUTES = ['/api/admin/login', '/api/admin/logout']
const PUBLIC_GET_ROUTES = ['/api/admin/prices', '/api/admin/currency-prices', '/api/admin/marketing', '/api/admin/bank', '/api/admin/blogs', '/api/admin/giveaway']

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
  if (PUBLIC_ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // 3. Auth: Allow GET on public data routes
  if (request.method === 'GET' && PUBLIC_GET_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // 4. Auth: Allow public POST to events (analytics tracking)
  if (pathname === '/api/events' && request.method === 'POST') {
    return NextResponse.next()
  }

  // 5. Auth: Protect everything else
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
