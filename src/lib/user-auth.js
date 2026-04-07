import { SignJWT, jwtVerify } from 'jose'
import { Redis } from '@upstash/redis'

const COOKIE_NAME = 'fitzone_user_token'
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60

const kv = Redis.fromEnv()
const USERS_KEY = 'fitzone_users'
const USER_PURCHASES_PREFIX = 'fitzone_user_purchases_'

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function signUserToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret())
}

export async function verifyUserToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload
  } catch {
    return null
  }
}

export function getUserCookieName() {
  return COOKIE_NAME
}

export function getUserCookieOptions(token) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  }
}

export function clearUserCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  }
}

export async function getUserByEmail(email) {
  const data = await kv.hget(USERS_KEY, email.toLowerCase())
  return data
}

export async function createUser({ name, email, password, phone }) {
  const normalizedEmail = email.toLowerCase().trim()
  const existing = await getUserByEmail(normalizedEmail)
  if (existing) return null

  const user = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: phone || '',
    createdAt: new Date().toISOString(),
  }

  await kv.hset(USERS_KEY, { [normalizedEmail]: JSON.stringify(user) })
  return user
}

export async function getUserPurchases(userId) {
  const key = `${USER_PURCHASES_PREFIX}${userId}`
  const raw = await kv.lrange(key, 0, -1)
  return raw.map(item => {
    try { return typeof item === 'string' ? JSON.parse(item) : item } catch { return null }
  }).filter(Boolean)
}

export async function addUserPurchase(userId, purchase) {
  const key = `${USER_PURCHASES_PREFIX}${userId}`
  await kv.lpush(key, JSON.stringify(purchase))
}
