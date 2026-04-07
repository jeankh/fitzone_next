import { NextResponse } from 'next/server'
import { clearUserCookieOptions } from '../../../../src/lib/user-auth'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(clearUserCookieOptions())
  return response
}
