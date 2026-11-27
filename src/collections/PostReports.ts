import type { CollectionConfig } from 'payload'
import { appUserOnly, serverOwnedField } from '../access/appUser'
import { adminOnly, setFieldFromUser } from '../access/community'

export const PostReports: CollectionConfig = {
  slug: 'post-reports',
  access: { create: appUserOnly, read: adminOnly, update: adminOnly, delete: adminOnly },
  admin: { group: 'Community', defaultColumns: ['post', 'reason', 'createdAt'] },
  hooks: { beforeValidate: [setFieldFromUser('reporter')] },
  indexes: [{ fields: ['reporter', 'post', 'reply'], unique: true }],
  fields: [
    { name: 'post', type: 'relationship', relationTo: 'community-posts', required: true, index: true },
    {
      name: 'reply',
      type: 'relationship',
      relationTo: 'post-replies',
      admin: { description: 'Set when a reply (not the post itself) was reported.' },
    },
    {
      name: 'reporter',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      access: serverOwnedField,
    },
    {
      name: 'reason',
      type: 'select',
      required: true,
      options: [
        { label: 'Spam', value: 'spam' },
        { label: 'Harassment', value: 'harassment' },
        { label: 'Misinformation', value: 'misinformation' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'note', type: 'textarea', maxLength: 500 },
  ],
}
