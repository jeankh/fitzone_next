import { NextResponse } from 'next/server'
import { clearUserCookieOptions } from '../../../../src/lib/user-auth'
import { validateOrigin } from '../../../../src/lib/csrf'

export async function POST(request) {
  if (!validateOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const response = NextResponse.json({ ok: true })
  response.cookies.set(clearUserCookieOptions())
  return response
}
