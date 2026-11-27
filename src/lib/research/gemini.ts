// Server-only: never import from client components (uses GEMINI_API_KEY).
// NOTE: on the free tier Google may use requests/responses to improve its products.
import { GoogleGenAI } from '@google/genai'
import type { ResearchTopic } from './types'

export const GEMINI_RESEARCH_DEFAULT = 'gemini-3.5-flash'

export class GeminiRateLimitError extends Error {
  constructor(detail: string) {
    super(`Gemini 429 after one retry (free-tier per-minute/day quota, or Google Search grounding not included in this key's tier): ${detail}`)
    this.name = 'GeminiRateLimitError'
  }
}

type RawItem = Record<string, unknown> & { th?: Record<string, unknown> }

const isRateLimit = (e: unknown) => {
  const status = (e as { status?: number })?.status
  const msg = e instanceof Error ? e.message : String(e)
  return status === 429 || /\b429\b|RESOURCE_EXHAUSTED/.test(msg)
}
const isBadRequest = (e: unknown) => {
  const status = (e as { status?: number })?.status
  const msg = e instanceof Error ? e.message : String(e)
  return status === 400 || /\b400\b|INVALID_ARGUMENT/.test(msg)
}

/** Runs fn; on a 429 waits and retries once, then throws GeminiRateLimitError. */
async function withBackoff<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    if (!isRateLimit(e)) throw e
    const m = /retry in ([\d.]+)s/i.exec(e instanceof Error ? e.message : '')
    const waitMs = Math.min(60_000, Math.max(15_000, m ? Math.ceil(Number(m[1])) * 1000 + 1000 : 30_000))
    await new Promise((r) => setTimeout(r, waitMs))
    try {
      return await fn()
    } catch (e2) {
      if (isRateLimit(e2)) throw new GeminiRateLimitError(e2 instanceof Error ? e2.message.slice(0, 200) : 'unknown')
      throw e2
    }
  }
}

/** Follows redirects (vertexaisearch grounding links) to the final URL; null if unresolvable. */
async function resolveUrl(uri: string): Promise<string | null> {
  const attempt = async (method: 'HEAD' | 'GET') => {
    const res = await fetch(uri, {
      method,
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
      headers: { 'user-agent': 'PathoraResearchBot/1.0 (+link resolve)' },
    })
    await res.body?.cancel().catch(() => {})
    return res
  }
  try {
    let res = await attempt('HEAD')
    if (res.status === 405 || res.status === 403 || res.status === 501) res = await attempt('GET')
    if (res.status >= 400 && res.status !== 403) return null
    return res.url || null
  } catch {
    return null
  }
}

const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export async function researchTopicGemini(
  topic: ResearchTopic,
  opts: { timeoutMs?: number; today: string; system: string; schema: object },
): Promise<{ items: RawItem[]; model: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const model = process.env.GEMINI_RESEARCH_MODEL || GEMINI_RESEARCH_DEFAULT
  const timeout = opts.timeoutMs ?? 240_000
  const request = `Today is ${opts.today}. Research topic: ${topic.query}
Preferred listing type: ${topic.type ?? 'any'}. Country focus: ${topic.country ?? 'any'}.
Find up to 6 real, currently open or upcoming opportunities relevant to Thai students and return them in the required JSON.`

  const groundedUris: string[] = []
  const collect = (r: { candidates?: Array<{ groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string } }> } }> }) => {
    for (const c of r.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []) {
      if (c.web?.uri) groundedUris.push(c.web.uri)
    }
  }

  let text: string | undefined
  let mode = 'single'
  try {
    const res = await withBackoff(() =>
      ai.models.generateContent({
        model,
        contents: request,
        config: {
          systemInstruction: opts.system,
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseJsonSchema: opts.schema,
          httpOptions: { timeout },
        },
      }),
    )
    collect(res)
    text = res.text
  } catch (e) {
    if (!isBadRequest(e)) throw e
    // Search + JSON mode not accepted together: two-step (grounded brief, then conversion).
    mode = 'two-step'
    const brief = await withBackoff(() =>
      ai.models.generateContent({
        model,
        contents: `${request}\n\nWrite a research brief in markdown instead of JSON: for each opportunity give every field (title, institution, country, city, summary, fields of study, degree levels, funding, deadline, GPA/IELTS minimums, requirements) and the exact official https URL. Write "not stated" for anything the source does not state.`,
        config: { systemInstruction: opts.system, tools: [{ googleSearch: {} }], httpOptions: { timeout } },
      }),
    )
    collect(brief)
    const conv = await withBackoff(() =>
      ai.models.generateContent({
        model,
        contents: `Today is ${opts.today}. Convert this research brief into the required JSON. Use only facts in the brief; use null where "not stated". Include Thai translations in th.\n\n<brief>\n${brief.text ?? ''}\n</brief>`,
        config: {
          systemInstruction: opts.system,
          responseMimeType: 'application/json',
          responseJsonSchema: opts.schema,
          httpOptions: { timeout },
        },
      }),
    )
    text = conv.text
  }
  if (!text?.trim()) throw new Error('Gemini returned no text output')
  const parsed = JSON.parse(text) as { opportunities?: RawItem[] }
  let items = Array.isArray(parsed.opportunities) ? parsed.opportunities : []

  // Resolve grounding redirect links; only trust source URLs on hosts the search actually surfaced.
  if (groundedUris.length > 0 && items.length > 0) {
    const resolved = (await Promise.all([...new Set(groundedUris)].slice(0, 30).map(resolveUrl))).filter(
      (u): u is string => !!u,
    )
    const hosts = new Set(resolved.map(host).filter((h): h is string => !!h))
    if (hosts.size > 0) {
      items = items.filter((it) => {
        const h = typeof it.sourceUrl === 'string' ? host(it.sourceUrl) : null
        if (!h) return false
        if (hosts.has(h)) return true
        // exact-grounded page on a sibling subdomain of the same registrable domain
        return [...hosts].some((g) => g.endsWith(`.${h}`) || h.endsWith(`.${g}`))
      })
    }
  }
  return { items, model: `gemini:${model}${mode === 'two-step' ? ' (2-step)' : ''}` }
}
