import { Redis } from '@upstash/redis'
import BlogPageClient from '../../src/page-components/BlogPage'

const kv = Redis.fromEnv()

async function getPosts() {
  try {
    const data = await kv.get('fitzone_blogs')
    if (!data) return null
    return typeof data === 'string' ? JSON.parse(data) : data
  } catch {
    return null
  }
}

export default async function BlogPage() {
  const posts = await getPosts()
  return <BlogPageClient initialPosts={posts} />
}
