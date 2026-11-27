import type { CollectionConfig } from 'payload'
import { appUserOnly, ownerOrAdmin, serverOwnedField, setOwnerFromUser } from '../access/appUser'

export const planStatusOptions = [
  { label: 'Interested', value: 'interested' },
  { label: 'Preparing', value: 'preparing' },
  { label: 'Ready to apply', value: 'ready' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
]

export const ApplicationPlans: CollectionConfig = {
  slug: 'application-plans',
  access: {
    create: appUserOnly,
    read: ownerOrAdmin,
    update: ownerOrAdmin,
    delete: ownerOrAdmin,
  },
  admin: { hidden: true, useAsTitle: 'title' },
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
    {
      name: 'opportunity',
      type: 'relationship',
      relationTo: 'opportunities',
      required: true,
      access: { update: () => false },
    },
    { name: 'title', type: 'text', required: true, maxLength: 200 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'preparing',
      options: planStatusOptions,
    },
    { name: 'targetDeadline', type: 'date' },
    {
      name: 'tasks',
      type: 'array',
      maxRows: 100,
      fields: [
        { name: 'title', type: 'text', required: true, maxLength: 200 },
        { name: 'done', type: 'checkbox', defaultValue: false },
        { name: 'dueDate', type: 'date' },
      ],
    },
  ],
}
