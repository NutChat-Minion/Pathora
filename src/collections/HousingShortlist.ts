import type { CollectionConfig } from 'payload'
import { appUserOnly, ownerOrAdmin, serverOwnedField, setOwnerFromUser } from '../access/appUser'

export const HousingShortlist: CollectionConfig = {
  slug: 'housing-shortlist',
  access: { create: appUserOnly, read: ownerOrAdmin, update: ownerOrAdmin, delete: ownerOrAdmin },
  admin: { hidden: true, useAsTitle: 'name' },
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
    { name: 'name', type: 'text', required: true, maxLength: 160 },
    {
      name: 'url',
      type: 'text',
      maxLength: 500,
      validate: (value: string | null | undefined) =>
        !value || /^https?:\/\/\S+$/i.test(value) ? true : 'Must be an http(s) link.',
    },
    { name: 'city', type: 'text', maxLength: 80 },
    { name: 'weeklyPrice', type: 'number', min: 0 },
    { name: 'currency', type: 'text', maxLength: 8 },
    {
      name: 'roomType',
      type: 'select',
      options: [
        { label: 'Private room', value: 'private-room' },
        { label: 'Studio', value: 'studio' },
        { label: 'Shared', value: 'shared' },
        { label: 'Homestay', value: 'homestay' },
        { label: 'Dorm', value: 'dorm' },
      ],
    },
    { name: 'notes', type: 'textarea', maxLength: 1000 },
  ],
}
