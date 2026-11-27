import type { Access, CollectionConfig } from 'payload'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const Admins: CollectionConfig = {
  slug: 'admins',
  access: {
    // Only existing admins can add admins. The first admin is created through
    // /admin/create-first-user, which Payload allows when the collection is empty.
    create: isPayloadAdmin,
    delete: isPayloadAdmin,
    read: isPayloadAdmin,
    update: isPayloadAdmin,
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [],
  versions: false,
}
