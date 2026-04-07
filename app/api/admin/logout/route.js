import { NextResponse } from 'next/server'
import { clearCookieOptions } from '../../../../src/lib/auth'
import { validateOrigin } from '../../../../src/lib/csrf'

export async function POST(request) {
  if (!validateOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const res = NextResponse.json({ ok: true })
  res.cookies.set(clearCookieOptions().name, '', clearCookieOptions())
  return res
}
