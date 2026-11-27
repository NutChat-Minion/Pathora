import config from '@payload-config'
import { appAuth } from '@/lib/app-auth'
import { getPayload } from 'payload'

type InfoRow = { label: string; value: string }

const cleanRows = (value: unknown): InfoRow[] | null => {
  if (!Array.isArray(value) || value.length > 20) return null
  const rows = value.map((row) => {
    if (!row || typeof row !== 'object') return null
    const label = 'label' in row && typeof row.label === 'string' ? row.label.trim() : ''
    const content = 'value' in row && typeof row.value === 'string' ? row.value.trim() : ''
    if (!label || !content || label.length > 80 || content.length > 500) return null
    return { label, value: content }
  })
  return rows.every(Boolean) ? (rows as InfoRow[]) : null
}

export async function PATCH(request: Request) {
  const session = await appAuth.current()
  if (!session) return Response.json({ error: 'Sign in required.' }, { status: 401 })

  const body = (await request.json()) as Record<string, unknown>
  const additionalInfo = cleanRows(body.additionalInfo)
  if (!additionalInfo) {
    return Response.json({ error: 'Check each label and value, then try again.' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const user = await payload.update({
    collection: 'users',
    id: session.user.id,
    data: { additionalInfo },
    overrideAccess: false,
    user: session.user,
  })

  return Response.json({ additionalInfo: user.additionalInfo ?? [] })
}
