// Not marked 'server-only' so scripts/stripe-setup.ts (payload run) can import it; it is only
// imported by server code and reads STRIPE_SECRET_KEY, which is never exposed to the client.
import Stripe from 'stripe'
import type { EntitlementDTO, PlanKey, SubscriptionStatus } from '@/lib/journey-contract'
import { PLAN_KEYS } from '@/lib/journey-contract'

/* eslint-disable @typescript-eslint/no-explicit-any */

export type PlanDefinition = {
  key: PlanKey
  nameEn: string
  priceThb: number
  /** Infinity = unlimited (stored as -1 on the user) */
  countryLimit: number
  lookupKey: string
}

const def = (key: PlanKey, nameEn: string, priceThb: number, countryLimit: number): PlanDefinition => ({
  key,
  nameEn,
  priceThb,
  countryLimit,
  lookupKey: `pathora_${key}_monthly`,
})

export const PLAN_CATALOG: Record<PlanKey, PlanDefinition> = {
  starter: def('starter', 'Starter', 199, 1),
  plus: def('plus', 'Plus', 299, 2),
  multi: def('multi', 'Multi-country', 499, 4),
  buffet: def('buffet', 'Buffet', 2199, Infinity),
}

export const isPlanKey = (value: unknown): value is PlanKey =>
  typeof value === 'string' && (PLAN_KEYS as readonly string[]).includes(value)

export const planByLookupKey = (lookupKey: string | null | undefined): PlanDefinition | null =>
  Object.values(PLAN_CATALOG).find((p) => p.lookupKey === lookupKey) ?? null

/** Value stored on the user: -1 = unlimited. */
export const storedLimit = (plan: PlanDefinition) =>
  Number.isFinite(plan.countryLimit) ? plan.countryLimit : -1

let client: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set. Add it to the environment to enable billing.')
  }
  client ??= new Stripe(key)
  return client
}

/** Idempotently creates a Product + monthly THB Price per plan; returns lookupKey -> price id. */
export async function ensurePrices(): Promise<Record<string, string>> {
  const stripe = getStripe()
  const result: Record<string, string> = {}
  for (const plan of Object.values(PLAN_CATALOG)) {
    const existing = await stripe.prices.list({ lookup_keys: [plan.lookupKey], active: true, limit: 1 })
    if (existing.data[0]) {
      result[plan.lookupKey] = existing.data[0].id
      continue
    }
    const product = await stripe.products.create({
      name: `Pathora ${plan.nameEn}`,
      metadata: { pathoraPlan: plan.key },
    })
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'thb',
      unit_amount: plan.priceThb * 100,
      recurring: { interval: 'month' },
      lookup_key: plan.lookupKey,
      metadata: { pathoraPlan: plan.key },
    })
    result[plan.lookupKey] = price.id
  }
  return result
}

type UserLike = Record<string, any>

const ACTIVE: string[] = ['active', 'trialing']

/** Active/trialing subscription that covers `country` (buffet covers all). */
export function hasCountryAccess(user: UserLike | null | undefined, country: string): boolean {
  const sub = user?.subscription
  if (!sub || !ACTIVE.includes(sub.status)) return false
  if (sub.plan === 'buffet') return true
  const wanted = country.trim().toLowerCase()
  if (!wanted) return false
  // Multi-country listings (e.g. Erasmus Mundus, Thai government schemes) can't be tied to one
  // chosen country, so any active plan unlocks them.
  if (wanted.startsWith('multiple') || wanted.includes('(multiple') || wanted === 'europe') return true
  const chosen: unknown[] = Array.isArray(user?.selectedCountries) ? user!.selectedCountries : []
  return chosen.some((c) => typeof c === 'string' && c.trim().toLowerCase() === wanted)
}

export function entitlementOf(user: UserLike | null | undefined): EntitlementDTO {
  const sub = user?.subscription ?? {}
  const limit = typeof sub.countryLimit === 'number' ? sub.countryLimit : null
  const date = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null
  return {
    plan: isPlanKey(sub.plan) ? sub.plan : null,
    status: (sub.status ?? 'none') as SubscriptionStatus,
    countryLimit: sub.plan ? (limit === null || limit < 0 ? null : limit) : 0,
    selectedCountries: Array.isArray(user?.selectedCountries)
      ? user!.selectedCountries.filter((c: unknown): c is string => typeof c === 'string')
      : [],
    currentPeriodEnd: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
  }
}

export const isSubscriptionLive = (user: UserLike | null | undefined) =>
  ACTIVE.includes(user?.subscription?.status)
