import config from '@payload-config'
import { appAuth } from '@/lib/app-auth'
import { getPayload } from 'payload'

// Stored filenames are random UUIDs; offer the user's own title (ASCII-safe) instead.
const downloadName = (title: string | null | undefined, stored: string | null | undefined) => {
  const ext = stored?.match(/\.[a-z0-9]+$/i)?.[0] ?? ''
  const base = (title || 'document').replace(/[^\w\- ]+/g, '').trim().slice(0, 80) || 'document'
  return base.toLowerCase().endsWith(ext.toLowerCase()) ? base : `${base}${ext}`
}

export async function GET(request: Request, context: RouteContext<'/pathora-api/files/[id]/content'>) {
  const session = await appAuth.current()
  if (!session) return Response.json({ error: 'Sign in required.' }, { status: 401 })

  const { id } = await context.params
  const payload = await getPayload({ config })
  let file
  try {
    file = await payload.findByID({
      collection: 'profile-files',
      id,
      overrideAccess: false,
      user: session.user,
    })
  } catch {
    return Response.json({ error: 'File unavailable.' }, { status: 404 })
  }

  if (!file.url) return Response.json({ error: 'File unavailable.' }, { status: 404 })

  const source = new URL(file.url, request.url)
  const response = await fetch(source, {
    headers: { Authorization: `JWT ${session.token}` },
    cache: 'no-store',
  })
  if (!response.ok || !response.body) {
    return Response.json({ error: 'File unavailable.' }, { status: 404 })
  }

  return new Response(response.body, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `inline; filename="${downloadName(file.title, file.filename)}"`,
      'Content-Type': file.mimeType ?? 'application/octet-stream',
    },
  })
}
