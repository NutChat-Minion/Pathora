import path from 'path'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { sharpTransformer } from '@payloadcms/transformer-sharp'
import { en as adminLanguage } from '@payloadcms/translations/languages/en'
import { fileURLToPath } from 'url'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { ProfileFiles } from './collections/ProfileFiles'
import { Users } from './collections/Users'
import { Opportunities } from './collections/Opportunities'
import { SavedOpportunities } from './collections/SavedOpportunities'
import { ApplicationPlans } from './collections/ApplicationPlans'
import { ResearchTopics } from './collections/ResearchTopics'
import { ResearchRuns } from './collections/ResearchRuns'
import { CommunityPosts } from './collections/CommunityPosts'
import { PostReplies } from './collections/PostReplies'
import { PostLikes } from './collections/PostLikes'
import { PostReports } from './collections/PostReports'
import { BuddyConnections } from './collections/BuddyConnections'
import { Trips } from './collections/Trips'
import { TripInterests } from './collections/TripInterests'
import { ChecklistProgress } from './collections/ChecklistProgress'
import { HousingShortlist } from './collections/HousingShortlist'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  // Schema changes ship as migration files (src/migrations), applied by `payload migrate`
  // before every build. Dev push is off so local and production use the same path.
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  editor: lexicalEditor(),
  upload: { transformers: [sharpTransformer()] },
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  admin: {
    user: Admins.slug,
    constrainWidth: true,
    dashboard: {
      widgets: [],
      defaultLayout: [
        { widgetSlug: 'activity', width: 'full' },
        { widgetSlug: 'collections', width: 'full' },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { 'en': adminLanguage },
  },
  collections: [
    Admins,
    Users,
    Opportunities,
    SavedOpportunities,
    ApplicationPlans,
    ProfileFiles,
    Media,
    Folders,
    Tags,
    ResearchTopics,
    ResearchRuns,
    CommunityPosts,
    PostReplies,
    PostLikes,
    PostReports,
    BuddyConnections,
    Trips,
    TripInterests,
    ChecklistProgress,
    HousingShortlist,
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'th', label: 'ไทย' },
    ],
    fallback: true,
    defaultLocale: 'en',
  },
  storage: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true, 'profile-files': { prefix: 'private' } },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
