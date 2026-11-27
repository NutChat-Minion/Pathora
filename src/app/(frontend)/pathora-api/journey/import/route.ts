import { roadmapStages } from '@/lib/journey-contract'
import {
  badBody,
  buildJourney,
  cleanProfilePatch,
  currentCompletedStages,
  getPayloadServer,
  handleError,
  idOf,
  jsonError,
  listSavedIds,
  loadUserDoc,
  readJsonObject,
  requireSession,
  toProfileDTO,
} from '@/lib/journey-server'

export const dynamic = 'force-dynamic'

const MAX_SAVED = 200
const MAX_STRING = 200
const PLACEHOLDERS: Record<string, string> = {
  fullName: 'Praew P.',
  phone: '+66 81 234 5678',
}

const normalize = (value: string) => value.replace(/[’‘]/g, "'").trim().toLowerCase()

const enumMaps: Record<string, Record<string, string>> = {
  educationLevel: {
    "bachelor's degree": 'bachelor',
    'high school': 'high-school',
    "master's degree": 'master',
    bachelor: 'bachelor',
    'high-school': 'high-school',
    master: 'master',
  },
  desiredDegree: {
    "master's": 'master',
    "bachelor's": 'bachelor',
    phd: 'phd',
    master: 'master',
    bachelor: 'bachelor',
  },
  englishTest: { ielts: 'ielts', toefl: 'toefl', duolingo: 'duolingo' },
  fundingPreference: {
    'full scholarship preferred': 'full',
    'partial scholarship acceptable': 'partial',
    'self-funded': 'self',
    full: 'full',
    partial: 'partial',
    self: 'self',
  },
}

const importableKeys = [
  'fullName',
  'preferredName',
  'phone',
  'dateOfBirth',
  'nationality',
  'currentCity',
  'educationLevel',
  'institution',
  'gpa',
  'graduationYear',
  'desiredDegree',
  'preferredField',
  'preferredDestination',
  'englishTest',
  'englishScore',
  'budget',
  'fundingPreference',
] as const

function mapLegacyValue(key: string, value: string): unknown {
  const text = value.trim()
  if (!text) return undefined
  if (key in PLACEHOLDERS && text === PLACEHOLDERS[key]) return undefined
  if (key in enumMaps) return enumMaps[key][normalize(text)]
  return text
}

export async function POST(request: Request) {
  try {
    const session = await requireSession()
    if (session instanceof Response) return session

    const body = await readJsonObject(request)
    if (!body) return badBody()

    const { profile, saved, completedStages } = body
    if (profile !== undefined) {
      if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return badBody()
      const entries = Object.entries(profile as Record<string, unknown>)
      if (entries.length > 50) return badBody()
      for (const [, v] of entries) {
        if (typeof v !== 'string' || v.length > MAX_STRING) {
          return jsonError(400, 'Imported profile values must be short text.')
        }
      }
    }
    if (saved !== undefined) {
      if (
        !Array.isArray(saved) ||
        saved.length > MAX_SAVED ||
        saved.some((v) => typeof v !== 'string' || v.length > MAX_STRING)
      ) {
        return jsonError(400, 'Too many saved items to import.')
      }
    }
    if (completedStages !== undefined) {
      if (
        !Array.isArray(completedStages) ||
        completedStages.length > 20 ||
        completedStages.some((v) => typeof v !== 'string' || v.length > MAX_STRING)
      ) {
        return badBody()
      }
    }

    const payload = await getPayloadServer()
    const current = await loadUserDoc(payload, session)
    if (current.localImportDone) return Response.json(await buildJourney(current))

    // Profile: only fill fields that are currently empty on the account.
    const existing = toProfileDTO(current)
    const legacy = (profile ?? {}) as Record<string, string>
    const fill: Record<string, unknown> = {}
    for (const key of importableKeys) {
      if (typeof legacy[key] !== 'string') continue
      const field = key === 'budget' ? 'annualBudgetThb' : key
      const currentValue = existing[field as keyof typeof existing]
      if (currentValue !== '' && currentValue !== null) continue

      let mapped = mapLegacyValue(key, legacy[key])
      if (mapped === undefined) continue
      if (key === 'budget') mapped = String(mapped).replace(/[,\s]/g, '')

      // Validate each field on its own so one bad legacy value does not block the rest.
      const cleaned = cleanProfilePatch({ [field]: mapped })
      if ('fieldErrors' in cleaned) continue
      Object.assign(fill, cleaned.data.studentProfile)
      if (cleaned.data.name) fill.__name = cleaned.data.name
    }
    const { __name, ...profileFill } = fill
    const data: Record<string, unknown> = { localImportDone: true }
    if (Object.keys(profileFill).length) {
      data.studentProfile = { ...(current.studentProfile ?? {}), ...profileFill }
    }
    if (typeof __name === 'string') data.name = __name

    // Saved: legacy ids are slugs of the old demo; keep only those that exist.
    if (Array.isArray(saved) && saved.length) {
      const slugs = [...new Set(saved as string[])]
      const found = await payload.find({
        collection: 'opportunities',
        where: { slug: { in: slugs } },
        limit: MAX_SAVED,
        depth: 0,
        overrideAccess: false,
        user: session.user,
      })
      const alreadySaved = new Set(await listSavedIds(payload, current))
      for (const opportunity of found.docs) {
        if (alreadySaved.has(String(opportunity.id))) continue
        try {
          await payload.create({
            collection: 'saved-opportunities',
            data: { opportunity: opportunity.id },
            depth: 0,
            overrideAccess: false,
            user: session.user,
          })
        } catch {
          // Duplicates (or a since-hidden listing) are ignored.
        }
      }
    }

    // Roadmap: union of completed stages.
    if (Array.isArray(completedStages) && completedStages.length) {
      const union = new Set([...currentCompletedStages(current), ...(completedStages as string[])])
      data.roadmap = {
        activePlan: idOf(current.roadmap?.activePlan),
        completedStages: roadmapStages.filter((s) => union.has(s)),
      }
    }

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
