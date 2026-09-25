import { readFile, readdir } from 'node:fs/promises'
import { basename, extname, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database.types'
import { loadImportEnvironment } from '../lib/load-import-env'

const mediaDirectory = resolve('data/media/places')
const metadataPath = resolve('data/imports/place-media-seongsu.csv')
const dryRun = process.argv.includes('--dry-run')
const replace = process.argv.includes('--replace')
const formats: Record<string, string> = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' }

type Metadata = { altText: string | null; creditText: string | null }
type Cover = { relationId: string; mediaId: string; storagePath: string }

const parseCsv = (contents: string) => {
  const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false
  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index]; const next = contents[index + 1]
    if (character === '"' && quoted && next === '"') { field += '"'; index += 1 }
    else if (character === '"') quoted = !quoted
    else if (character === ',' && !quoted) { row.push(field); field = '' }
    else if ((character === '\n' || character === '\r') && !quoted) { if (character === '\r' && next === '\n') index += 1; row.push(field); if (row.some(value => value.trim())) rows.push(row); row = []; field = '' }
    else field += character
  }
  if (field || row.length) { row.push(field); if (row.some(value => value.trim())) rows.push(row) }
  return rows
}

const nullable = (value?: string) => value?.trim() || null
const report = (state: 'VALID' | 'INVALID' | 'SKIPPED' | 'IMPORTED', filename: string, slug: string, reason: string) => console.log(`${state}: ${filename} · ${slug || '(missing slug)'} · ${reason}`)
const logError = (label: string, error: unknown) => console.error(`${label}:`, error)

const readMetadata = async () => {
  const rows = parseCsv(await readFile(metadataPath, 'utf8'))
  const headers = rows.shift()?.map(header => header.trim()) ?? []
  if (!['slug', 'alt_text', 'credit_text'].every(header => headers.includes(header))) throw new Error('Metadata CSV must contain slug, alt_text, credit_text.')
  return new Map(rows.map(values => {
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
    return [record.slug.trim(), { altText: nullable(record.alt_text), creditText: nullable(record.credit_text) }]
  }))
}

const getImageFiles = async () => {
  try {
    const entries = await readdir(mediaDirectory, { withFileTypes: true })
    return entries.filter(entry => entry.isFile()).map(entry => entry.name)
  }
  catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return []
    throw error
  }
}

const main = async () => {
  const { url, serviceRoleKey } = loadImportEnvironment()

  const files = await getImageFiles()
  const metadata = await readMetadata()
  const supabase = createClient<Database>(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const supportedFiles = files.filter(file => formats[extname(file).toLowerCase()])
  const slugs = supportedFiles.map(file => basename(file, extname(file)))
  const { data: places, error: placesError } = slugs.length
    ? await supabase.from('places').select('id, slug, place_translations(language_code, name)').in('slug', slugs)
    : { data: [], error: null }
  if (placesError) { logError('Place lookup error', placesError); throw new Error('Could not load Places for media import.') }
  const placeBySlug = new Map((places ?? []).map(place => [place.slug, place]))
  const placeIds = (places ?? []).map(place => place.id)
  const { data: relations, error: relationsError } = placeIds.length
    ? await supabase.from('entity_media').select('id, entity_id, media_id, media_assets(storage_path)').eq('entity_type', 'place').eq('role', 'cover').in('entity_id', placeIds)
    : { data: [], error: null }
  if (relationsError) { logError('Cover lookup error', relationsError); throw new Error('Could not load existing Place covers.') }
  const coverByPlaceId = new Map((relations ?? []).filter(relation => relation.media_assets).map(relation => [relation.entity_id, { relationId: relation.id, mediaId: relation.media_id, storagePath: relation.media_assets!.storage_path } satisfies Cover]))
  let valid = 0; let invalid = 0; let skipped = 0; let imported = 0

  for (const filename of files) {
    const extension = extname(filename).toLowerCase(); const mimeType = formats[extension]; const slug = basename(filename, extname(filename))
    if (!mimeType) { invalid += 1; report('INVALID', filename, slug, 'unsupported image type'); continue }
    if (!slug) { invalid += 1; report('INVALID', filename, slug, 'missing Place slug'); continue }
    const place = placeBySlug.get(slug)
    if (!place) { invalid += 1; report('INVALID', filename, slug, 'Place not found'); continue }
    const existing = coverByPlaceId.get(place.id) ?? null
    if (existing && !replace) { skipped += 1; report('SKIPPED', filename, slug, 'cover already exists'); continue }
    valid += 1
    if (dryRun) { report('VALID', filename, slug, existing ? 'would replace cover' : 'would import cover'); continue }

    const translation = place.place_translations.find(item => item.language_code === 'en') ?? place.place_translations[0]
    const rowMetadata = metadata.get(slug)
    const storagePath = `places/${place.id}/cover${extension}`
    try {
      const file = await readFile(resolve(mediaDirectory, filename))
      const { error: uploadError } = await supabase.storage.from('media').upload(storagePath, file, { contentType: mimeType, upsert: true })
      if (uploadError) throw uploadError
      const assetPayload = { bucket: 'media', storage_path: storagePath, media_type: 'image', mime_type: mimeType, alt_text: rowMetadata?.altText ?? translation?.name ?? slug, credit_text: rowMetadata?.creditText ?? null }
      let mediaId: string
      if (existing?.storagePath === storagePath) {
        const { error } = await supabase.from('media_assets').update(assetPayload).eq('id', existing.mediaId)
        if (error) throw error
        mediaId = existing.mediaId
      }
      else {
        const { data: asset, error } = await supabase.from('media_assets').insert(assetPayload).select('id').single()
        if (error || !asset) throw error ?? new Error('Media asset insert failed.')
        mediaId = asset.id
        const { error: relationError } = existing
          ? await supabase.from('entity_media').update({ media_id: mediaId, sort_order: 0 }).eq('id', existing.relationId)
          : await supabase.from('entity_media').insert({ media_id: mediaId, entity_type: 'place', entity_id: place.id, role: 'cover', sort_order: 0 })
        if (relationError) { await supabase.storage.from('media').remove([storagePath]); await supabase.from('media_assets').delete().eq('id', mediaId); throw relationError }
      }
      if (existing && existing.storagePath !== storagePath) {
        const { error } = await supabase.storage.from('media').remove([existing.storagePath])
        if (!error) await supabase.from('media_assets').delete().eq('id', existing.mediaId)
      }
      imported += 1; report('IMPORTED', filename, slug, existing ? 'cover replaced' : 'cover imported')
    }
    catch (error: unknown) { invalid += 1; logError(`Media import error for ${filename}`, error); report('INVALID', filename, slug, 'upload or media record failed') }
  }
  console.log(`\nTotals\nValid: ${valid}\nInvalid: ${invalid}\nSkipped: ${skipped}\nImported: ${imported}`)
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1 })
