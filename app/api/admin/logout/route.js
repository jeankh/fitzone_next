import { NextResponse } from 'next/server'
import { clearCookieOptions } from '../../../../src/lib/auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(clearCookieOptions().name, '', clearCookieOptions())
  return res
}
