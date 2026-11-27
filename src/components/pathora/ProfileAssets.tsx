'use client'

import { FileText, Plus, Trash2, Upload, UserRound } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useT } from './app/i18n'

type InfoRow = { id?: string | null; label: string; value: string }
type AppUser = {
  id: string | number
  email?: string
  name?: string | null
  additionalInfo: InfoRow[]
}
type ProfileFile = {
  id: string | number
  title: string
  category: string
  filename?: string | null
  mimeType?: string | null
  createdAt: string
  contentURL: string
}

const categoryKeys = ['passport', 'visa', 'portfolio', 'language-certificate', 'other']

const labelClass = 'grid gap-2 text-[12px] font-bold text-[#51495a]'
const fieldClass =
  'h-12 w-full rounded-xl bg-white px-4 text-[13px] text-[#352b45] outline-none focus:bg-[#fff8f4]'

async function readResponse(response: Response) {
  const data = (await response.json()) as Record<string, unknown>
  if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : '')
  return data
}

export default function ProfileAssets() {
  const { t, formatDate } = useT()
  const [user, setUser] = useState<AppUser | null>(null)
  const [files, setFiles] = useState<ProfileFile[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [documentForm, setDocumentForm] = useState({
    category: 'passport',
    title: '',
    file: null as File | null,
  })
  const [infoRows, setInfoRows] = useState<InfoRow[]>([])

  const profilePhoto = useMemo(
    () => files.find((file) => file.category === 'profile-photo'),
    [files],
  )
  const documents = useMemo(
    () => files.filter((file) => file.category !== 'profile-photo'),
    [files],
  )

  const loadFiles = async () => {
    const data = await readResponse(await fetch('/pathora-api/files', { cache: 'no-store' }))
    setFiles((data.files as ProfileFile[]) ?? [])
  }

  useEffect(() => {
    void (async () => {
      try {
        const data = await readResponse(await fetch('/pathora-api/auth', { cache: 'no-store' }))
        const nextUser = data.user as AppUser
        setUser(nextUser)
        setInfoRows(nextUser.additionalInfo ?? [])
        await loadFiles()
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const uploadFile = async (file: File, category: string, title = file.name) => {
    setBusy(true)
    setMessage('')
    try {
      const body = new FormData()
      body.set('file', file)
      body.set('category', category)
      body.set('title', title)
      const data = await readResponse(
        await fetch('/pathora-api/files', { method: 'POST', body }),
      )
      const uploaded = data.file as ProfileFile
      setFiles((current) => [
        uploaded,
        ...current.filter(
          (item) => category !== 'profile-photo' || item.category !== 'profile-photo',
        ),
      ])
      setDocumentForm({ category: 'passport', title: '', file: null })
      setMessage(
        category === 'profile-photo'
          ? t('profile.assets.photoUpdated')
          : t('profile.assets.docUploaded'),
      )
    } catch (error) {
      setMessage(
        error instanceof Error && error.message ? error.message : t('profile.assets.uploadFailed'),
      )
    } finally {
      setBusy(false)
    }
  }

  const removeFile = async (id: string | number) => {
    setBusy(true)
    setMessage('')
    try {
      await readResponse(await fetch(`/pathora-api/files/${id}`, { method: 'DELETE' }))
      setFiles((current) => current.filter((file) => String(file.id) !== String(id)))
      setMessage(t('profile.assets.removed'))
    } catch (error) {
      setMessage(
        error instanceof Error && error.message ? error.message : t('profile.assets.removeFailed'),
      )
    } finally {
      setBusy(false)
    }
  }

  const saveInfo = async () => {
    setBusy(true)
    setMessage('')
    try {
      const data = await readResponse(
        await fetch('/pathora-api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ additionalInfo: infoRows }),
        }),
      )
      setInfoRows((data.additionalInfo as InfoRow[]) ?? [])
      setMessage(t('profile.assets.infoSaved'))
    } catch (error) {
      setMessage(
        error instanceof Error && error.message ? error.message : t('profile.assets.saveFailed'),
      )
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <section className="panel profile-assets-panel">
        <p>{t('profile.assets.loading')}</p>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="panel profile-assets-panel">
        <p>{t('profile.assets.loadFailed')}</p>
      </section>
    )
  }

  return (
    <div className="grid gap-5">
      <section className="panel profile-assets-panel">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[24px] bg-[#fae5ed] text-[#9d3f68]">
              {profilePhoto?.mimeType?.startsWith('image/') ? (
                <Image
                  alt={t('profile.assets.photoAlt')}
                  className="h-full w-full object-cover"
                  height={96}
                  src={profilePhoto.contentURL}
                  width={96}
                />
              ) : (
                <UserRound size={34} />
              )}
            </div>
            <div>
              <h2 className="text-[22px] font-extrabold text-[#352b45]">{t('profile.assets.photoTitle')}</h2>
              <p className="mt-2 text-[12px] text-[#756d7e]">
                {t('profile.assets.photoHint')}
              </p>
              <label className="btn btn-outline mt-4 inline-flex cursor-pointer">
                <Upload size={16} />
                {profilePhoto ? t('profile.assets.replacePhoto') : t('profile.assets.addPhoto')}
                <input
                  className="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  disabled={busy}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadFile(file, 'profile-photo', t('profile.assets.photoName'))
                    event.currentTarget.value = ''
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="panel profile-assets-panel">
        <div className="mb-6">
          <h2 className="text-[22px] font-extrabold text-[#352b45]">{t('profile.assets.documents')}</h2>
          <p className="mt-2 text-[12px] text-[#756d7e]">
            {t('profile.assets.documentsHint')}
          </p>
        </div>
        <div className="grid gap-4 rounded-2xl bg-[#f8f6f9] p-5 md:grid-cols-[1fr_1fr_auto]">
          <label className={labelClass}>
            {t('profile.assets.docType')}
            <select
              className={fieldClass}
              value={documentForm.category}
              onChange={(event) =>
                setDocumentForm((current) => ({ ...current, category: event.target.value }))
              }
            >
              {categoryKeys.map((value) => (
                <option key={value} value={value}>
                  {t(`profile.assets.category.${value}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            {t('profile.assets.displayName')}
            <input
              className={fieldClass}
              placeholder={t('profile.assets.displayNamePh')}
              value={documentForm.title}
              onChange={(event) =>
                setDocumentForm((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>
          <label className={`${labelClass} self-end`}>
            <span className="sr-only">{t('profile.assets.chooseFile')}</span>
            <span className="btn btn-primary flex min-h-12 cursor-pointer items-center">
              <Upload size={16} /> {t('profile.assets.chooseFile')}
            </span>
            <input
              className="sr-only"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp,image/heic"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                setDocumentForm((current) => ({
                  ...current,
                  file,
                  title: current.title || file?.name || '',
                }))
              }}
            />
          </label>
        </div>
        {documentForm.file && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#fff0eb] px-4 py-3">
            <span className="text-[12px] font-bold text-[#51495a]">{documentForm.file.name}</span>
            <button
              className="btn btn-primary"
              disabled={busy}
              type="button"
              onClick={() =>
                void uploadFile(
                  documentForm.file as File,
                  documentForm.category,
                  documentForm.title,
                )
              }
            >
              {busy ? t('profile.assets.uploading') : t('profile.assets.upload')}
            </button>
          </div>
        )}
        <div className="mt-6 grid gap-3">
          {documents.length ? (
            documents.map((file) => (
              <article
                className="flex flex-wrap items-center gap-4 rounded-2xl bg-[#f8f6f9] px-5 py-4"
                key={String(file.id)}
              >
                <FileText className="text-[#9d3f68]" size={21} />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-[13px] text-[#352b45]">
                    {file.title}
                  </strong>
                  <small className="mt-1 block text-[10px] text-[#837b8a]">
                    {categoryKeys.includes(file.category)
                      ? t(`profile.assets.category.${file.category}`)
                      : t('profile.assets.docFallback')}{' '}
                    · {formatDate(file.createdAt)}
                  </small>
                </div>
                <a
                  className="text-[11px] font-extrabold text-[#9d3f68]"
                  href={file.contentURL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('profile.assets.view')}
                </a>
                <button
                  aria-label={t('profile.assets.removeAria', { title: file.title })}
                  className="grid h-9 w-9 place-items-center rounded-lg text-[#d9554a] hover:bg-[#ffe9e7]"
                  disabled={busy}
                  type="button"
                  onClick={() => void removeFile(file.id)}
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))
          ) : (
            <p className="rounded-2xl bg-[#f8f6f9] px-5 py-6 text-center text-[12px] text-[#837b8a]">
              {t('profile.assets.noDocs')}
            </p>
          )}
        </div>
      </section>

      <section className="panel profile-assets-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-extrabold text-[#352b45]">{t('profile.assets.additional')}</h2>
            <p className="mt-2 text-[12px] text-[#756d7e]">
              {t('profile.assets.additionalHint')}
            </p>
          </div>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => setInfoRows((rows) => [...rows, { label: '', value: '' }])}
          >
            <Plus size={16} /> {t('profile.assets.addInfo')}
          </button>
        </div>
        <div className="mt-6 grid gap-4">
          {infoRows.map((row, index) => (
            <div className="grid gap-3 rounded-2xl bg-[#f8f6f9] p-4 md:grid-cols-[1fr_2fr_auto]" key={row.id ?? index}>
              <label className={labelClass}>
                {t('profile.assets.label')}
                <input
                  className={fieldClass}
                  placeholder={t('profile.assets.labelPh')}
                  value={row.label}
                  onChange={(event) =>
                    setInfoRows((rows) =>
                      rows.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, label: event.target.value } : item,
                      ),
                    )
                  }
                />
              </label>
              <label className={labelClass}>
                {t('profile.assets.information')}
                <input
                  className={fieldClass}
                  placeholder={t('profile.assets.informationPh')}
                  value={row.value}
                  onChange={(event) =>
                    setInfoRows((rows) =>
                      rows.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, value: event.target.value } : item,
                      ),
                    )
                  }
                />
              </label>
              <button
                aria-label={t('profile.assets.removeInfo')}
                className="mt-6 grid h-11 w-11 place-items-center rounded-xl text-[#d9554a] hover:bg-[#ffe9e7]"
                type="button"
                onClick={() => setInfoRows((rows) => rows.filter((_, itemIndex) => itemIndex !== index))}
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
          {!infoRows.length && (
            <p className="rounded-2xl bg-[#f8f6f9] px-5 py-6 text-center text-[12px] text-[#837b8a]">
              {t('profile.assets.infoEmpty')}
            </p>
          )}
        </div>
        <button
          className="btn btn-primary mt-5"
          disabled={busy || infoRows.some((row) => !row.label.trim() || !row.value.trim())}
          type="button"
          onClick={() => void saveInfo()}
        >
          {t('profile.assets.saveInfo')}
        </button>
      </section>
      {message && <p className="text-[12px] font-bold text-[#9d3f68]">{message}</p>}
    </div>
  )
}
