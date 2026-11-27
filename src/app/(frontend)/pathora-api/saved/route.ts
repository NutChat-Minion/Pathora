import { hasCountryAccess } from '@/lib/billing'
import {
  badBody,
  getPayloadServer,
  getReadableOpportunity,
  handleError,
  jsonError,
  planRequired,
  listSavedIds,
  readJsonObject,
  requireSession,
} from '@/lib/journey-server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    if (session instanceof Response) return session

    const body = await readJsonObject(request)
    const opportunityId = body?.opportunityId
    if (typeof opportunityId !== 'string' || !opportunityId || opportunityId.length > 100) {
      return badBody()
    }

    const payload = await getPayloadServer()
    const opportunity = await getReadableOpportunity(payload, opportunityId, session.user)
    if (!opportunity) return jsonError(404, 'Opportunity not found.')
    // Saving / planning requires an active plan covering the listing's country (users still
    // read what they already saved or planned). Entitlement is read from the session user.
    if (!hasCountryAccess(session.user, String(opportunity.country ?? ''))) {
      return planRequired(String(opportunity.country ?? ''))
    }

    const existing = await listSavedIds(payload, session.user)
    if (!existing.includes(String(opportunity.id))) {
      try {
        await payload.create({
          collection: 'saved-opportunities',
          data: { opportunity: opportunity.id },
          depth: 0,
          overrideAccess: false,
          user: session.user,
        })
      } catch (error) {
        // A concurrent duplicate is fine; anything else is a real failure.
        const after = await listSavedIds(payload, session.user)
        if (!after.includes(String(opportunity.id))) throw error
      }
    }

    return Response.json({ saved: await listSavedIds(payload, session.user) })
  } catch (error) {
    return handleError(error)
  }
}
