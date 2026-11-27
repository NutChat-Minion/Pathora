// Server-only. Tavily discovers sources; Gemini (no tools) extracts structured listings from them.
import { GoogleGenAI } from '@google/genai'
import { GEMINI_RESEARCH_DEFAULT } from './gemini'
import { OFFICIAL_MIN_SCORE, officialScore, rankResults, tavilyExtract, tavilySearch, type TavilyResult } from './tavily'
import type { ResearchTopic } from './types'

type RawItem = Record<string, unknown> & { th?: Record<string, unknown> }

export async function researchTopicTavily(
  topic: ResearchTopic,
  opts: { timeoutMs?: number; today: string; system: string; schema: object },
): Promise<{ items: RawItem[]; model: string }> {
  const model = process.env.GEMINI_RESEARCH_MODEL || GEMINI_RESEARCH_DEFAULT

  // At most 2 searches per topic.
  const [main, official] = await Promise.all([
    tavilySearch(topic.query),
    tavilySearch(`${topic.query} official site application deadline 2027`),
  ])
  // Only official sources (government, university, known programme sites) may back a listing,
  // because listings auto-publish. Unofficial aggregators are dropped entirely.
  const ranked = rankResults([...main, ...official])
    .filter((r) => officialScore(r.url) >= OFFICIAL_MIN_SCORE)
    .slice(0, 8)
  if (ranked.length === 0) return { items: [], model: `tavily+gemini:${model}` }

  // Page text for up to 3 top official-looking URLs.
  const extractUrls = ranked.slice(0, 3).map((r) => r.url)
  let pages = new Map<string, string>()
  try {
    pages = await tavilyExtract(extractUrls)
  } catch (e) {
    if (e instanceof Error && (e.name === 'TavilyAuthError' || e.name === 'TavilyRateLimitError')) throw e
    // otherwise fall back to snippets only
  }
  const sources: TavilyResult[] = ranked.map((r) => ({ ...r, content: pages.get(r.url) ?? r.content }))
  const allowed = new Set(sources.map((s) => s.url))

  const sourceText = sources
    .map((s, i) => `[Source ${i + 1}]\nURL: ${s.url}\nTitle: ${s.title}\nText:\n${s.content}`)
    .join('\n\n---\n\n')
  const system = `${opts.system}
Additional rules for this mode (no web access):
- Use ONLY facts present in the provided sources. Ignore your own background knowledge.
- sourceUrl MUST be exactly one of the provided source URLs (the one that states the facts).
- Use null for anything the source does not state. Skip opportunities whose deadline has already passed.`

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const res = await ai.models.generateContent({
    model,
    contents: `Today is ${opts.today}. Research topic: ${topic.query}
Preferred listing type: ${topic.type ?? 'any'}. Country focus: ${topic.country ?? 'any'}.
Extract up to 6 real, currently open or upcoming opportunities relevant to Thai students from the sources below and return the required JSON.

${sourceText}`,
    config: {
      systemInstruction: system,
      responseMimeType: 'application/json',
      responseJsonSchema: opts.schema,
      httpOptions: { timeout: opts.timeoutMs ?? 240_000 },
    },
  })
  if (!res.text?.trim()) throw new Error('Gemini returned no text output')
  const parsed = JSON.parse(res.text) as { opportunities?: RawItem[] }
  const items = (Array.isArray(parsed.opportunities) ? parsed.opportunities : []).filter(
    (it) => typeof it.sourceUrl === 'string' && allowed.has(it.sourceUrl),
  )
  return { items, model: `tavily+gemini:${model}` }
}
