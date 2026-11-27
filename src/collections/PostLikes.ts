import type { CollectionConfig } from 'payload'
import { appUserOnly, ownerOrAdmin, serverOwnedField, setOwnerFromUser } from '../access/appUser'

export const PostLikes: CollectionConfig = {
  slug: 'post-likes',
  access: { create: appUserOnly, read: ownerOrAdmin, update: () => false, delete: ownerOrAdmin },
  admin: { hidden: true },
  hooks: { beforeValidate: [setOwnerFromUser] },
  indexes: [{ fields: ['owner', 'post'], unique: true }],
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: serverOwnedField,
    },
    { name: 'post', type: 'relationship', relationTo: 'community-posts', required: true, index: true },
  ],
}
