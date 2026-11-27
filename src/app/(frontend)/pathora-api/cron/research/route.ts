import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { MissingApiKeyError, runScheduledResearch, seedDefaultTopics } from '@/lib/research'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

/** Vercel Cron target (sends `Authorization: Bearer $CRON_SECRET`). */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY (or ANTHROPIC_API_KEY) is not configured' }, { status: 503 })
  }
  try {
    const payload = await getPayload({ config })
    const seeded = await seedDefaultTopics(payload)
    const summary = await runScheduledResearch(payload, { maxTopics: 3, budgetSeconds: 230 })
    return NextResponse.json({ ok: true, seededTopics: seeded, ...summary })
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      return NextResponse.json({ error: err.message }, { status: 503 })
    }
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Research run failed' }, { status: 500 })
  }
}
