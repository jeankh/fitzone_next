const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fitzoneapp.com'

export default function sitemap() {
  const routes = [
    '',
    '/programs',
    '/results',
    '/blog',
    '/checkout',
    '/giveaway',
    '/terms',
    '/privacy',
    '/refund',
  ]

  return routes.map(route => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/programs' ? 0.9 : 0.7,
  }))
}
