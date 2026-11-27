/**
 * Shared, serializable API contract between the Pathora client app
 * (src/components/pathora) and its route handlers (src/app/(frontend)/pathora-api).
 * Pure types + constants only — safe to import from both client and server.
 *
 * All error responses: `{ error: string, fieldErrors?: Record<string, string> }`
 * with a 4xx/5xx status. 401 = not signed in.
 */

export type DegreeLevel = 'bachelor' | 'master' | 'phd'
export type OpportunityType = 'scholarship' | 'university' | 'program'
export type FundingType = 'full' | 'partial' | 'waiver' | 'none'
export type PlanStatus = 'interested' | 'preparing' | 'ready' | 'submitted' | 'accepted' | 'rejected'
export type RoadmapStage = 'build' | 'review' | 'submit'

export const planStatuses: PlanStatus[] = [
  'interested',
  'preparing',
  'ready',
  'submitted',
  'accepted',
  'rejected',
]
export const roadmapStages: RoadmapStage[] = ['build', 'review', 'submit']

export const PLAN_KEYS = ['starter', 'plus', 'multi', 'buffet'] as const
export type PlanKey = (typeof PLAN_KEYS)[number]
export type SubscriptionStatus =
  | 'none'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'

export type EntitlementDTO = {
  plan: PlanKey | null
  status: SubscriptionStatus
  /** null = unlimited countries */
  countryLimit: number | null
  selectedCountries: string[]
  /** ISO date or null */
  currentPeriodEnd: string | null
}

export type OpportunityDTO = {
  id: string
  slug: string
  type: OpportunityType
  title: string
  institution: string
  country: string
  city: string | null
  summary: string | null
  studyFields: string[]
  degreeLevels: DegreeLevel[]
  fundingType: FundingType | null
  fundingSummary: string | null
  /** ISO date or null */
  deadline: string | null
  deadlineNote: string | null
  requirements: { minimumGpa: number | null; minimumIelts: number | null; notes: string | null }
  /** Payload media.url (relative /api/media/file/...) or null */
  imageUrl: string | null
  imageAlt: string | null
  /** Attribution line for third-party images, or null */
  imageCredit: string | null
  /** '' when locked */
  sourceUrl: string
  lastVerifiedAt: string | null
  origin: 'ai' | 'manual'
  sponsored: boolean
  /**
   * true when the viewer has no active plan covering `country`: summary, requirements,
   * sourceUrl and lastVerifiedAt are withheld (null / empty) by the server.
   */
  locked: boolean
}

export type StudentProfileDTO = {
  fullName: string
  preferredName: string
  email: string
  phone: string
  /** YYYY-MM-DD or '' */
  dateOfBirth: string
  nationality: string
  currentCity: string
  educationLevel: 'high-school' | 'bachelor' | 'master' | ''
  institution: string
  gpa: number | null
  graduationYear: number | null
  desiredDegree: DegreeLevel | ''
  preferredField: string
  preferredDestination: string
  englishTest: 'ielts' | 'toefl' | 'duolingo' | ''
  englishScore: number | null
  annualBudgetThb: number | null
  fundingPreference: 'full' | 'partial' | 'self' | ''
}

export type SettingsDTO = {
  language: 'en' | 'th'
  timezone: string
  emailUpdates: boolean
  deadlineReminders: boolean
  profileVisibility: 'private' | 'buddies'
}

export type TaskDTO = { id: string; title: string; done: boolean; dueDate: string | null }

export type PlanDTO = {
  id: string
  opportunityId: string
  title: string
  status: PlanStatus
  targetDeadline: string | null
  tasks: TaskDTO[]
}

export type RoadmapDTO = { activePlanId: string | null; completedStages: RoadmapStage[] }

export type SessionUserDTO = { id: string; email: string; name: string }

/** GET /pathora-api/journey → 200 JourneyDTO | 401 */
export type JourneyDTO = {
  user: SessionUserDTO
  profile: StudentProfileDTO
  settings: SettingsDTO
  roadmap: RoadmapDTO
  /** opportunity ids */
  saved: string[]
  plans: PlanDTO[]
  /** false until POST /pathora-api/journey/import has run once */
  localImportDone: boolean
  entitlement: EntitlementDTO
  /** percentage 0-100 of filled profile fields */
  profileCompletion: number
}

/*
 * Endpoints (all JSON, cookie session `app-session`):
 *
 * Auth (exists):   GET/POST/DELETE /pathora-api/auth
 *   POST body { mode: 'login'|'register', email, password, name? } → { user: SessionUserDTO }
 *
 * Public:
 *   GET  /pathora-api/opportunities?type=&q=&country=   → { opportunities: OpportunityDTO[] }
 *   GET  /pathora-api/opportunities/[slug]               → { opportunity: OpportunityDTO } | 404
 *   (locked: true variants for viewers without a plan covering the country)
 *   POST /pathora-api/saved, /pathora-api/plans → 402 { error, code: 'plan_required' } when not covered
 *   Billing (signed in): POST billing/checkout {plan} → {url} | 409 code 'use_portal';
 *     POST billing/portal → {url}; PUT billing/countries {countries} → { entitlement }
 *     POST billing/webhook (Stripe only)
 *
 * Signed in:
 *   GET   /pathora-api/journey                           → JourneyDTO
 *   PATCH /pathora-api/journey
 *         body { profile?: Partial<StudentProfileDTO>, settings?: Partial<SettingsDTO>,
 *                roadmap?: Partial<RoadmapDTO> }        → JourneyDTO
 *   POST  /pathora-api/journey/import  body LocalImportPayload → JourneyDTO (no-op if already done)
 *   POST  /pathora-api/saved          body { opportunityId } → { saved: string[] }
 *   DELETE /pathora-api/saved/[opportunityId]                → { saved: string[] }
 *   POST  /pathora-api/plans          body { opportunityId } → { plan: PlanDTO } (409 if exists)
 *   PATCH /pathora-api/plans/[id]     body { status?, targetDeadline? } → { plan: PlanDTO }
 *   DELETE /pathora-api/plans/[id]                           → { ok: true }
 *   POST  /pathora-api/plans/[id]/tasks body { title, dueDate? } → { plan: PlanDTO }
 *   PATCH /pathora-api/plans/[id]/tasks/[taskId] body { done?, title?, dueDate? } → { plan: PlanDTO }
 *   DELETE /pathora-api/plans/[id]/tasks/[taskId]           → { plan: PlanDTO }
 */

/** Shape of the legacy localStorage keys the old demo wrote (pathora-profile etc). */
export type LocalImportPayload = {
  profile?: Record<string, string>
  /** legacy opportunity ids (fictional demo ids are ignored server-side if no slug matches) */
  saved?: string[]
  completedStages?: string[]
}

export const STARTER_TASKS = [
  'Verify eligibility on the official source',
  'Prepare academic transcripts',
  'Draft statement of purpose',
  'Request recommendation letters',
]
