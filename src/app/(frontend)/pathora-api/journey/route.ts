import {
  badBody,
  buildJourney,
  cleanProfilePatch,
  cleanRoadmapPatch,
  cleanSettingsPatch,
  currentCompletedStages,
  getPayloadServer,
  handleError,
  idOf,
  jsonError,
  loadUserDoc,
  readJsonObject,
  requireSession,
  type FieldErrors,
} from '@/lib/journey-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await requireSession()
    if (session instanceof Response) return session

    const payload = await getPayloadServer()
    const user = await loadUserDoc(payload, session)
    return Response.json(await buildJourney(user))
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession()
    if (session instanceof Response) return session

    const body = await readJsonObject(request)
    if (!body) return badBody()

    const fieldErrors: FieldErrors = {}
    const profile = body.profile !== undefined ? cleanProfilePatch(body.profile) : null
    const settings = body.settings !== undefined ? cleanSettingsPatch(body.settings) : null
    const roadmap = body.roadmap !== undefined ? cleanRoadmapPatch(body.roadmap) : null
    for (const result of [profile, settings, roadmap]) {
      if (result && 'fieldErrors' in result) Object.assign(fieldErrors, result.fieldErrors)
    }
    if (Object.keys(fieldErrors).length) {
      return jsonError(400, 'Check the highlighted fields and try again.', fieldErrors)
    }

    const payload = await getPayloadServer()
    const current = await loadUserDoc(payload, session)
    const data: Record<string, unknown> = {}

    if (profile && 'data' in profile) {
      if (profile.data.name !== undefined) data.name = profile.data.name
      data.studentProfile = { ...(current.studentProfile ?? {}), ...profile.data.studentProfile }
    }

    if (settings && 'data' in settings) {
      data.settings = { ...(current.settings ?? {}), ...settings.data }
    }

    if (roadmap && 'data' in roadmap) {
      let activePlan = idOf(current.roadmap?.activePlan)
      if (roadmap.data.activePlanId !== undefined) {
        activePlan = roadmap.data.activePlanId
        if (activePlan) {
          const owned = await payload.find({
            collection: 'application-plans',
            where: {
              and: [{ id: { equals: activePlan } }, { owner: { equals: session.user.id } }],
            },
            limit: 1,
            depth: 0,
            overrideAccess: false,
            user: session.user,
          })
          if (!owned.docs.length) {
            return jsonError(400, 'Choose one of your own plans.', {
              activePlanId: 'Plan not found.',
            })
          }
        }
      }
      data.roadmap = {
        activePlan,
        completedStages: roadmap.data.completedStages ?? currentCompletedStages(current),
      }
    }

    if (!Object.keys(data).length) return Response.json(await buildJourney(current))

    const updated = await payload.update({
      collection: 'users',
      id: session.user.id,
      data,
      depth: 0,
      overrideAccess: false,
      user: session.user,
    })
    return Response.json(await buildJourney(updated))
  } catch (error) {
    return handleError(error)
  }
}
