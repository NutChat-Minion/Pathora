import type { CollectionConfig } from 'payload'
import { isPayloadAdmin } from '../access/appUser'

/** Log of research job executions. Written by the trusted server job only. */
export const ResearchRuns: CollectionConfig = {
  slug: 'research-runs',
  access: {
    read: ({ req }) => isPayloadAdmin(req.user),
    create: () => false,
    update: () => false,
    delete: ({ req }) => isPayloadAdmin(req.user),
  },
  admin: {
    useAsTitle: 'status',
    defaultColumns: ['topic', 'startedAt', 'status', 'createdCount', 'updatedCount', 'expiredCount'],
    group: 'Listings',
  },
  fields: [
    { name: 'topic', type: 'relationship', relationTo: 'research-topics', admin: { readOnly: true } },
    { name: 'startedAt', type: 'date', required: true, index: true, admin: { readOnly: true } },
    { name: 'finishedAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Partial', value: 'partial' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: { readOnly: true },
    },
    {
      type: 'row',
      fields: [
        { name: 'createdCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
        { name: 'updatedCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
        { name: 'expiredCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
      ],
    },
    { name: 'error', type: 'textarea', maxLength: 2000, admin: { readOnly: true } },
    { name: 'model', type: 'text', admin: { readOnly: true } },
  ],
}
