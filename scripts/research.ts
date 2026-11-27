// Usage: pnpm research -- --topics=8   (fills the opportunity catalog now)
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { runScheduledResearch, seedDefaultTopics } from '../src/lib/research'

const arg = (name: string, fallback: number) => {
  const m = process.argv.find((a) => a.startsWith(`--${name}=`))
  const n = m ? Number(m.split('=')[1]) : NaN
  return Number.isFinite(n) && n > 0 ? n : fallback
}

const payload = await getPayload({ config })
const seeded = await seedDefaultTopics(payload)
if (seeded) console.log(`Seeded ${seeded} default research topics`)
const summary = await runScheduledResearch(payload, {
  maxTopics: arg('topics', 8),
  budgetSeconds: arg('budget', 3600),
})
console.log(JSON.stringify(summary, null, 2))
process.exit(summary.failed > 0 && summary.failed === summary.topicsRun ? 1 : 0)
