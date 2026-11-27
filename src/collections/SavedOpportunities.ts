import type { CollectionConfig } from 'payload'
import { appUserOnly, ownerOrAdmin, serverOwnedField, setOwnerFromUser } from '../access/appUser'

export const SavedOpportunities: CollectionConfig = {
  slug: 'saved-opportunities',
  access: {
    create: appUserOnly,
    read: ownerOrAdmin,
    update: () => false,
    delete: ownerOrAdmin,
  },
  admin: { hidden: true },
  hooks: { beforeValidate: [setOwnerFromUser] },
  indexes: [{ fields: ['owner', 'opportunity'], unique: true }],
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: serverOwnedField,
    },
    { name: 'opportunity', type: 'relationship', relationTo: 'opportunities', required: true },
  ],
}
