import { entitlementOf, isSubscriptionLive } from '@/lib/billing'
import { getUserById, updateUserBilling } from '@/lib/billing-server'
import { badBody, handleError, jsonError, readJsonObject, requireSession } from '@/lib/journey-server'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
  try {
    const session = await requireSession()
    if (session instanceof Response) return session

    const body = await readJsonObject(request)
    if (!body || !Array.isArray(body.countries) || body.countries.length > 250) return badBody()

    const seen = new Set<string>()
    const countries: string[] = []
    for (const raw of body.countries) {
      if (typeof raw !== 'string') return badBody()
      const name = raw.trim()
      if (!name) continue
      if (name.length > 80) {
        return jsonError(400, 'Country names must be 80 characters or fewer.', {
          countries: 'Country names must be 80 characters or fewer.',
        })
      }
      const key = name.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      countries.push(name)
    }

    const user = await getUserById(session.user.id)
    if (!user) return jsonError(401, 'Sign in required.')
    if (!isSubscriptionLive(user)) {
      return Response.json(
        { error: 'An active plan is required to choose countries.', code: 'plan_required' },
        { status: 402 },
      )
    }

    const limit = typeof user.subscription?.countryLimit === 'number' ? user.subscription.countryLimit : 0
    // -1 = unlimited (buffet); the list is ignored for access in that case but still stored.
    if (limit >= 0 && countries.length > limit) {
      return jsonError(400, `Your plan covers up to ${limit} ${limit === 1 ? 'country' : 'countries'}.`, {
        countries: `Choose at most ${limit}.`,
      })
    }

    const updated = await updateUserBilling(user.id, { selectedCountries: countries })
    return Response.json({ entitlement: entitlementOf(updated) })
  } catch (error) {
    return handleError(error)
  }
}
