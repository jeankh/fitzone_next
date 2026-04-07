export function validateOrigin(request) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (!origin || !host) return false
  try {
    const url = new URL(origin)
    return url.host === host
  } catch {
    return false
  }
}
