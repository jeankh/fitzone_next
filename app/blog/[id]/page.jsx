import { Redis } from '@upstash/redis'
import BlogPostPageClient from '../../../src/page-components/BlogPostPage'

const kv = Redis.fromEnv()

async function getPost(id) {
  try {
    const data = await kv.get('fitzone_blogs')
    const posts = data ? (typeof data === 'string' ? JSON.parse(data) : data) : []
    return posts.find(p => String(p.id) === String(id)) || null
  } catch {
    return null
  }
}

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.id)
  return <BlogPostPageClient initialPost={post} postId={params.id} />
}
