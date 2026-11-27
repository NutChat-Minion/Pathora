import { planStatuses } from '@/lib/journey-contract'
import {
  badBody,
  cleanDate,
  getOwnedPlan,
  getPayloadServer,
  handleError,
  jsonError,
  readJsonObject,
  requireSession,
  toPlanDTO,
} from '@/lib/journey-server'

export const dynamic = 'force-dynamic'

export async function PATCH(request: Request, context: RouteContext<'/pathora-api/plans/[id]'>) {
  try {
    const session = await requireSession()
    if (session instanceof Response) return session

    const body = await readJsonObject(request)
    if (!body) return badBody()

    const data: Record<string, unknown> = {}
    const fieldErrors: Record<string, string> = {}

    if ('status' in body) {
      if (typeof body.status === 'string' && (planStatuses as string[]).includes(body.status)) {
        data.status = body.status
      } else {
        fieldErrors.status = 'Choose a valid status.'
      }
    }
    if ('targetDeadline' in body) {
      const date = cleanDate(body.targetDeadline)
      if (date.ok) data.targetDeadline = date.value
      else fieldErrors.targetDeadline = 'Enter a valid date (YYYY-MM-DD).'
    }
    if (Object.keys(fieldErrors).length) {
      return jsonError(400, 'Check the highlighted fields and try again.', fieldErrors)
    }

    const { id } = await context.params
    const payload = await getPayloadServer()
    const plan = await getOwnedPlan(payload, id, session.user)
    if (!plan) return jsonError(404, 'Plan not found.')
    if (!Object.keys(data).length) return Response.json({ plan: toPlanDTO(plan) })

    const updated = await payload.update({
      collection: 'application-plans',
      id: plan.id,
      data,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    })
    return Response.json({ plan: toPlanDTO(updated) })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(_request: Request, context: RouteContext<'/pathora-api/plans/[id]'>) {
  try {
    const session = await requireSession()
    if (session instanceof Response) return session

    const { id } = await context.params
    const payload = await getPayloadServer()
    const plan = await getOwnedPlan(payload, id, session.user)
    if (!plan) return jsonError(404, 'Plan not found.')

    await payload.delete({
      collection: 'application-plans',
      id: plan.id,
      overrideAccess: false,
      user: session.user,
    })
    return Response.json({ ok: true })
  } catch (error) {
    return handleError(error)
  }
}
