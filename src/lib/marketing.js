export const MARKETING_DEFAULTS = {
  whatsapp: '966500000000',
  twitter: 'https://x.com/',
  instagram: 'https://instagram.com/',
  youtube: 'https://youtube.com/',
  whatsapp_visible: 'true',
  twitter_visible: 'true',
  instagram_visible: 'true',
  youtube_visible: 'true',
}

const URL_DEFAULTS = {
  twitter: 'https://x.com/',
  instagram: 'https://instagram.com/',
  youtube: 'https://youtube.com/',
}

function normalizeUrl(value, baseUrl) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return baseUrl
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const handle = trimmed.replace(/^@+/, '').replace(/^\/+/, '')
  return `${baseUrl}${handle}`
}

export function normalizeMarketingValue(key, value) {
  if (value === undefined || value === null) return ''
  const raw = String(value).trim()

  if (key.endsWith('_visible')) {
    return raw === 'false' ? 'false' : 'true'
  }

  if (key === 'whatsapp') {
    const digits = raw.replace(/\D/g, '')
    return digits || MARKETING_DEFAULTS.whatsapp
  }

  if (key === 'twitter') return normalizeUrl(raw, URL_DEFAULTS.twitter)
  if (key === 'instagram') return normalizeUrl(raw, URL_DEFAULTS.instagram)
  if (key === 'youtube') return normalizeUrl(raw, URL_DEFAULTS.youtube)

  return raw
}

export function isMarketingVisible(value) {
  return value !== 'false' && value !== false
}

export function getMarketingHref(key, value) {
  if (!value) return ''
  if (key === 'whatsapp') return `https://wa.me/${String(value).replace(/\D/g, '')}`
  return String(value)
}

export function getMarketingDisplayValue(key, value) {
  if (!value) return '—'
  if (key === 'whatsapp') return String(value).replace(/\D/g, '')
  return String(value)
}
