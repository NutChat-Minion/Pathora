import 'server-only'

import config from '@payload-config'
import type Stripe from 'stripe'
import { getPayload } from 'payload'
import { PLAN_CATALOG, planByLookupKey, storedLimit, type PlanDefinition } from '@/lib/billing'
import type { SubscriptionStatus } from '@/lib/journey-contract'

/* eslint-disable @typescript-eslint/no-explicit-any */

type UserDoc = Record<string, any> & { id: string | number }

/*
 * All writes here use overrideAccess: true on purpose. The `subscription` and
 * `selectedCountries` fields are server-owned (field access denies every client write), and the
 * Stripe webhook has no user session. Callers must have authenticated the request themselves
 * (session check in routes, signature check in the webhook).
 */
async function loose() {
  return (await getPayload({ config })) as unknown as {
    find(args: Record<string, any>): Promise<{ docs: UserDoc[] }>
    findByID(args: Record<string, any>): Promise<UserDoc>
    update(args: Record<string, any>): Promise<UserDoc>
  }
}

export async function getUserById(id: string | number): Promise<UserDoc | null> {
  const payload = await loose()
  try {
    return await payload.findByID({ collection: 'users', id, depth: 0, overrideAccess: true })
  } catch {
    return null
  }
}

export async function findUserByCustomerId(customerId: string): Promise<UserDoc | null> {
  const payload = await loose()
  const res = await payload.find({
    collection: 'users',
    where: { 'subscription.stripeCustomerId': { equals: customerId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return res.docs[0] ?? null
}

export async function updateUserBilling(id: string | number, data: Record<string, unknown>) {
  const payload = await loose()
  return payload.update({ collection: 'users', id, data, depth: 0, overrideAccess: true })
}

const KNOWN_STATUS: SubscriptionStatus[] = ['active', 'trialing', 'past_due', 'canceled', 'incomplete']

export function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  if ((KNOWN_STATUS as string[]).includes(status)) return status as SubscriptionStatus
  if (status === 'incomplete_expired' || status === 'unpaid') return 'canceled'
  return status === 'paused' ? 'past_due' : 'incomplete'
}

export const idString = (v: string | { id: string } | null | undefined): string | null =>
  !v ? null : typeof v === 'string' ? v : v.id

/** Plan from the subscription's first item price lookup_key (falls back to metadata). */
export function planOfSubscription(sub: Stripe.Subscription): PlanDefinition | null {
  const item = sub.items?.data?.[0]
  const fromKey = planByLookupKey(item?.price?.lookup_key)
  if (fromKey) return fromKey
  const meta = (item?.price?.metadata?.pathoraPlan ?? sub.metadata?.plan) as string | undefined
  return meta && meta in PLAN_CATALOG ? PLAN_CATALOG[meta as keyof typeof PLAN_CATALOG] : null
}

/** stripe v23 keeps the period end on subscription items; older API versions on the subscription. */
export function periodEndOf(sub: Stripe.Subscription): string | null {
  const legacy = (sub as any).current_period_end
  const unix: number | undefined =
    sub.items?.data?.[0]?.current_period_end ?? (typeof legacy === 'number' ? legacy : undefined)
  return unix ? new Date(unix * 1000).toISOString() : null
}

/** Writes subscription state for a user and trims selected countries to the plan limit. */
export async function applySubscription(user: UserDoc, sub: Stripe.Subscription) {
  const plan = planOfSubscription(sub)
  const status = mapStripeStatus(sub.status)
  const prev = user.subscription ?? {}
  const keepPlan = plan?.key ?? prev.plan ?? null
  const limitPlan = plan ?? (prev.plan ? PLAN_CATALOG[prev.plan as keyof typeof PLAN_CATALOG] : null)

  const data: Record<string, unknown> = {
    subscription: {
      stripeCustomerId: idString(sub.customer as any) ?? prev.stripeCustomerId ?? null,
      stripeSubscriptionId: sub.id,
      plan: keepPlan,
      status,
      currentPeriodEnd: periodEndOf(sub),
      countryLimit: limitPlan ? storedLimit(limitPlan) : (prev.countryLimit ?? 0),
    },
  }
  if (limitPlan && Number.isFinite(limitPlan.countryLimit)) {
    const selected: string[] = Array.isArray(user.selectedCountries) ? user.selectedCountries : []
    if (selected.length > limitPlan.countryLimit) {
      data.selectedCountries = selected.slice(0, limitPlan.countryLimit)
    }
  }
  await updateUserBilling(user.id, data)
}
