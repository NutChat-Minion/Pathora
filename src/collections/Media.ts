import type { CollectionConfig } from 'payload'

import { createFolderField, createTagField } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    // Attribution for third-party (e.g. Wikipedia/Wikimedia Commons) images; sourceUrl also dedupes imports.
    { name: 'credit', type: 'text', maxLength: 300 },
    { name: 'sourceUrl', type: 'text', maxLength: 1000, index: true },
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  upload: true,
}
