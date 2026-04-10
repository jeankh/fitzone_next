import { Redis } from '@upstash/redis'

let _kv = null

export function getRedis() {
  if (!_kv) {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
    _kv = url && token ? new Redis({ url, token }) : Redis.fromEnv()
  }
  return _kv
}
