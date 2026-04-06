import { NextResponse } from 'next/server'
import { verifyToken, getCookieName } from './src/lib/auth'

const PUBLIC_ADMIN_ROUTES = ['/api/admin/login', '/api/admin/logout']
const PUBLIC_GET_ROUTES = ['/api/admin/prices', '/api/admin/currency-prices', '/api/admin/marketing', '/api/admin/bank', '/api/admin/blogs', '/api/admin/giveaway']

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Allow login and logout without auth
  if (PUBLIC_ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Allow GET on public data routes (prices, marketing, etc. are read by the storefront)
  if (request.method === 'GET' && PUBLIC_GET_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Allow public POST to events (analytics tracking)
  if (pathname === '/api/events' && request.method === 'POST') {
    return NextResponse.next()
  }

  // Protect everything else under /api/admin/* and DELETE on /api/events
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
  matcher: ['/api/admin/:path*', '/api/events'],
}
