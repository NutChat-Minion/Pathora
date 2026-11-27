import { getPayloadServer, handleError, listSavedIds, requireSession } from '@/lib/journey-server'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: Request,
  context: RouteContext<'/pathora-api/saved/[opportunityId]'>,
) {
  try {
    const session = await requireSession()
    if (session instanceof Response) return session

    const { opportunityId } = await context.params
    const payload = await getPayloadServer()

    try {
      const found = await payload.find({
        collection: 'saved-opportunities',
        where: {
          and: [
            { owner: { equals: session.user.id } },
            { opportunity: { equals: opportunityId } },
          ],
        },
        limit: 10,
        depth: 0,
        overrideAccess: false,
        user: session.user,
      })
      for (const doc of found.docs) {
        await payload.delete({
          collection: 'saved-opportunities',
          id: doc.id,
          overrideAccess: false,
          user: session.user,
        })
      }
    } catch (error) {
      // A malformed id simply matches nothing.
      if (!(error instanceof Error) || error.name === 'Forbidden') throw error
    }

    return Response.json({ saved: await listSavedIds(payload, session.user) })
  } catch (error) {
    return handleError(error)
  }
}
