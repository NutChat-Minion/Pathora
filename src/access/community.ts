import type { Access, CollectionBeforeValidateHook, FieldAccess, Where } from 'payload'
import { isAppUser, isPayloadAdmin } from './appUser'

/** Admins see everything; everyone else sees visible docs plus their own (any status). */
export const visibleOrOwn =
  (ownerField: string): Access =>
  ({ req }) => {
    if (isPayloadAdmin(req.user)) return true
    if (isAppUser(req.user)) {
      return {
        or: [{ status: { equals: 'visible' } }, { [ownerField]: { equals: req.user.id } }],
      } as Where
    }
    return { status: { equals: 'visible' } } as Where
  }

export const ownField =
  (field: string): Access =>
  ({ req }) => {
    if (isPayloadAdmin(req.user)) return true
    if (!isAppUser(req.user)) return false
    return { [field]: { equals: req.user.id } } as Where
  }

export const adminOnly: Access = ({ req }) => isPayloadAdmin(req.user)

/** Server-owned fields: clients can never write them; Payload admins may (moderation). */
const adminFieldWrite: FieldAccess = ({ req }) => isPayloadAdmin(req.user)
export const adminWritableField = { create: adminFieldWrite, update: adminFieldWrite }

export const setFieldFromUser =
  (field: string): CollectionBeforeValidateHook =>
  ({ data, operation, req }) => {
    if (operation === 'create' && isAppUser(req.user)) return { ...data, [field]: req.user.id }
    return data
  }
