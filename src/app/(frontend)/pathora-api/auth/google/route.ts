import { generateCodeVerifier, generateState, Google } from 'arctic'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/app'
  return value.slice(0, 500)
}

export function redirectUri(request: Request) {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '')
  return `${origin}/pathora-api/auth/google/callback`
}

export function GET(request: Request) {
  const origin = new URL(request.url).origin
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return Response.redirect(`${origin}/login?error=google_unavailable`, 302)

  return (async () => {
    const state = generateState()
    const verifier = generateCodeVerifier()
    const next = safeNext(new URL(request.url).searchParams.get('next'))
    const url = new Google(clientId, clientSecret, redirectUri(request)).createAuthorizationURL(state, verifier, [
      'openid',
      'email',
      'profile',
    ])
    const store = await cookies()
    const opts = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600,
      path: '/pathora-api/auth/google',
    }
    store.set('g_oauth_state', state, opts)
    store.set('g_oauth_verifier', verifier, opts)
    store.set('g_oauth_next', next, opts)
    return Response.redirect(url.toString(), 302)
  })()
}
