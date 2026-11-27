import type { CollectionConfig } from 'payload'
import { appUserOnly, isPayloadAdmin, serverOwnedField } from '../access/appUser'
import { adminWritableField, ownField, setFieldFromUser, visibleOrOwn } from '../access/community'

export const communityTopics = [
  { label: 'General', value: 'general' },
  { label: 'Applications', value: 'applications' },
  { label: 'Housing', value: 'housing' },
  { label: 'Arrival', value: 'arrival' },
  { label: 'Visa', value: 'visa' },
  { label: 'Money', value: 'money' },
]

export const moderationStatuses = [
  { label: 'Visible', value: 'visible' },
  { label: 'Flagged (held for review)', value: 'flagged' },
  { label: 'Hidden', value: 'hidden' },
]

export const CommunityPosts: CollectionConfig = {
  slug: 'community-posts',
  access: {
    create: appUserOnly,
    read: visibleOrOwn('author'),
    update: ({ req }) => isPayloadAdmin(req.user),
    delete: ownField('author'),
  },
  admin: { group: 'Community', useAsTitle: 'body', defaultColumns: ['body', 'status', 'createdAt'] },
  hooks: { beforeValidate: [setFieldFromUser('author')] },
  fields: [
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: serverOwnedField,
    },
    { name: 'body', type: 'textarea', required: true, minLength: 1, maxLength: 2000 },
    { name: 'topic', type: 'select', required: true, defaultValue: 'general', options: communityTopics },
    { name: 'destination', type: 'text', maxLength: 80 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'visible',
      index: true,
      options: moderationStatuses,
      access: adminWritableField,
    },
    { name: 'moderationReason', type: 'text', maxLength: 300, access: adminWritableField },
    { name: 'likeCount', type: 'number', defaultValue: 0, min: 0, access: adminWritableField },
    { name: 'replyCount', type: 'number', defaultValue: 0, min: 0, access: adminWritableField },
  ],
}

