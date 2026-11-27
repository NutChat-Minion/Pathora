import type Stripe from 'stripe'
import { getStripe } from '@/lib/billing'
import {
  applySubscription,
  findUserByCustomerId,
  getUserById,
  idString,
  updateUserBilling,
} from '@/lib/billing-server'

export const dynamic = 'force-dynamic'

/** Resolves the user a Stripe object belongs to: customer id first, then metadata.userId. */
async function resolveUser(customerId: string | null, userId?: string | null) {
  if (customerId) {
    const byCustomer = await findUserByCustomerId(customerId)
    if (byCustomer) return byCustomer
  }
  return userId ? getUserById(userId) : null
}

async function syncSubscription(stripe: Stripe, subscriptionId: string, userId?: string | null) {
  // Re-fetch so we always apply the latest state; makes out-of-order/duplicate events harmless.
  const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] })
  const user = await resolveUser(idString(sub.customer as any), userId ?? sub.metadata?.userId)
  if (!user) {
    console.warn('[billing] webhook: no user for subscription', sub.id)
    return
  }
  await applySubscription(user, sub)
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get('stripe-signature')
  if (!secret || !signature) return new Response('Missing signature', { status: 400 })

  const raw = await request.text()
  let event: Stripe.Event
  let stripe: Stripe
  try {
    stripe = getStripe()
    event = stripe.webhooks.constructEvent(raw, signature, secret)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subId = idString(session.subscription as any)
        if (session.mode === 'subscription' && subId) {
          await syncSubscription(stripe, subId, session.client_reference_id)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        if (event.type === 'customer.subscription.deleted') {
          const user = await resolveUser(idString(sub.customer as any), sub.metadata?.userId)
          if (user && user.subscription?.stripeSubscriptionId === sub.id) {
            await updateUserBilling(user.id, {
              subscription: { ...user.subscription, status: 'canceled' },
            })
          }
        } else {
          await syncSubscription(stripe, sub.id, sub.metadata?.userId)
        }
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const user = await resolveUser(idString(invoice.customer as any))
        if (user && user.subscription?.status === 'active') {
          await updateUserBilling(user.id, {
            subscription: { ...user.subscription, status: 'past_due' },
          })
        }
        break
      }
      default:
        break
    }
  } catch (error) {
    // Non-2xx makes Stripe retry; handlers are idempotent.
    console.error('[billing] webhook handler failed', event.type, error)
    return new Response('Handler error', { status: 500 })
  }
  return Response.json({ received: true })
}
