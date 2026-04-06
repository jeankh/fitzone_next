import Stripe from 'stripe'

let _stripe

export function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  }
  return _stripe
}

export const PRICE_IDS = {
  transformation: process.env.STRIPE_PRICE_TRANSFORMATION,
  nutrition: process.env.STRIPE_PRICE_NUTRITION,
  bundle: process.env.STRIPE_PRICE_BUNDLE,
}
