import config from '@payload-config'
import { appAuth } from '@/lib/app-auth'
import { getPayload } from 'payload'

const categoryValues = [
  'profile-photo',
  'passport',
  'visa',
  'portfolio',
  'language-certificate',
  'other',
] as const
type FileCategory = (typeof categoryValues)[number]
const categories = new Set<string>(categoryValues)
const isFileCategory = (value: unknown): value is FileCategory =>
  typeof value === 'string' && categories.has(value)

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
])

export async function GET() {
  const session = await appAuth.current()
  if (!session) return Response.json({ error: 'Sign in required.' }, { status: 401 })

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'profile-files',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    sort: '-createdAt',
    user: session.user,
  })

  return Response.json({
    files: result.docs.map((file) => ({
      id: file.id,
      title: file.title,
      category: file.category,
      filename: file.filename,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
      contentURL: `/pathora-api/files/${file.id}/content`,
    })),
  })
}

export async function POST(request: Request) {
  const session = await appAuth.current()
  if (!session) return Response.json({ error: 'Sign in required.' }, { status: 401 })

  const formData = await request.formData()
  const upload = formData.get('file')
  const category = formData.get('category')
  const rawTitle = formData.get('title')

  if (!(upload instanceof File) || !isFileCategory(category)) {
    return Response.json({ error: 'Choose a supported file and document type.' }, { status: 400 })
  }
  if (!allowedMimeTypes.has(upload.type) || upload.size > 10 * 1024 * 1024) {
    return Response.json(
      { error: 'Use a PDF, JPG, PNG, WEBP, or HEIC file up to 10 MB.' },
      { status: 400 },
    )
  }

  const title =
    typeof rawTitle === 'string' && rawTitle.trim()
      ? rawTitle.trim().slice(0, 160)
      : upload.name.slice(0, 160)
  const payload = await getPayload({ config })
  const bytes = Buffer.from(await upload.arrayBuffer())
  let file
  try {
    file = await payload.create({
    collection: 'profile-files',
    data: { category, owner: session.user.id, title },
    file: {
      data: bytes,
      mimetype: upload.type,
      name: upload.name,
      size: upload.size,
    },
    overrideAccess: false,
    user: session.user,
    })
  } catch (error) {
    // Payload rejects corrupt or mislabeled files (e.g. "Invalid PDF file") with a ValidationError.
    const name = error instanceof Error ? error.name : ''
    if (name === 'ValidationError') {
      return Response.json(
        { error: 'That file could not be read. Upload a valid PDF, JPG, PNG, WEBP or HEIC file.' },
        { status: 400 },
      )
    }
    console.error('[pathora-api] file upload failed', error)
    return Response.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }

  return Response.json(
    {
      file: {
        id: file.id,
        title: file.title,
        category: file.category,
        filename: file.filename,
        mimeType: file.mimeType,
        createdAt: file.createdAt,
        contentURL: `/pathora-api/files/${file.id}/content`,
      },
    },
    { status: 201 },
  )
}
