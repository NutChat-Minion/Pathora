import config from '@payload-config'
import { appAuth } from '@/lib/app-auth'
import { getPayload } from 'payload'

export async function DELETE(_request: Request, context: RouteContext<'/pathora-api/files/[id]'>) {
  const session = await appAuth.current()
  if (!session) return Response.json({ error: 'Sign in required.' }, { status: 401 })

  const { id } = await context.params
  const payload = await getPayload({ config })
  try {
    await payload.delete({
      collection: 'profile-files',
      id,
      overrideAccess: false,
      user: session.user,
    })
  } catch {
    return Response.json({ error: 'File not found.' }, { status: 404 })
  }

  return Response.json({ ok: true })
}
