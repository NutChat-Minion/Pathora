import { appAuth } from '@/lib/app-auth'
import {
  getPayloadServer,
  handleError,
  jsonError,
  toOpportunityDTO,
} from '@/lib/journey-server'

export const dynamic = 'force-dynamic'

const types = ['scholarship', 'university', 'program']

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams
    const type = params.get('type')?.trim() ?? ''
    const q = params.get('q')?.trim() ?? ''
    const country = params.get('country')?.trim() ?? ''
    const locale = params.get('locale') === 'th' ? 'th' : 'en'

    if (type && !types.includes(type)) return jsonError(400, 'Unknown opportunity type.')
    if (q.length > 100 || country.length > 80) return jsonError(400, 'Search text is too long.')

    const and: Record<string, unknown>[] = []
    if (type) and.push({ type: { equals: type } })
    if (country) and.push({ country: { like: country } })
    if (q) {
      and.push({
        or: [
          { title: { like: q } },
          { institution: { like: q } },
          { country: { like: q } },
          { city: { like: q } },
        ],
      })
    }

    const session = await appAuth.current()
    const payload = await getPayloadServer()
    const result = await payload.find({
      collection: 'opportunities',
      where: and.length ? { and } : undefined,
      sort: 'deadline',
      limit: 100,
      depth: 1,
      locale,
      fallbackLocale: 'en',
      overrideAccess: false,
      user: session?.user,
    })

    return Response.json({ opportunities: result.docs.map((doc) => toOpportunityDTO(doc, session?.user)) })
  } catch (error) {
    return handleError(error)
  }
}
