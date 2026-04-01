import { Redis } from '@upstash/redis'
import GiveawayClient from '../../src/page-components/GiveawayPage'

const kv = Redis.fromEnv()

async function getConfig() {
  try {
    const raw = await kv.get('fitzone_giveaway')
    return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null
  } catch {
    return null
  }
}

export default async function GiveawayPage() {
  const config = await getConfig()
  return <GiveawayClient config={config} />
}
