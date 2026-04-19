import { handleUpload } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { validateOrigin } from '../../../../src/lib/csrf'
import { getRedis } from '../../../../src/lib/redis'
import { verifyToken, getCookieName } from '../../../../src/lib/auth'

export const dynamic = 'force-dynamic'

async function isAdmin(request) {
  const cookie = request.cookies.get(getCookieName())
  if (!cookie?.value) return false
  const payload = await verifyToken(cookie.value)
  return payload?.role === 'admin'
}

const VALID_IDS = ['transformation', 'nutrition', 'bundle']
const KV_KEY = 'fitzone_ebooks'
const MAX_SIZE = 200 * 1024 * 1024 // 200 MB

// This endpoint handles two things:
// 1) Blob client-upload flow: issue a signed token so the browser can upload
//    the PDF directly to Vercel Blob (bypasses the 4.5MB serverless body limit).
// 2) PATCH: after the browser finishes uploading, it calls us with the final
//    blob URL + productId so we can store it in Redis. (The blob.onUploadCompleted
//    webhook is unreliable on localhost and slow in prod, so we save client-side.)
export async function POST(request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!(await isAdmin(request))) throw new Error('Unauthorized')

        let productId
        try { productId = JSON.parse(clientPayload || '{}').productId } catch {}
        if (!VALID_IDS.includes(productId)) throw new Error('Invalid product')

        return {
          allowedContentTypes: ['application/pdf'],
          maximumSizeInBytes: MAX_SIZE,
          tokenPayload: JSON.stringify({ productId }),
        }
      },
      // Persistence happens via the client-triggered PATCH below rather than
      // this webhook, which can't authenticate with the admin cookie and would
      // be rejected by middleware.
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(jsonResponse)
  } catch (err) {
    console.error('Ebook upload error:', err.message)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 400 })
  }
}

export async function PATCH(request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { productId, url } = await request.json()
    if (!VALID_IDS.includes(productId)) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    }
    if (typeof url !== 'string' || !url.startsWith('https://')) {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
    }
    const kv = getRedis()
    await kv.hset(KV_KEY, { [productId]: url })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Ebook save error:', err.message)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}
