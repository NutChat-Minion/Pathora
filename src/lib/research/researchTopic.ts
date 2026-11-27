// Server-only: never import from client components (uses ANTHROPIC_API_KEY).
import Anthropic from '@anthropic-ai/sdk'
import { researchTopicGemini } from './gemini'
import { researchTopicTavily } from './tavilyResearch'
import { MissingApiKeyError, RESEARCH_MODEL, type Candidate, type ResearchTopic } from './types'

const nullable = (type: string) => ({ type: [type, 'null'] })

const itemSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'type', 'title', 'institution', 'country', 'city', 'summary', 'studyFields', 'degreeLevels',
    'fundingType', 'fundingSummary', 'deadline', 'deadlineNote', 'minimumGpa', 'minimumIelts',
    'requirementNotes', 'sourceUrl', 'th',
  ],
  properties: {
    type: { type: 'string', enum: ['scholarship', 'university', 'program'] },
    title: { type: 'string' },
    institution: { type: 'string' },
    country: { type: 'string' },
    city: nullable('string'),
    summary: { type: 'string' },
    studyFields: { type: 'array', items: { type: 'string' } },
    degreeLevels: { type: 'array', items: { type: 'string', enum: ['bachelor', 'master', 'phd'] } },
    fundingType: { type: ['string', 'null'], enum: ['full', 'partial', 'waiver', 'none', null] },
    fundingSummary: nullable('string'),
    deadline: nullable('string'),
    deadlineNote: nullable('string'),
    minimumGpa: nullable('number'),
    minimumIelts: nullable('number'),
    requirementNotes: nullable('string'),
    sourceUrl: { type: 'string' },
    th: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'summary', 'fundingSummary', 'deadlineNote', 'requirementNotes'],
      properties: {
        title: nullable('string'),
        summary: nullable('string'),
        fundingSummary: nullable('string'),
        deadlineNote: nullable('string'),
        requirementNotes: nullable('string'),
      },
    },
  },
}

const outputSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['opportunities'],
  properties: { opportunities: { type: 'array', items: itemSchema } },
}

const SYSTEM = `You research study-abroad opportunities for Thai students and report only facts you verified on the web.
Rules:
- Use web search. Prefer the OFFICIAL page (university, government, foundation or programme domain). Avoid aggregators when an official page exists.
- Return up to 6 opportunities that are currently open or upcoming: the deadline is in the future, or admissions/applications are rolling. Today's date is given in the request.
- Never invent values. If a field is not stated on the source, use null (or an empty array). Do not guess GPA, IELTS, deadlines or funding.
- minimumGpa must be on a 4.0 scale; only set it if the source states it (convert only when the source gives an explicit conversion), else null.
- deadline is YYYY-MM-DD for a single stated date, otherwise null with the explanation in deadlineNote (e.g. "Rolling admissions").
- summary: at most 600 characters, plain, factual, no hype or marketing language.
- sourceUrl is the exact https URL of the official page you used.
- th.* is a natural Thai translation of the matching English field (title, summary, fundingSummary, deadlineNote, requirementNotes); keep proper nouns/programme names recognizable; null when the English field is null.
- If you cannot find anything reliable, return an empty list.`

export function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new MissingApiKeyError()
  return new Anthropic({ maxRetries: 2 })
}

type RawItem = Record<string, unknown> & { th?: Record<string, unknown> }

/**
 * One Claude call (with the web search server tool) for one topic.
 * Returns raw, UNVALIDATED items; run them through `validateCandidates`.
 */
export async function researchTopic(
  topic: ResearchTopic,
  opts: { timeoutMs?: number; today?: string } = {},
): Promise<{ items: RawItem[]; model: string }> {
  const today = opts.today ?? new Date().toISOString().slice(0, 10)
  if (process.env.TAVILY_API_KEY && process.env.GEMINI_API_KEY) {
    return researchTopicTavily(topic, { timeoutMs: opts.timeoutMs, today, system: SYSTEM, schema: outputSchema })
  }
  if (process.env.GEMINI_API_KEY) {
    return researchTopicGemini(topic, { timeoutMs: opts.timeoutMs, today, system: SYSTEM, schema: outputSchema })
  }
  const client = getClient()
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Today is ${today}. Research topic: ${topic.query}
Preferred listing type: ${topic.type ?? 'any'}. Country focus: ${topic.country ?? 'any'}.
Find up to 6 real, currently open or upcoming opportunities relevant to Thai students and return them in the required JSON.`,
    },
  ]

  let lastText = ''
  // Server-side web search can pause long turns; resume up to 3 times.
  for (let turn = 0; turn < 4; turn++) {
    const stream = client.messages.stream(
      {
        model: RESEARCH_MODEL,
        max_tokens: 32000,
        system: SYSTEM,
        // Sonnet 5.5: thinking is always adaptive; forced tool_choice is not allowed,
        // so JSON comes from structured outputs rather than a forced tool.
        thinking: { type: 'adaptive' },
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: outputSchema } },
        tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 8 }],
        messages,
      },
      { timeout: opts.timeoutMs ?? 240_000 },
    )
    const res = await stream.finalMessage()

    if (res.stop_reason === 'refusal') throw new Error(`Model refused the request (${res.stop_details?.category ?? 'unknown'})`)
    if (res.stop_reason === 'max_tokens') throw new Error('Model output hit max_tokens before finishing JSON')
    if (res.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: res.content })
      continue
    }
    lastText = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
    if (!lastText.trim()) throw new Error('Model returned no text output')
    const parsed = JSON.parse(lastText) as { opportunities?: RawItem[] }
    return { items: Array.isArray(parsed.opportunities) ? parsed.opportunities : [], model: `anthropic:${res.model}` }
  }
  throw new Error('Model kept pausing; gave up after 4 turns')
}

const str = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null
  const t = v.replace(/\s+/g, ' ').trim()
  return t ? t.slice(0, max) : null
}
const num = (v: unknown, min: number, max: number): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? Math.round(v * 100) / 100 : null

function validUrl(v: unknown): string | null {
  if (typeof v !== 'string') return null
  try {
    const u = new URL(v.trim())
    if (u.protocol !== 'https:' || !u.hostname.includes('.')) return null
    return u.toString()
  } catch {
    return null
  }
}

/** Normalizes raw model output; drops anything missing required data or already past its deadline. */
export function validateCandidates(items: RawItem[], today = new Date().toISOString().slice(0, 10)): Candidate[] {
  const out: Candidate[] = []
  for (const it of items) {
    const title = str(it.title, 200)
    const institution = str(it.institution, 200)
    const sourceUrl = validUrl(it.sourceUrl)
    if (!title || !institution || !sourceUrl) continue
    const type = ['scholarship', 'university', 'program'].includes(it.type as string)
      ? (it.type as Candidate['type'])
      : null
    if (!type) continue

    let deadline: string | null = null
    if (typeof it.deadline === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(it.deadline) && !Number.isNaN(Date.parse(it.deadline))) {
      deadline = it.deadline
    }
    if (deadline && deadline < today) continue // past; rolling listings have deadline null

    const th = (it.th ?? {}) as Record<string, unknown>
    out.push({
      type,
      title,
      institution,
      country: str(it.country, 80) ?? 'Unknown',
      city: str(it.city, 80),
      summary: str(it.summary, 600) ?? '',
      studyFields: Array.isArray(it.studyFields)
        ? it.studyFields.map((f) => str(f, 80)).filter((f): f is string => !!f).slice(0, 12)
        : [],
      degreeLevels: Array.isArray(it.degreeLevels)
        ? [...new Set(it.degreeLevels.filter((d): d is 'bachelor' | 'master' | 'phd' => ['bachelor', 'master', 'phd'].includes(d as string)))]
        : [],
      fundingType: ['full', 'partial', 'waiver', 'none'].includes(it.fundingType as string)
        ? (it.fundingType as Candidate['fundingType'])
        : null,
      fundingSummary: str(it.fundingSummary, 200),
      deadline,
      deadlineNote: str(it.deadlineNote, 120),
      minimumGpa: num(it.minimumGpa, 0, 4),
      minimumIelts: num(it.minimumIelts, 0, 9),
      requirementNotes: str(it.requirementNotes, 2000),
      sourceUrl,
      th: {
        title: str(th.title, 200),
        summary: str(th.summary, 2000),
        fundingSummary: str(th.fundingSummary, 200),
        deadlineNote: str(th.deadlineNote, 120),
        requirementNotes: str(th.requirementNotes, 2000),
      },
    })
  }
  return out
}

/** Drops candidates whose source page is a definite 404/410. Network errors/timeouts keep the item. */
export async function checkSourceUrls(cands: Candidate[]): Promise<Candidate[]> {
  const results = await Promise.all(
    cands.map(async (c) => {
      const attempt = async (method: 'HEAD' | 'GET') => {
        const res = await fetch(c.sourceUrl, {
          method,
          redirect: 'follow',
          signal: AbortSignal.timeout(8000),
          headers: { 'user-agent': 'PathoraResearchBot/1.0 (+link check)' },
        })
        return res.status
      }
      try {
        let status = await attempt('HEAD')
        if (status === 405 || status === 403 || status === 501) status = await attempt('GET')
        return status === 404 || status === 410 ? null : c
      } catch {
        return c
      }
    }),
  )
  return results.filter((c): c is Candidate => c !== null)
}
