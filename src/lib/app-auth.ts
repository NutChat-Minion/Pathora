import 'server-only'

import config from '@payload-config'
import type { User } from '@/payload-types'
import { cookies } from 'next/headers'
import { createAuthToken, createPayloadRequestFromWebRequest, getPayload } from 'payload'

const APP_SESSION_COOKIE = 'app-session'

export type AppUser = User

export function createAppAuth() {
  return {
    async current() {
      const token = (await cookies()).get(APP_SESSION_COOKIE)?.value
      if (!token) return null

      const payload = await getPayload({ config })
      const authHeaders = new Headers({ Authorization: `JWT ${token}` })
      const { user } = await payload.auth({ headers: authHeaders })
      if (!user || user.collection !== 'users') return null

      return { token, user: user as AppUser }
    },

    async login(email: string, password: string) {
      const payload = await getPayload({ config })
      const result = await payload.login({
        collection: 'users',
        data: { email, password },
      })
      return { token: result.token, user: result.user as AppUser }
    },

    /**
     * Issues a real Payload session token for a user who already proved identity another way
     * (Google OAuth). Mirrors loginOperation: createAuthToken adds the session (sid) to the user
     * and signs the JWT with the collection's tokenExpiration, so payload.auth() accepts it.
     */
    async loginWithoutPassword(user: AppUser, request: Request) {
      const payload = await getPayload({ config })
      const collectionConfig = payload.collections.users.config
      const req = await createPayloadRequestFromWebRequest({
        config,
        request,
        shouldAuthenticate: false,
      })
      // Raw DB doc, as loginOperation uses, since the session write spreads the whole user.
      const dbUser = await payload.db.findOne<any>({
        collection: 'users',
        req,
        where: { id: { equals: user.id } },
      })
      if (!dbUser) throw new Error('User not found')
      const { token } = await createAuthToken({
        type: 'login',
        collectionConfig,
        email: dbUser.email,
        req,
        user: dbUser,
      })
      return { token, user }
    },

    async register(email: string, password: string, name: string) {
      const payload = await getPayload({ config })
      await payload.create({
        collection: 'users',
        data: { email, password, name },
        overrideAccess: false,
      })
      return this.login(email, password)
    },

    async setSession(token: string) {
      const cookieStore = await cookies()
      cookieStore.set(APP_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 2 * 60 * 60,
        path: '/',
      })
    },

    async clearSession() {
      const cookieStore = await cookies()
      cookieStore.delete(APP_SESSION_COOKIE)
    },
  }
}

export const appAuth = createAppAuth()
