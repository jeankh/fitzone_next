import { NextResponse } from 'next/server'
import { consumeMagicToken, getUserById, signUserToken, getUserCookieOptions } from '../../../../src/lib/user-auth'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/account/login?error=invalid', request.url))
    }

    const userId = await consumeMagicToken(token)
    if (!userId) {
      return NextResponse.redirect(new URL('/account/login?error=expired', request.url))
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.redirect(new URL('/account/login?error=notfound', request.url))
    }

    const jwt = await signUserToken({ userId: user.id, email: user.email, role: 'user' })
    const response = NextResponse.redirect(new URL('/account?welcome=true', request.url))
    response.cookies.set(getUserCookieOptions(jwt))
    return response
  } catch (err) {
    console.error('Magic link error:', err.message)
    return NextResponse.redirect(new URL('/account/login?error=invalid', request.url))
  }
}
