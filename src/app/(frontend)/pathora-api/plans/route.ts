import { STARTER_TASKS } from '@/lib/journey-contract'
import { hasCountryAccess } from '@/lib/billing'
import {
  badBody,
  getPayloadServer,
  getReadableOpportunity,
  handleError,
  jsonError,
  planRequired,
  readJsonObject,
  requireSession,
  toPlanDTO,
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

    const existing = await payload.find({
      collection: 'application-plans',
      where: {
        and: [
          { owner: { equals: session.user.id } },
          { opportunity: { equals: opportunity.id } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    })
    if (existing.docs.length) return jsonError(409, 'You already have a plan for this opportunity.')

    const plan = await payload.create({
      collection: 'application-plans',
      data: {
        opportunity: opportunity.id,
        title: String(opportunity.title ?? '').slice(0, 200),
        status: 'preparing',
        targetDeadline: opportunity.deadline ?? undefined,
        tasks: STARTER_TASKS.map((title) => ({ title, done: false })),
      },
      depth: 0,
      overrideAccess: false,
      user: session.user,
    })

    return Response.json({ plan: toPlanDTO(plan) }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
