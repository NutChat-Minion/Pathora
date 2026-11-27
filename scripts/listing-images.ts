// Usage: pnpm images   (attaches a photo to every non-hidden listing that has none)
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { attachListingImage, usedSourceKeys } from '../src/lib/listing-images'

const payload = await getPayload({ config })
const reassign = process.argv.includes('--reassign-duplicates')
let res: any
if (reassign) {
  const all = await payload.find({
    collection: 'opportunities',
    sort: 'id',
    limit: 2000,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  const seen = new Set<string>()
  const dups: any[] = []
  for (const d of all.docs as any[]) {
    const m = d.image == null ? null : String(typeof d.image === 'object' ? d.image.id : d.image)
    if (!m) continue
    if (seen.has(m)) dups.push(d)
    else seen.add(m)
  }
  res = { docs: dups }
} else res = await payload.find({
  collection: 'opportunities',
  where: { and: [{ image: { exists: false } }, { listingStatus: { not_equals: 'hidden' } }] },
  limit: 1000,
  depth: 0,
  pagination: false,
  overrideAccess: true,
})
console.log(`${res.docs.length} listings without image`)
let ok = 0
const used = await usedSourceKeys(payload)
for (const d of res.docs as any[]) {
  try {
    const id = await attachListingImage(payload, d, { used, skipOwn: reassign })
    if (id) ok++
    console.log(id ? 'OK  ' : 'NONE', d.country, '|', d.institution, '|', d.title)
  } catch (err) {
    console.log('ERR ', d.title, (err as Error).message)
  }
  await new Promise((r) => setTimeout(r, 500))
}
console.log(`done: ${ok}/${res.docs.length}`)
process.exit(0)
