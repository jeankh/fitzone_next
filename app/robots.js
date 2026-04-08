const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fitzoneapp.com'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/account/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
