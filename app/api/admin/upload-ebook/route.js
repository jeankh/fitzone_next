import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { validateOrigin } from '../../../../src/lib/csrf'
import { getRedis } from '../../../../src/lib/redis'

const ALLOWED_TYPES = ['application/pdf']
const MAX_SIZE = 200 * 1024 * 1024 // 200MB
const VALID_IDS = ['transformation', 'nutrition', 'bundle']
const KV_KEY = 'fitzone_ebooks'

export async function POST(request) {
  if (!validateOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const productId = formData.get('productId')

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    if (!VALID_IDS.includes(productId)) return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Only PDF files allowed' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 200MB)' }, { status: 400 })

    const blob = await put(`ebooks/${productId}-${Date.now()}.pdf`, file, {
      access: 'public',
    })

    const kv = getRedis()
    await kv.hset(KV_KEY, { [productId]: blob.url })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('Ebook upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
