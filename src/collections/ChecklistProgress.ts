import type { CollectionConfig } from 'payload'
import { appUserOnly, ownerOrAdmin, serverOwnedField, setOwnerFromUser } from '../access/appUser'

export const ChecklistProgress: CollectionConfig = {
  slug: 'checklist-progress',
  access: { create: appUserOnly, read: ownerOrAdmin, update: ownerOrAdmin, delete: ownerOrAdmin },
  admin: { hidden: true },
  hooks: { beforeValidate: [setOwnerFromUser] },
  indexes: [{ fields: ['owner', 'checklist'], unique: true }],
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: serverOwnedField,
    },
    {
      name: 'checklist',
      type: 'select',
      required: true,
      options: [
        { label: 'Visa', value: 'visa' },
        { label: 'Pre-departure', value: 'pre-departure' },
      ],
      access: { update: () => false },
    },
    { name: 'completedItems', type: 'text', hasMany: true, maxRows: 50 },
  ],
}
