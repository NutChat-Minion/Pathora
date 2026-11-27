import { randomBytes, timingSafeEqual } from 'node:crypto'
import { decodeIdToken, Google } from 'arctic'
import config from '@payload-config'
import { cookies } from 'next/headers'
import { getPayload, type Where } from 'payload'
import { appAuth } from '@/lib/app-auth'
import { redirectUri, safeNext } from '../route'

export const dynamic = 'force-dynamic'

const ISSUERS = ['https://accounts.google.com', 'accounts.google.com']
const COOKIE_PATH = '/pathora-api/auth/google'

function same(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const fail = () => Response.redirect(`${origin}/login?error=google`, 302)
  const store = await cookies()
  const state = store.get('g_oauth_state')?.value
  const verifier = store.get('g_oauth_verifier')?.value
  const next = safeNext(store.get('g_oauth_next')?.value ?? null)
  for (const name of ['g_oauth_state', 'g_oauth_verifier', 'g_oauth_next']) {
    store.set(name, '', { path: COOKIE_PATH, maxAge: 0 })
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const params = new URL(request.url).searchParams
    const code = params.get('code')
    const returned = params.get('state')
    if (!clientId || !clientSecret || !state || !verifier || !code || !returned) return fail()
    if (!same(state, returned)) return fail()

    const google = new Google(clientId, clientSecret, redirectUri(request))
    const tokens = await google.validateAuthorizationCode(code, verifier)
    const claims = decodeIdToken(tokens.idToken()) as {
      sub?: string
      email?: string
      email_verified?: boolean
      name?: string
      aud?: string | string[]
      iss?: string
      exp?: number
    }
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
    if (
      claims.email_verified !== true ||
      !claims.sub ||
      !claims.email ||
      !aud.includes(clientId) ||
      !claims.iss ||
      !ISSUERS.includes(claims.iss) ||
      typeof claims.exp !== 'number' ||
      claims.exp * 1000 <= Date.now()
    ) {
      return fail()
    }
    const email = claims.email.trim().toLowerCase()

    // Trusted server-side flow: overrideAccess is required because googleSub is a server-owned
    // field (field access blocks all API writes) and the visitor is not authenticated yet.
    const payload = await getPayload({ config })
    const find = async (where: Where) =>
      (await payload.find({ collection: 'users', where, limit: 1, depth: 0, overrideAccess: true })).docs[0]

    let user = await find({ googleSub: { equals: claims.sub } })
    if (!user) {
      const byEmail = await find({ email: { equals: email } })
      if (byEmail) {
        if (byEmail.googleSub && byEmail.googleSub !== claims.sub) return fail()
        user = await payload.update({
          collection: 'users',
          id: byEmail.id,
          data: { googleSub: claims.sub },
          overrideAccess: true,
        })
      } else {
        user = await payload.create({
          collection: 'users',
          data: {
            email,
            name: (claims.name ?? '').slice(0, 120),
            password: randomBytes(32).toString('hex'),
            googleSub: claims.sub,
          },
          overrideAccess: true,
        })
      }
    }

    const { token } = await appAuth.loginWithoutPassword(user, request)
    await appAuth.setSession(token)
    return Response.redirect(`${origin}${next}`, 302)
  } catch {
    return fail()
  }
}
