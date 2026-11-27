import { randomUUID } from 'crypto'
import path from 'path'
import type {
  Access,
  CollectionBeforeOperationHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload'
import { isAppUser } from '../access/appUser'

const ownFiles: Access = ({ req }) => {
  if (!isAppUser(req.user)) return false
  return { owner: { equals: req.user.id } }
}

const setOwner: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (operation === 'create' && isAppUser(req.user)) {
    return { ...data, owner: req.user.id }
  }
  return data
}

/**
 * Private documents (passports, visas) are stored in public-access Blob storage, so the stored
 * filename must be unguessable: replace it with a random UUID before Payload saves the file.
 */
const randomizeFilename: CollectionBeforeOperationHook = ({ operation, req }) => {
  if ((operation === 'create' || operation === 'update') && req.file) {
    const ext = path.extname(req.file.name || '').toLowerCase().replace(/[^.a-z0-9]/g, '')
    req.file.name = `${randomUUID()}${ext}`
  }
}

export const ProfileFiles: CollectionConfig = {
  slug: 'profile-files',
  access: {
    create: ({ req }) => isAppUser(req.user),
    delete: ownFiles,
    read: ownFiles,
    update: ownFiles,
  },
  admin: {
    hidden: true,
    useAsTitle: 'title',
  },
  hooks: {
    beforeOperation: [randomizeFilename],
    beforeValidate: [setOwner],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 160,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Profile photo', value: 'profile-photo' },
        { label: 'Passport', value: 'passport' },
        { label: 'Visa', value: 'visa' },
        { label: 'Portfolio', value: 'portfolio' },
        { label: 'Language certificate', value: 'language-certificate' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: {
        create: () => false,
        update: () => false,
      },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'private, no-store')
      return headers
    },
  },
}
