import type { Access, CollectionConfig, Where } from 'payload'
import { appUserOnly, isAppUser, isPayloadAdmin, ownerOrAdmin, serverOwnedField, setOwnerFromUser } from '../access/appUser'

const readOpenOrOwn: Access = ({ req }) => {
  if (isPayloadAdmin(req.user)) return true
  if (!isAppUser(req.user)) return false
  return { or: [{ status: { equals: 'open' } }, { owner: { equals: req.user.id } }] } as Where
}

export const Trips: CollectionConfig = {
  slug: 'trips',
  access: { create: appUserOnly, read: readOpenOrOwn, update: ownerOrAdmin, delete: ownerOrAdmin },
  admin: { group: 'Community', useAsTitle: 'destination' },
  hooks: { beforeValidate: [setOwnerFromUser] },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: serverOwnedField,
    },
    { name: 'origin', type: 'text', required: true, maxLength: 80 },
    { name: 'destination', type: 'text', required: true, maxLength: 80 },
    { name: 'travelDate', type: 'date', required: true, index: true },
    { name: 'flexible', type: 'checkbox', defaultValue: false },
    { name: 'note', type: 'textarea', maxLength: 500 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      index: true,
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Closed', value: 'closed' },
      ],
    },
  ],
}
