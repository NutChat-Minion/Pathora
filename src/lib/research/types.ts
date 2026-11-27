export const RESEARCH_MODEL = 'claude-sonnet-5-5'

export type ResearchTopic = {
  id: number | string
  query: string
  country?: string | null
  type?: 'scholarship' | 'university' | 'program' | null
}

export type ThaiFields = {
  title?: string | null
  summary?: string | null
  fundingSummary?: string | null
  deadlineNote?: string | null
  requirementNotes?: string | null
}

/** Validated, normalized listing candidate. */
export type Candidate = {
  type: 'scholarship' | 'university' | 'program'
  title: string
  institution: string
  country: string
  city: string | null
  summary: string
  studyFields: string[]
  degreeLevels: Array<'bachelor' | 'master' | 'phd'>
  fundingType: 'full' | 'partial' | 'waiver' | 'none' | null
  fundingSummary: string | null
  /** YYYY-MM-DD or null (rolling / not stated). */
  deadline: string | null
  deadlineNote: string | null
  minimumGpa: number | null
  minimumIelts: number | null
  requirementNotes: string | null
  sourceUrl: string
  th: ThaiFields
}

export type UpsertResult = { created: number; updated: number; skipped: number }

export class MissingApiKeyError extends Error {
  constructor() {
    super('Neither GEMINI_API_KEY nor ANTHROPIC_API_KEY is set; the research job has no AI provider.')
    this.name = 'MissingApiKeyError'
  }
}
