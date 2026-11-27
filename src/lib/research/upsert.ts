// Server-only.
import { createHash } from 'node:crypto'
import type { Payload } from 'payload'
import { attachListingImage } from '../listing-images'
import type { Candidate, UpsertResult } from './types'

export function slugify(institution: string, title: string): string {
  const base = `${institution}-${title}`
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const hash = createHash('sha1').update(`${institution}|${title}`).digest('hex').slice(0, 6)
  if (!base) return `listing-${hash}` // e.g. non-latin only names
  return base.length > 120 ? `${base.slice(0, 113).replace(/-+$/, '')}-${hash}` : base
}

const toDate = (d: string | null) => (d ? `${d}T12:00:00.000Z` : null)

function enData(c: Candidate) {
  return {
    type: c.type,
    title: c.title,
    institution: c.institution,
    country: c.country,
    city: c.city,
    summary: c.summary,
    studyFields: c.studyFields,
    degreeLevels: c.degreeLevels,
    fundingType: c.fundingType,
    fundingSummary: c.fundingSummary,
    deadline: toDate(c.deadline),
    deadlineNote: c.deadlineNote,
    requirements: { minimumGpa: c.minimumGpa, minimumIelts: c.minimumIelts, notes: c.requirementNotes },
    sourceUrl: c.sourceUrl,
    lastVerifiedAt: new Date().toISOString(),
  }
}

function thData(c: Candidate) {
  const t = c.th
  const hasAny = t.title || t.summary || t.fundingSummary || t.deadlineNote || t.requirementNotes
  if (!hasAny) return null
  return {
    ...(t.title ? { title: t.title } : {}),
    ...(t.summary ? { summary: t.summary } : {}),
    ...(t.fundingSummary ? { fundingSummary: t.fundingSummary } : {}),
    ...(t.deadlineNote ? { deadlineNote: t.deadlineNote } : {}),
    ...(t.requirementNotes ? { requirements: { notes: t.requirementNotes } } : {}),
  }
}

/**
 * Creates/updates AI listings. Uses the Local API with `overrideAccess: true`
 * because this is a trusted server-side job (cron / CLI) with no end user;
 * the collection's admin-only access rules would otherwise reject it.
 * Manual listings are never modified.
 */
const hostOf = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return null
  }
}

/** True when a manual listing in the same country links to the same official host. */
async function coveredByManualListing(payload: Payload, c: Candidate): Promise<boolean> {
  const host = hostOf(c.sourceUrl)
  if (!host) return false
  const manual = await payload.find({
    collection: 'opportunities',
    where: { and: [{ origin: { equals: 'manual' } }, { country: { equals: c.country } }] },
    limit: 100,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })
  return manual.docs.some((d) => typeof d.sourceUrl === 'string' && hostOf(d.sourceUrl) === host)
}

export async function upsertCandidates(payload: Payload, cands: Candidate[]): Promise<UpsertResult> {
  const result: UpsertResult = { created: 0, updated: 0, skipped: 0 }
  for (const c of cands) {
    try {
      const slug = slugify(c.institution, c.title)
      const found = await payload.find({
        collection: 'opportunities',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        pagination: false,
      })
      const existing = found.docs[0]
      let id: number | string
      if (existing) {
        if (existing.origin === 'manual') {
          result.skipped++
          continue
        }
        await payload.update({
          collection: 'opportunities',
          id: existing.id,
          locale: 'en',
          // Never un-hide a listing an admin hid; only revive expired ones.
          data: { ...enData(c), ...(existing.listingStatus === 'hidden' ? {} : { listingStatus: 'active' }) },
          overrideAccess: true,
        })
        id = existing.id
        result.updated++
      } else if (await coveredByManualListing(payload, c)) {
        // A hand-made listing already covers this programme's official site: keep that one.
        result.skipped++
        continue
      } else {
        const created = await payload.create({
          collection: 'opportunities',
          locale: 'en',
          data: { ...enData(c), slug, origin: 'ai', listingStatus: 'active' },
          overrideAccess: true,
        })
        id = created.id
        result.created++
        try {
          await attachListingImage(payload, { ...enData(c), id, slug })
        } catch (err) {
          payload.logger.warn({ err, title: c.title }, 'research: image attach failed')
        }
      }
      const th = thData(c)
      if (th) {
        await payload.update({ collection: 'opportunities', id, locale: 'th', data: th, overrideAccess: true })
      }
    } catch (err) {
      result.skipped++
      payload.logger.error({ err, title: c.title }, 'research: failed to upsert listing')
    }
  }
  return result
}

/** AI listings whose deadline has passed become `expired` (rolling listings have no deadline). */
export async function expireStale(payload: Payload): Promise<number> {
  const today = `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`
  const res = await payload.update({
    collection: 'opportunities',
    where: {
      and: [
        { origin: { equals: 'ai' } },
        { listingStatus: { equals: 'active' } },
        { deadline: { less_than: today } },
      ],
    },
    data: { listingStatus: 'expired' },
    overrideAccess: true,
  })
  return res.docs.length
}
