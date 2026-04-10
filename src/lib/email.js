export async function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set')
  }
  const { Resend } = await import('resend')
  return new Resend(process.env.RESEND_API_KEY)
}

export function getFromEmail() {
  if (!process.env.FROM_EMAIL) {
    throw new Error('FROM_EMAIL is not set')
  }
  return process.env.FROM_EMAIL
}
