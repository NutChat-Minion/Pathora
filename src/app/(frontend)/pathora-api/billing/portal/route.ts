import { getStripe } from '@/lib/billing'
import { getUserById } from '@/lib/billing-server'
import { handleError, jsonError, requireSession } from '@/lib/journey-server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    if (session instanceof Response) return session

    const user = await getUserById(session.user.id)
    const customerId: string | undefined = user?.subscription?.stripeCustomerId
    if (!customerId) return jsonError(400, 'No billing account yet. Choose a plan first.')

    const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '')
    const portal = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/app/pricing`,
    })
    return Response.json({ url: portal.url })
  } catch (error) {
    return handleError(error)
  }
}
