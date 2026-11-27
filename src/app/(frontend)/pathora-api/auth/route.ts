import { appAuth } from '@/lib/app-auth'

const cleanEmail = (value: unknown) =>
  typeof value === 'string' && value.length <= 254 ? value.trim().toLowerCase() : ''

export async function GET() {
  const session = await appAuth.current()
  if (!session) return Response.json({ user: null }, { status: 401 })

  const { id, email, name, additionalInfo } = session.user
  return Response.json({ user: { id, email, name, additionalInfo: additionalInfo ?? [] } })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const email = cleanEmail(body.email)
    const password = typeof body.password === 'string' ? body.password : ''
    const name =
      typeof body.name === 'string' && body.name.trim().length <= 120 ? body.name.trim() : ''

    if (!email || password.length < 8 || password.length > 128) {
      return Response.json(
        { error: 'Enter a valid email and a password of at least 8 characters.' },
        { status: 400 },
      )
    }

    const result =
      body.mode === 'register'
        ? await appAuth.register(email, password, name)
        : await appAuth.login(email, password)

    if (!result.token) {
      return Response.json({ error: 'Unable to start a secure session.' }, { status: 500 })
    }

    await appAuth.setSession(result.token)
    return Response.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        additionalInfo: result.user.additionalInfo ?? [],
      },
    })
  } catch {
    return Response.json({ error: 'The email or password was not accepted.' }, { status: 401 })
  }
}

export async function DELETE() {
  await appAuth.clearSession()
  return Response.json({ ok: true })
}
