import type { CollectionConfig } from 'payload'
import { appUserOnly, ownerOrAdmin, serverOwnedField, setOwnerFromUser } from '../access/appUser'

export const TripInterests: CollectionConfig = {
  slug: 'trip-interests',
  access: { create: appUserOnly, read: ownerOrAdmin, update: () => false, delete: ownerOrAdmin },
  admin: { hidden: true },
  hooks: { beforeValidate: [setOwnerFromUser] },
  indexes: [{ fields: ['owner', 'trip'], unique: true }],
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: serverOwnedField,
    },
    { name: 'trip', type: 'relationship', relationTo: 'trips', required: true, index: true },
  ],
}
