import { appAuth } from '@/lib/app-auth'
import { getPayloadServer, handleError, jsonError, toOpportunityDTO, type Doc } from '@/lib/journey-server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, context: RouteContext<'/pathora-api/opportunities/[slug]'>) {
  try {
    const { slug } = await context.params
    const locale = new URL(request.url).searchParams.get('locale') === 'th' ? 'th' : 'en'
    const session = await appAuth.current()
    const payload = await getPayloadServer()
    const result = await payload.find({
      collection: 'opportunities',
      where: { slug: { equals: slug } },
      depth: 1,
      limit: 1,
      locale,
      fallbackLocale: 'en',
      overrideAccess: false,
    })
    const doc = result.docs[0]
    if (!doc) return jsonError(404, 'Opportunity not found.')
    return Response.json({ opportunity: toOpportunityDTO(doc as unknown as Doc, session?.user as unknown as Doc | undefined) })
  } catch (error) {
    return handleError(error)
  }
}
