import type { CollectionConfig } from 'payload'
import { appUserOnly, isPayloadAdmin, serverOwnedField } from '../access/appUser'
import { adminWritableField, ownField, setFieldFromUser, visibleOrOwn } from '../access/community'
import { moderationStatuses } from './CommunityPosts'

export const PostReplies: CollectionConfig = {
  slug: 'post-replies',
  access: {
    create: appUserOnly,
    read: visibleOrOwn('author'),
    update: ({ req }) => isPayloadAdmin(req.user),
    delete: ownField('author'),
  },
  admin: { group: 'Community', useAsTitle: 'body' },
  hooks: { beforeValidate: [setFieldFromUser('author')] },
  indexes: [{ fields: ['post', 'createdAt'] }],
  fields: [
    { name: 'post', type: 'relationship', relationTo: 'community-posts', required: true, index: true },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: serverOwnedField,
    },
    { name: 'body', type: 'textarea', required: true, minLength: 1, maxLength: 1000 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'visible',
      options: moderationStatuses,
      access: adminWritableField,
    },
    { name: 'moderationReason', type: 'text', maxLength: 300, access: adminWritableField },
  ],
}
