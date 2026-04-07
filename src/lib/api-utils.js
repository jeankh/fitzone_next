import { NextResponse } from 'next/server'

export function apiError(message, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function apiSuccess(data = {}) {
  return NextResponse.json({ ok: true, ...data })
}
