// Server-only.
import type { Payload } from 'payload'
import { checkSourceUrls, researchTopic, validateCandidates } from './researchTopic'
import { RESEARCH_MODEL, type ResearchTopic } from './types'
import { expireStale, upsertCandidates } from './upsert'

export type RunSummary = {
  topicsRun: number
  created: number
  updated: number
  expired: number
  failed: number
  errors: string[]
}

/**
 * Runs the stalest active topics sequentially. Stops starting new topics once
 * `budgetSeconds` has elapsed (serverless time limit). Logs one research-run per topic.
 */
export async function runScheduledResearch(
  payload: Payload,
  { maxTopics = 3, budgetSeconds = 250 }: { maxTopics?: number; budgetSeconds?: number } = {},
): Promise<RunSummary> {
  const started = Date.now()
  const summary: RunSummary = { topicsRun: 0, created: 0, updated: 0, expired: 0, failed: 0, errors: [] }

  // lastRunAt asc with never-run topics first, then priority desc.
  const never = await payload.find({
    collection: 'research-topics',
    where: { and: [{ active: { equals: true } }, { lastRunAt: { exists: false } }] },
    sort: '-priority',
    limit: maxTopics,
    depth: 0,
    overrideAccess: true,
  })
  let topics = never.docs
  if (topics.length < maxTopics) {
    const ran = await payload.find({
      collection: 'research-topics',
      where: { and: [{ active: { equals: true } }, { lastRunAt: { exists: true } }] },
      sort: ['lastRunAt', '-priority'],
      limit: maxTopics - topics.length,
      depth: 0,
      overrideAccess: true,
    })
    topics = [...topics, ...ran.docs]
  }

  let first = true
  for (const t of topics) {
  if (!first) await new Promise((r) => setTimeout(r, 6000)) // free-tier Gemini per-minute caps
    first = false
    if ((Date.now() - started) / 1000 >= budgetSeconds) break
    const remainingMs = Math.max(30_000, budgetSeconds * 1000 - (Date.now() - started) + 40_000)
    const startedAt = new Date().toISOString()
    let status: 'success' | 'partial' | 'failed' = 'success'
    let error: string | undefined
    let model: string = process.env.GEMINI_API_KEY ? `${process.env.TAVILY_API_KEY ? 'tavily+' : ''}gemini:${process.env.GEMINI_RESEARCH_MODEL || 'gemini-3.5-flash'}` : `anthropic:${RESEARCH_MODEL}`
    let counts = { created: 0, updated: 0, skipped: 0 }
    try {
      const topic = t as unknown as ResearchTopic
      const { items, model: m } = await researchTopic(topic, { timeoutMs: remainingMs })
      model = m
      const valid = await checkSourceUrls(validateCandidates(items))
      counts = await upsertCandidates(payload, valid)
      if (counts.skipped > 0 || valid.length < items.length) status = 'partial'
      if (items.length > 0 && valid.length === 0) status = 'partial'
    } catch (err) {
      status = 'failed'
      error = (err instanceof Error ? `${err.name}: ${err.message}` : String(err)).slice(0, 2000)
      summary.failed++
      summary.errors.push(`${t.id}: ${error}`)
      // Missing key will fail every topic: stop immediately.
      if (err instanceof Error && err.name === 'MissingApiKeyError') throw err
    }
    summary.topicsRun++
    summary.created += counts.created
    summary.updated += counts.updated
    await payload.create({
      collection: 'research-runs',
      data: {
        topic: t.id,
        startedAt,
        finishedAt: new Date().toISOString(),
        status,
        createdCount: counts.created,
        updatedCount: counts.updated,
        expiredCount: 0,
        error,
        model,
      },
      overrideAccess: true,
    })
    // Mark as run even on failure so one broken topic does not starve the rest.
    await payload.update({ collection: 'research-topics', id: t.id, data: { lastRunAt: new Date().toISOString() }, overrideAccess: true })
  }

  summary.expired = await expireStale(payload)
  return summary
}
