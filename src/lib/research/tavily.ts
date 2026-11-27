// Server-only: never import from client components (uses TAVILY_API_KEY).
// Credit use per topic (Tavily): 2 advanced searches = 2 x 2 = 4 credits, plus an
// optional extract of up to 3 URLs (basic depth: 1 credit per 5 URLs) = 1 credit. About 5 credits/topic.

export type TavilyResult = { url: string; title: string; content: string; score?: number }

export class TavilyAuthError extends Error {
  constructor() {
    super('Tavily rejected TAVILY_API_KEY (401/403).')
    this.name = 'TavilyAuthError'
  }
}
export class TavilyRateLimitError extends Error {
  constructor(detail = '') {
    super(`Tavily rate limit or plan/credit limit reached (429/432/433). ${detail}`.trim())
    this.name = 'TavilyRateLimitError'
  }
}

async function tavilyPost(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const key = process.env.TAVILY_API_KEY
  if (!key) throw new TavilyAuthError()
  const res = await fetch(`https://api.tavily.com/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  })
  if (res.status === 401 || res.status === 403) throw new TavilyAuthError()
  if (res.status === 429 || res.status === 432 || res.status === 433) throw new TavilyRateLimitError()
  if (!res.ok) throw new Error(`Tavily ${path} failed with HTTP ${res.status}`)
  return (await res.json()) as Record<string, unknown>
}

export async function tavilySearch(
  query: string,
  opts: { maxResults?: number; includeDomains?: string[]; excludeDomains?: string[] } = {},
): Promise<TavilyResult[]> {
  const data = await tavilyPost('search', {
    query,
    search_depth: 'advanced',
    max_results: opts.maxResults ?? 8,
    include_raw_content: false,
    ...(opts.includeDomains?.length ? { include_domains: opts.includeDomains } : {}),
    ...(opts.excludeDomains?.length ? { exclude_domains: opts.excludeDomains } : {}),
  })
  const results = Array.isArray(data.results) ? (data.results as Array<Record<string, unknown>>) : []
  return results
    .filter((r) => typeof r.url === 'string' && typeof r.content === 'string')
    .map((r) => ({
      url: r.url as string,
      title: typeof r.title === 'string' ? r.title : '',
      content: r.content as string,
      score: typeof r.score === 'number' ? r.score : undefined,
    }))
}

/** Returns page text per URL (truncated to ~12k chars). Failures yield an empty map entry set. */
export async function tavilyExtract(urls: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  if (urls.length === 0) return out
  const data = await tavilyPost('extract', { urls: urls.slice(0, 3), extract_depth: 'basic', format: 'text' })
  for (const r of (Array.isArray(data.results) ? data.results : []) as Array<Record<string, unknown>>) {
    if (typeof r.url === 'string' && typeof r.raw_content === 'string' && r.raw_content.trim()) {
      out.set(r.url, r.raw_content.slice(0, 12_000))
    }
  }
  return out
}

const OFFICIAL_HOSTS = [
  'chevening.org', 'daad.de', 'studyinjapan.go.jp', 'studyinkorea.go.kr', 'campusfrance.org',
  'studyinholland.nl', 'ocsc.go.th', 'tusef.or.th', 'erasmus-plus.ec.europa.eu', 'fulbright.org',
  'fulbrightthai.org', 'australiaawards.gov.au', 'mext.go.jp', 'jasso.go.jp', 'niied.go.kr',
  'educationusa.state.gov', 'study-uk.britishcouncil.org', 'britishcouncil.org', 'gov.uk',
  'nus.edu.sg', 'ntu.edu.sg', 'europa.eu', 'studyinaustralia.gov.au', 'educanada.ca', 'canada.ca',
  'studyinnewzealand.govt.nz', 'study-in-germany.de',
]
const AGGREGATORS = [
  'scholarshipportal', 'scholars4dev', 'opportunitydesk', 'wikipedia.org', 'youtube.com', 'reddit.com',
  'quora.com', 'facebook.com', 'medium.com', 'blogspot.', 'wordpress.com', 'linkedin.com', 'instagram.com',
  'scholarship-positions', 'studyabroad', 'topuniversities.com', 'mastersportal', 'bachelorsportal',
]

export function hostOf(u: string): string | null {
  try {
    return new URL(u).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return null
  }
}

/** Minimum officialScore for a page to be used as a listing source (gov / university / known programme site). */
export const OFFICIAL_MIN_SCORE = 8

/** Higher = more likely official. */
export function officialScore(url: string): number {
  const h = hostOf(url)
  if (!h) return -100
  if (AGGREGATORS.some((a) => h.includes(a))) return -10
  let s = 0
  if (OFFICIAL_HOSTS.some((o) => h === o || h.endsWith(`.${o}`))) s += 10
  if (/(^|\.)gov(\.[a-z]{2})?$/.test(h) || /\.go\.[a-z]{2}$/.test(h) || /\.gouv\./.test(h)) s += 8
  if (/\.ac\.[a-z]{2}$/.test(h) || h.endsWith('.edu') || /\.edu\.[a-z]{2}$/.test(h)) s += 8
  // Note: 'scholarship' in a hostname is NOT a signal; many unofficial aggregator sites use it.
  if (/universit|college|foundation|embassy|ministry/.test(h)) s += 3
  if (/\.(org|int|eu)$/.test(h)) s += 1
  return s
}

export function rankResults(results: TavilyResult[]): TavilyResult[] {
  const seen = new Set<string>()
  return results
    .filter((r) => (seen.has(r.url) ? false : (seen.add(r.url), true)))
    .map((r) => ({ r, s: officialScore(r.url) + (r.score ?? 0) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.r)
}
