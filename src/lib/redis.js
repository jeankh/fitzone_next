import { Redis } from '@upstash/redis'

let _kv = null

export function getRedis() {
  if (!_kv) _kv = Redis.fromEnv()
  return _kv
}
