const HTML_TAG_RE = /<[^>]*>/g
const SCRIPT_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi

export function sanitize(input) {
  if (typeof input !== 'string') return input
  return input
    .replace(SCRIPT_RE, '')
    .replace(HTML_TAG_RE, '')
    .trim()
}

export function sanitizeObject(obj, allowedKeys) {
  const result = {}
  for (const key of allowedKeys) {
    if (obj[key] !== undefined) {
      result[key] = typeof obj[key] === 'string' ? sanitize(obj[key]) : obj[key]
    }
  }
  return result
}
