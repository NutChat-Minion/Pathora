import { PLAN_CATALOG, getStripe, isPlanKey, isSubscriptionLive } from '@/lib/billing'
import { getUserById, updateUserBilling } from '@/lib/billing-server'
import { badBody, handleError, jsonError, readJsonObject, requireSession } from '@/lib/journey-server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    if (session instanceof Response) return session

    const body = await readJsonObject(request)
    if (!body || !isPlanKey(body.plan)) return badBody()
    const plan = PLAN_CATALOG[body.plan]

    const user = await getUserById(session.user.id)
    if (!user) return jsonError(401, 'Sign in required.')

    // Plan changes for an existing subscriber go through the Stripe billing portal.
    if (isSubscriptionLive(user) || user.subscription?.status === 'past_due') {
      return Response.json(
        { error: 'Manage your current plan from billing settings.', code: 'use_portal' },
        { status: 409 },
      )
    }

    const stripe = getStripe()
    const prices = await stripe.prices.list({ lookup_keys: [plan.lookupKey], active: true, limit: 1 })
    const price = prices.data[0]
    if (!price) {
      console.error('[billing] Missing Stripe price for', plan.lookupKey, '- run `pnpm stripe:setup`')
      return jsonError(503, 'Billing is not set up yet. Please try again later.')
    }

    let customerId: string | null = user.subscription?.stripeCustomerId ?? null
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: String(user.email ?? ''),
        name: user.name ? String(user.name) : undefined,
        metadata: { userId: String(user.id) },
      })
      customerId = customer.id
      await updateUserBilling(user.id, {
        subscription: { ...(user.subscription ?? {}), stripeCustomerId: customerId },
      })
    }

    const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '')
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      // No payment_method_types: this Stripe SDK version uses dynamic payment methods from the
      // dashboard. PromptPay is one-time only (no recurring), so it never appears for
      // subscriptions; keep it disabled/irrelevant here and rely on cards.
      client_reference_id: String(user.id),
      subscription_data: { metadata: { userId: String(user.id), plan: plan.key } },
      success_url: `${origin}/app/pricing?checkout=success`,
      cancel_url: `${origin}/app/pricing?checkout=cancel`,
    })
    if (!checkout.url) return jsonError(502, 'Could not start checkout. Please try again.')
    return Response.json({ url: checkout.url })
  } catch (error) {
    return handleError(error)
  }
}
