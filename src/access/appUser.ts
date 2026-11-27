import type { Access, CollectionBeforeValidateHook } from 'payload'

export type AppUserRef = { id: string; collection: 'users' }

export const isAppUser = (user: unknown): user is AppUserRef =>
  Boolean(
    user &&
      typeof user === 'object' &&
      'collection' in user &&
      user.collection === 'users' &&
      'id' in user,
  )

export const isPayloadAdmin = (user: unknown): boolean =>
  Boolean(user && typeof user === 'object' && 'collection' in user && user.collection === 'admins')

/** App users may only touch their own documents; Payload admins may manage all. */
export const ownerOrAdmin: Access = ({ req }) => {
  if (isPayloadAdmin(req.user)) return true
  if (!isAppUser(req.user)) return false
  return { owner: { equals: req.user.id } }
}

export const appUserOnly: Access = ({ req }) => isAppUser(req.user)

/** Server-owned `owner` field: always the authenticated app user on create. */
export const setOwnerFromUser: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (operation === 'create' && isAppUser(req.user)) {
    return { ...data, owner: req.user.id }
  }
  return data
}

/** Field-level access that blocks clients from writing server-owned fields. */
export const serverOwnedField = {
  create: () => false,
  update: () => false,
}
