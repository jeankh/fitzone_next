export const SOCIAL_PLATFORM_OPTIONS = [
  { value: 'x', label: 'Twitter / X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
]

export const MARKETING_DEFAULTS = {
  whatsapp: '966500000000',
  socials: [],
}

const SOCIAL_BASE_URLS = {
  x: 'https://x.com/',
  instagram: 'https://instagram.com/',
  youtube: 'https://youtube.com/',
  tiktok: 'https://www.tiktok.com/@',
  facebook: 'https://facebook.com/',
  linkedin: 'https://linkedin.com/in/',
}

function normalizeUrl(value, baseUrl) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const handle = trimmed.replace(/^@+/, '').replace(/^\/+/, '')
  return `${baseUrl}${handle}`
}

export function normalizeWhatsApp(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits || MARKETING_DEFAULTS.whatsapp
}

export function normalizeSocialItem(item, fallbackId) {
  if (!item || !item.platform) return null
  const platform = String(item.platform).trim().toLowerCase()
  if (!SOCIAL_BASE_URLS[platform]) return null
  const url = normalizeUrl(item.url, SOCIAL_BASE_URLS[platform])
  if (!url) return null
  return {
    id: String(item.id || fallbackId || `${platform}-${Date.now()}`),
    platform,
    url,
  }
}

export function parseStoredSocials(value) {
  if (!value) return []
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) return []
    return parsed.map((item, index) => normalizeSocialItem(item, `${item?.platform || 'social'}-${index}`)).filter(Boolean)
  } catch {
    return []
  }
}

export function migrateLegacyMarketing(data) {
  const socials = []
  const legacyFields = [
    ['twitter', 'x'],
    ['instagram', 'instagram'],
    ['youtube', 'youtube'],
  ]

  for (const [legacyKey, platform] of legacyFields) {
    const value = data?.[legacyKey]
    const visible = data?.[`${legacyKey}_visible`]
    if (value && visible !== 'false' && visible !== false) {
      const item = normalizeSocialItem({ id: legacyKey, platform, url: value }, legacyKey)
      if (item) socials.push(item)
    }
  }

  return socials
}

export function normalizeMarketingData(data = {}) {
  const whatsapp = normalizeWhatsApp(data.whatsapp)
  const socials = data.socials ? parseStoredSocials(data.socials) : migrateLegacyMarketing(data)
  return { whatsapp, socials }
}

export function getMarketingHref(key, value) {
  if (!value) return ''
  if (key === 'whatsapp') return `https://wa.me/${normalizeWhatsApp(value)}`
  return String(value)
}

export function getMarketingDisplayValue(key, value) {
  if (!value) return '—'
  if (key === 'whatsapp') return normalizeWhatsApp(value)
  return String(value)
}

export function getSocialPlatformLabel(platform) {
  return SOCIAL_PLATFORM_OPTIONS.find(option => option.value === platform)?.label || platform
}
