import { SignJWT, jwtVerify } from 'jose'
import { getRedis } from './redis'
import bcrypt from 'bcryptjs'
import { randomUUID, randomBytes } from 'crypto'

const COOKIE_NAME = 'fitzone_user_token'
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60
const USERS_KEY = 'fitzone_users'
const USER_PURCHASES_PREFIX = 'fitzone_user_purchases_'
const MAGIC_LINK_PREFIX = 'fitzone_magic_'

function getSecret() {
  const secret = process.env.USER_JWT_SECRET || process.env.JWT_SECRET
  if (!secret) throw new Error('USER_JWT_SECRET or JWT_SECRET is not set')
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

export function getUserCookieOptions(token) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
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
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  }
}

export async function getUserByEmail(email) {
  const kv = getRedis()
  const data = await kv.hget(USERS_KEY, email.toLowerCase())
  return data
}

export async function createUser({ name, email, password, phone, hasPassword = true }) {
  const kv = getRedis()
  const normalizedEmail = email.toLowerCase().trim()
  const hashed = password ? await bcrypt.hash(password, 12) : ''

  const user = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password: hashed,
    phone: phone || '',
    hasPassword,
    createdAt: new Date().toISOString(),
  }

  const wasSet = await kv.hsetnx(USERS_KEY, normalizedEmail, JSON.stringify(user))
  if (!wasSet) return null
  return user
}

async function updateUserInRedis(user) {
  const kv = getRedis()
  await kv.hset(USERS_KEY, { [user.email.toLowerCase()]: JSON.stringify(user) })
}

export async function verifyPassword(user, plainPassword) {
  try {
    // Try bcrypt first
    const match = await bcrypt.compare(plainPassword, user.password)
    if (match) return true

    // Migration: check if stored password is plaintext (old users)
    if (user.password === plainPassword) {
      const hashed = await bcrypt.hash(plainPassword, 12)
      await updateUserInRedis({ ...user, password: hashed })
      return true
    }

    return false
  } catch {
    return false
  }
}

export async function setUserPassword(email, newPassword) {
  const kv = getRedis()
  const normalizedEmail = email.toLowerCase()
  const raw = await kv.hget(USERS_KEY, normalizedEmail)
  if (!raw) return false
  const user = typeof raw === 'string' ? JSON.parse(raw) : raw
  user.password = await bcrypt.hash(newPassword, 12)
  user.hasPassword = true
  await kv.hset(USERS_KEY, { [normalizedEmail]: JSON.stringify(user) })
  return true
}

export async function getUserPurchases(userId, page = 0, limit = 20) {
  const kv = getRedis()
  const key = `${USER_PURCHASES_PREFIX}${userId}`
  const start = page * limit
  const raw = await kv.lrange(key, start, start + limit - 1)
  return raw.map(item => {
    try { return typeof item === 'string' ? JSON.parse(item) : item } catch { return null }
  }).filter(Boolean)
}

export async function addUserPurchase(userId, purchase) {
  const kv = getRedis()
  const key = `${USER_PURCHASES_PREFIX}${userId}`
  await kv.lpush(key, JSON.stringify(purchase))
}

export async function getOrCreateUser({ name, email, phone }) {
  const normalizedEmail = email.toLowerCase().trim()
  const existing = await getUserByEmail(normalizedEmail)
  if (existing) {
    const user = typeof existing === 'string' ? JSON.parse(existing) : existing
    return { user, isNew: false }
  }

  const user = await createUser({ name, email: normalizedEmail, password: '', phone, hasPassword: false })
  if (!user) {
    const existingRetry = await getUserByEmail(normalizedEmail)
    const u = typeof existingRetry === 'string' ? JSON.parse(existingRetry) : existingRetry
    return { user: u, isNew: false }
  }
  return { user, isNew: true }
}

export async function createMagicToken(userId) {
  const kv = getRedis()
  const token = randomBytes(16).toString('hex')
  await kv.set(`${MAGIC_LINK_PREFIX}${token}`, userId, { ex: 900 })
  return token
}

export async function consumeMagicToken(token) {
  const kv = getRedis()
  const key = `${MAGIC_LINK_PREFIX}${token}`
  const userId = await kv.get(key)
  if (!userId) return null
  await kv.del(key)
  return userId
}

export async function getUserById(userId) {
  const kv = getRedis()
  const all = await kv.hgetall(USERS_KEY)
  if (!all) return null
  for (const [, raw] of Object.entries(all)) {
    try {
      const user = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (user.id === userId) return user
    } catch {}
  }
  return null
}

export async function checkLoginAttempts(email) {
  const kv = getRedis()
  const key = `login_attempts:${email.toLowerCase()}`
  const count = Number(await kv.get(key)) || 0
  if (count >= 5) return false
  await kv.incr(key)
  await kv.expire(key, 900)
  return true
}

export async function resetLoginAttempts(email) {
  const kv = getRedis()
  await kv.del(`login_attempts:${email.toLowerCase()}`)
}
