import type { CollectionConfig } from 'payload'
import { isPayloadAdmin } from '../access/appUser'

const adminOnly = ({ req }: { req: { user?: unknown } }) => isPayloadAdmin(req.user)

/** Search topics the scheduled AI research job iterates over to fill `opportunities`. */
export const ResearchTopics: CollectionConfig = {
  slug: 'research-topics',
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  admin: {
    useAsTitle: 'query',
    defaultColumns: ['query', 'country', 'type', 'active', 'priority', 'lastRunAt'],
    group: 'Listings',
  },
  fields: [
    { name: 'query', type: 'textarea', required: true, maxLength: 500 },
    { name: 'country', type: 'text', maxLength: 80 },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'scholarship',
      options: [
        { label: 'Scholarship', value: 'scholarship' },
        { label: 'University', value: 'university' },
        { label: 'Program', value: 'program' },
      ],
    },
    { name: 'active', type: 'checkbox', defaultValue: true, index: true },
    { name: 'priority', type: 'number', defaultValue: 0, admin: { description: 'Higher runs first among equally stale topics.' } },
    { name: 'lastRunAt', type: 'date', index: true, admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
  ],
}
