import type { CollectionConfig } from 'payload'
import { isPayloadAdmin } from '../access/appUser'

export const degreeLevelOptions = [
  { label: 'Bachelor’s', value: 'bachelor' },
  { label: 'Master’s', value: 'master' },
  { label: 'PhD', value: 'phd' },
]

/**
 * Real scholarship, university and program listings.
 * Phase 2 fills this collection from a scheduled AI research job; admins can also edit.
 * Public visitors only see `listingStatus: active`.
 */
export const Opportunities: CollectionConfig = {
  slug: 'opportunities',
  access: {
    read: ({ req }) => (isPayloadAdmin(req.user) ? true : { listingStatus: { equals: 'active' } }),
    create: ({ req }) => isPayloadAdmin(req.user),
    update: ({ req }) => isPayloadAdmin(req.user),
    delete: ({ req }) => isPayloadAdmin(req.user),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'country', 'deadline', 'listingStatus', 'lastVerifiedAt'],
    group: 'Listings',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          index: true,
          options: [
            { label: 'Scholarship', value: 'scholarship' },
            { label: 'University', value: 'university' },
            { label: 'Program', value: 'program' },
          ],
        },
        {
          name: 'listingStatus',
          type: 'select',
          required: true,
          defaultValue: 'active',
          index: true,
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Expired', value: 'expired' },
            { label: 'Hidden', value: 'hidden' },
          ],
        },
      ],
    },
    { name: 'title', type: 'text', required: true, localized: true, maxLength: 200 },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, maxLength: 200 },
    { name: 'institution', type: 'text', required: true, maxLength: 200 },
    {
      type: 'row',
      fields: [
        { name: 'country', type: 'text', required: true, index: true, maxLength: 80 },
        { name: 'city', type: 'text', maxLength: 80 },
      ],
    },
    { name: 'summary', type: 'textarea', localized: true, maxLength: 2000 },
    { name: 'studyFields', type: 'text', hasMany: true },
    { name: 'degreeLevels', type: 'select', hasMany: true, options: degreeLevelOptions },
    {
      type: 'row',
      fields: [
        {
          name: 'fundingType',
          type: 'select',
          options: [
            { label: 'Full scholarship', value: 'full' },
            { label: 'Partial scholarship', value: 'partial' },
            { label: 'Tuition waiver', value: 'waiver' },
            { label: 'Self-funded', value: 'none' },
          ],
        },
        { name: 'fundingSummary', type: 'text', localized: true, maxLength: 200 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'deadline', type: 'date', index: true },
        {
          name: 'deadlineNote',
          type: 'text',
          localized: true,
          maxLength: 120,
          admin: { description: 'e.g. "Rolling admissions" when there is no single date.' },
        },
      ],
    },
    {
      name: 'requirements',
      type: 'group',
      fields: [
        { name: 'minimumGpa', type: 'number', min: 0, max: 4 },
        {
          name: 'minimumIelts',
          type: 'number',
          min: 0,
          max: 9,
          admin: { description: 'IELTS band or equivalent.' },
        },
        { name: 'notes', type: 'textarea', localized: true, maxLength: 2000 },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'sourceUrl',
      type: 'text',
      required: true,
      admin: { description: 'Official page the listing was summarized from.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'lastVerifiedAt', type: 'date' },
        {
          name: 'origin',
          type: 'select',
          required: true,
          defaultValue: 'manual',
          options: [
            { label: 'AI research', value: 'ai' },
            { label: 'Manual', value: 'manual' },
          ],
        },
        { name: 'sponsored', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
