import { APIError, type Access, type CollectionConfig, type FieldAccess, type Where } from 'payload'
import { appUserOnly, isAppUser, isPayloadAdmin, serverOwnedField } from '../access/appUser'
import { setFieldFromUser } from '../access/community'

const idOf = (value: unknown): string =>
  value && typeof value === 'object' ? String((value as { id?: unknown }).id ?? '') : String(value ?? '')

const involvesMe: Access = ({ req }) => {
  if (isPayloadAdmin(req.user)) return true
  if (!isAppUser(req.user)) return false
  return { or: [{ from: { equals: req.user.id } }, { to: { equals: req.user.id } }] } as Where
}

const fromMe: Access = ({ req }) => {
  if (isPayloadAdmin(req.user)) return true
  if (!isAppUser(req.user)) return false
  return { from: { equals: req.user.id } }
}

/** Only the recipient (or an admin) may change the status. */
const recipientOnly: FieldAccess = ({ req, doc }) =>
  isPayloadAdmin(req.user) || (isAppUser(req.user) && idOf(doc?.to) === String(req.user.id))

export const BuddyConnections: CollectionConfig = {
  slug: 'buddy-connections',
  access: { create: appUserOnly, read: involvesMe, update: involvesMe, delete: fromMe },
  admin: { hidden: true },
  hooks: {
    beforeValidate: [
      setFieldFromUser('from'),
      ({ data, operation }) => {
        if (operation === 'create' && data && idOf(data.from) === idOf(data.to)) {
          throw new APIError('You cannot connect with yourself.', 400)
        }
        return data
      },
    ],
  },
  indexes: [{ fields: ['from', 'to'], unique: true }],
  fields: [
    {
      name: 'from',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: serverOwnedField,
    },
    {
      name: 'to',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: { update: () => false },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Declined', value: 'declined' },
      ],
      access: { create: () => false, update: recipientOnly },
    },
  ],
}
