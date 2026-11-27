// Server-only. Finds a real photo for a listing and attaches it as a Media doc.
import type { Payload } from 'payload'
import sharp from 'sharp'

const UA = 'PathoraBot/1.0 (+https://pathora-gamma.vercel.app)'
const MAX_BYTES = 8 * 1024 * 1024

export type ListingImage = { url: string; alt: string; credit?: string; pageUrl?: string }
type ListingLike = {
  title?: string | null
  institution?: string | null
  country?: string | null
  sourceUrl?: string | null
}

const LM: Record<string, string[]> = {
  'United Kingdom': ['Palace of Westminster', 'Tower Bridge', 'University of Oxford', 'Edinburgh Castle', 'Stonehenge', 'University of Cambridge'],
  Japan: ['Mount Fuji', 'Tokyo Tower', 'Kinkaku-ji', 'Fushimi Inari-taisha', 'Himeji Castle', 'Osaka Castle'],
  Germany: ['Brandenburg Gate', 'Neuschwanstein Castle', 'Cologne Cathedral', 'Heidelberg Castle', 'Munich', 'Berlin Cathedral'],
  'United States': ['Statue of Liberty', 'Golden Gate Bridge', 'Harvard University', 'Washington Monument', 'Grand Canyon', 'Space Needle'],
  'South Korea': ['Gyeongbokgung', 'N Seoul Tower', 'Seoul', 'Bulguksa', 'Busan', 'Changdeokgung'],
  France: ['Eiffel Tower', 'Louvre', 'Mont Saint-Michel', 'Palace of Versailles', 'Notre-Dame de Paris', 'Lyon'],
  Netherlands: ['Kinderdijk', 'Amsterdam', 'Delft', 'Rotterdam', 'Utrecht', 'Leiden'],
  Singapore: ['Marina Bay Sands', 'Gardens by the Bay', 'Merlion', 'Singapore Flyer', 'Clarke Quay', 'Esplanade, Singapore'],
  Australia: ['Sydney Opera House', 'Sydney Harbour Bridge', 'Melbourne', 'Uluru', 'Great Barrier Reef', 'Brisbane'],
  Canada: ['Parliament Hill', 'CN Tower', 'Banff National Park', 'Niagara Falls', 'Vancouver', 'Old Quebec'],
  'New Zealand': ['Milford Sound', 'Lake Tekapo', 'Wellington', 'Auckland', 'Mount Cook', 'Queenstown, New Zealand'],
  Thailand: ['Chulalongkorn University', 'Wat Arun', 'Bangkok', 'Chiang Mai', 'Grand Palace', 'Phi Phi Islands'],
  Europe: ['Strasbourg', 'Prague', 'Vienna', 'Brussels', 'Barcelona', 'Rome', 'Lisbon', 'Budapest'],
  Multiple: ['Chulalongkorn University', 'Bangkok', 'University of Oxford', 'Geneva', 'Singapore', 'Tokyo', 'Copenhagen', 'Zurich'],
}
const landmarksFor = (country: string) =>
  LM[country] ?? (/europe/i.test(country) ? LM.Europe : LM.Multiple)

// Wikipedia asks for <=1 req/s; applies to all hosts for simplicity.
let lastWiki = 0
async function wikiPace() {
  const wait = lastWiki + 1100 - Date.now()
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastWiki = Date.now()
}

async function fetchT(url: string, ms = 8000, accept?: string) {
  return fetch(url, {
    headers: { 'User-Agent': UA, ...(accept ? { Accept: accept } : {}) },
    signal: AbortSignal.timeout(ms),
    redirect: 'follow',
  })
}

const BAD_URL = /logo|icon|favicon|sprite|\.svg|seal|emblem|coat_of_arms|flag|crest/i

async function download(url: string): Promise<Buffer | null> {
  try {
    const res = await fetchT(url, 15000, 'image/*')
    if (!res.ok) return null
    const len = Number(res.headers.get('content-length') ?? 0)
    if (len > MAX_BYTES) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return buf.length > MAX_BYTES ? null : buf
  } catch {
    return null
  }
}

/** Downloads and verifies size (>=600w) and aspect (1.2..2.6). */
async function acceptable(url: string): Promise<Buffer | null> {
  if (BAD_URL.test(decodeURIComponent(url).split('?')[0])) return null
  const buf = await download(url)
  if (!buf) return null
  try {
    const m = await sharp(buf).metadata()
    if (!m.width || !m.height || m.format === 'svg') return null
    const ar = m.width / m.height
    if (m.width < 600 || ar < 1.2 || ar > 2.6) return null
    return buf
  } catch {
    return null
  }
}

function metaImages(html: string, base: string): string[] {
  const out: string[] = []
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []
  for (const t of tags) {
    const key = /(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(t)?.[1]?.toLowerCase()
    if (key !== 'og:image' && key !== 'og:image:url' && key !== 'og:image:secure_url' && key !== 'twitter:image' && key !== 'twitter:image:src') continue
    const c = /content\s*=\s*["']([^"']+)["']/i.exec(t)?.[1]
    if (!c) continue
    try {
      out.push(new URL(c.replace(/&amp;/g, '&'), base).toString())
    } catch {}
  }
  return [...new Set(out)]
}

type Found = ListingImage & { buf: Buffer; key: string }

async function fromSource(l: ListingLike, used: Set<string>): Promise<Found | null> {
  if (!l.sourceUrl) return null
  try {
    const res = await fetchT(l.sourceUrl, 8000, 'text/html')
    if (!res.ok) return null
    const html = (await res.text()).slice(0, 600_000)
    for (const u of metaImages(html, res.url || l.sourceUrl)) {
      if (used.has(u)) continue
      const buf = await acceptable(u)
      if (buf) {
        return { url: u, key: u, buf, alt: `${l.institution || l.title || 'Listing'} campus`, pageUrl: l.sourceUrl }
      }
    }
  } catch {}
  return null
}

async function fromWikipedia(title: string, alt: string, used: Set<string>): Promise<Found | null> {
  try {
    await wikiPace()
    const res = await fetchT(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`,
      8000,
      'application/json',
    )
    if (!res.ok) return null
    const j: any = await res.json()
    if (j.type === 'disambiguation') return null
    const src: string | undefined = j.originalimage?.source
    if (!src || used.has(src)) return null
    const buf = await acceptable(src)
    if (!buf) return null
    const pageUrl: string = j.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
    return { url: src, key: src, buf, alt, pageUrl, credit: `Photo: Wikipedia / Wikimedia Commons (${j.title ?? title}), CC licensed` }
  } catch {
    return null
  }
}

const BAD_TITLE = /logo|seal|emblem|coat of arms|flag|map|diagram|icon|signature|portrait/i

async function fromCommons(query: string, alt: string, used: Set<string>): Promise<Found | null> {
  try {
    await wikiPace()
    const api =
      'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=10' +
      `&gsrsearch=${encodeURIComponent(query)}&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1200`
    const res = await fetchT(api, 10000, 'application/json')
    if (!res.ok) return null
    const j: any = await res.json()
    const pages: any[] = Object.values(j?.query?.pages ?? {}).sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0))
    for (const p of pages) {
      const ii = p.imageinfo?.[0]
      if (!ii || BAD_TITLE.test(p.title ?? '')) continue
      if (!/^image\/(jpeg|webp)$/.test(ii.mime ?? '')) continue
      const ar = ii.width / ii.height
      if (ii.width < 800 || ar < 1.2 || ar > 2.4) continue
      const key: string = ii.descriptionurl
      if (!key || used.has(key) || !ii.thumburl) continue
      const buf = await acceptable(ii.thumburl)
      if (!buf) continue
      const em = ii.extmetadata ?? {}
      const artist = String(em.Artist?.value ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      const lic = String(em.LicenseShortName?.value ?? '').trim()
      const credit = `Photo: ${artist || 'Wikimedia Commons'}${lic ? ` (${lic})` : ''} via Wikimedia Commons`
      return { url: ii.thumburl, key, buf, alt, pageUrl: key, credit }
    }
  } catch {}
  return null
}

async function find(l: ListingLike, used: Set<string>, skipOwn = false): Promise<Found | null> {
  const inst = (l.institution ?? '').trim()
  const country = (l.country ?? '').trim()
  const city = ((l as any).city ?? '').toString().trim()
  if (!skipOwn) {
    const own = await fromSource(l, used)
    if (own) return own
  }
  if (inst) {
    for (const q of [`${inst} campus`, inst]) {
      const c = await fromCommons(q, `${inst} campus`, used)
      if (c) return c
    }
  }
  if (city) {
    const c = await fromCommons(`${city} university`, `${city}${country ? `, ${country}` : ''}`, used)
    if (c) return c
  }
  if (country && !/multiple|europe/i.test(country)) {
    const c = await fromCommons(`${country} university campus`, `University campus, ${country}`, used)
    if (c) return c
  }
  if (inst) {
    const w = await fromWikipedia(inst, `${inst} campus`, used)
    if (w) return w
  }
  if (l.title && l.title !== inst) {
    const w = await fromWikipedia(l.title, `${l.title}${country ? `, ${country}` : ''}`, used)
    if (w) return w
  }
  for (const name of landmarksFor(country)) {
    const w = await fromWikipedia(name, `${name}${country && !/multiple|europe/i.test(country) ? `, ${country}` : ''}`, used)
    if (w) return w
  }
  return null
}

/** Source keys (Media.sourceUrl) of images linked to opportunities other than `exceptId`. */
export async function usedSourceKeys(payload: Payload, exceptId?: number | string): Promise<Set<string>> {
  const opps = await payload.find({ collection: 'opportunities', limit: 2000, depth: 1, pagination: false, overrideAccess: true })
  const set = new Set<string>()
  for (const o of opps.docs as any[]) {
    if (exceptId !== undefined && String(o.id) === String(exceptId)) continue
    const m = o.image
    if (m && typeof m === 'object' && m.sourceUrl) set.add(m.sourceUrl)
  }
  return set
}

/** Finds the best image for a listing (without storing it). */
export async function findListingImage(l: ListingLike): Promise<ListingImage | null> {
  const f = await find(l, new Set())
  return f ? { url: f.url, alt: f.alt, credit: f.credit, pageUrl: f.pageUrl } : null
}

/**
 * Finds, stores (as Media) and links an image for an opportunity. Trusted server job, so it
 * uses the Local API with overrideAccess:true (media create/update are admin-only).
 * Returns the media id, or null when nothing suitable was found.
 */
export async function attachListingImage(
  payload: Payload,
  opp: ListingLike & { id: number | string; slug?: string | null },
  opts: { used?: Set<string>; skipOwn?: boolean } = {},
): Promise<number | string | null> {
  const used = opts.used ?? (await usedSourceKeys(payload, opp.id))
  const f = await find(opp, used, opts.skipOwn)
  if (!f) return null
  const reused = await payload.find({
    collection: 'media',
    where: { sourceUrl: { equals: f.key } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  let mediaId: number | string
  if (reused.docs[0]) {
    mediaId = reused.docs[0].id
  } else {
    const data = await sharp(f.buf)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()
    const base = (opp.slug || `listing-${opp.id}`).slice(0, 80)
    const media = await payload.create({
      collection: 'media',
      data: { alt: f.alt, credit: f.credit ?? null, sourceUrl: f.key },
      file: { data, mimetype: 'image/webp', name: `${base}.webp`, size: data.length },
      overrideAccess: true,
    })
    mediaId = media.id
  }
  await payload.update({
    collection: 'opportunities',
    id: opp.id,
    data: { image: mediaId as any },
    overrideAccess: true,
  })
  used.add(f.key)
  return mediaId
}
