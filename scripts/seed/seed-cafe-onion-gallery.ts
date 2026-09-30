import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database.types'
import { loadImportEnvironment } from '../lib/load-import-env'

const placeSlug = 'cafe-onion-seongsu'
const mediaDirectory = resolve('data/media/cafe-onion-seongsu')
const dryRun = process.argv.includes('--dry-run')

const sampleMedia = [
  {
    filename: 'cafe-onion-interior-sample.webp',
    storageName: 'cover.webp',
    role: 'cover',
    sortOrder: 0,
    altText: 'Sample cafe interior for Place gallery UI testing',
    sourceProvider: 'Locorea',
    sourceUrl: null,
    licenseCode: 'CUSTOM',
    attributionText: null,
    attributionRequired: false,
  },
  {
    // Local UI test metadata only; this does not claim the sample image has this real-world provenance.
    filename: 'cafe-onion-exterior-sample.webp',
    storageName: 'gallery-01.webp',
    role: 'gallery',
    sortOrder: 1,
    altText: 'Sample cafe exterior for Place gallery UI testing',
    sourceProvider: 'Seoul Tourism Organization',
    sourceUrl: null,
    licenseCode: 'KOGL-1',
    attributionText: '서울관광재단 · 공공누리 제1유형',
    attributionRequired: true,
  },
  {
    filename: 'cafe-onion-bakery-menu-sample.webp',
    storageName: 'gallery-02.webp',
    role: 'gallery',
    sortOrder: 2,
    altText: 'Sample bakery display for Place gallery UI testing',
    sourceProvider: 'Locorea',
    sourceUrl: null,
    licenseCode: 'CUSTOM',
    attributionText: null,
    attributionRequired: false,
  },
  {
    filename: 'cafe-onion-rooftop-sample.webp',
    storageName: 'gallery-03.webp',
    role: 'gallery',
    sortOrder: 3,
    altText: 'Sample cafe terrace for Place gallery UI testing',
    sourceProvider: 'Locorea',
    sourceUrl: null,
    licenseCode: 'CUSTOM',
    attributionText: null,
    attributionRequired: false,
  },
] as const

const getWebpDimensions = (file: Buffer) => {
  const hasVp8Header = file.length >= 30
    && file.subarray(0, 4).toString('ascii') === 'RIFF'
    && file.subarray(8, 12).toString('ascii') === 'WEBP'
    && file.subarray(12, 16).toString('ascii') === 'VP8 '
    && file[23] === 0x9d
    && file[24] === 0x01
    && file[25] === 0x2a

  if (!hasVp8Header) throw new Error('Expected a VP8 WebP image with readable dimensions.')

  return {
    width: file.readUInt16LE(26) & 0x3fff,
    height: file.readUInt16LE(28) & 0x3fff,
  }
}

const main = async () => {
  const { url, serviceRoleKey } = loadImportEnvironment()
  const hostname = new URL(url).hostname

  if (!['127.0.0.1', 'localhost'].includes(hostname)) {
    throw new Error('This local Café Onion gallery seed only runs against localhost Supabase.')
  }

  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const { data: place, error: placeError } = await supabase
    .from('places')
    .select('id')
    .eq('slug', placeSlug)
    .maybeSingle()

  if (placeError || !place) throw placeError ?? new Error(`Place not found: ${placeSlug}`)

  const { data: existingRelations, error: relationsError } = await supabase
    .from('entity_media')
    .select('id, media_id, role, sort_order, media_assets(storage_path)')
    .eq('entity_type', 'place')
    .eq('entity_id', place.id)
    .in('role', ['cover', 'gallery'])

  if (relationsError) throw relationsError

  const relations = existingRelations ?? []
  const relationFor = (storagePath: string, role: string, sortOrder: number) =>
    relations.find(relation => relation.media_assets?.storage_path === storagePath)
    ?? relations.find(relation => relation.role === role && relation.sort_order === sortOrder)

  const replacedMedia = new Map<string, string>()

  for (const sample of sampleMedia) {
    const storagePath = `places/${place.id}/${sample.storageName}`
    const relation = relationFor(storagePath, sample.role, sample.sortOrder)
    const file = await readFile(resolve(mediaDirectory, sample.filename))
    const dimensions = getWebpDimensions(file)

    if (dryRun) {
      console.log(`VALID: ${sample.filename} → ${storagePath} (${sample.role}, ${sample.sortOrder})`)
      continue
    }

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, file, { contentType: 'image/webp', upsert: true })

    if (uploadError) throw uploadError

    const { data: asset, error: assetError } = await supabase
      .from('media_assets')
      .upsert({
        bucket: 'media',
        storage_path: storagePath,
        media_type: 'image',
        mime_type: 'image/webp',
        width: dimensions.width,
        height: dimensions.height,
        alt_text: sample.altText,
        source_provider: sample.sourceProvider,
        source_url: sample.sourceUrl,
        license_code: sample.licenseCode,
        attribution_text: sample.attributionText,
        attribution_required: sample.attributionRequired,
      }, { onConflict: 'storage_path' })
      .select('id')
      .single()

    if (assetError || !asset) throw assetError ?? new Error(`Could not register ${sample.filename}`)

    if (relation) {
      if (relation.media_id !== asset.id && relation.media_assets?.storage_path) {
        replacedMedia.set(relation.media_id, relation.media_assets.storage_path)
      }

      const { error } = await supabase
        .from('entity_media')
        .update({ media_id: asset.id, role: sample.role, sort_order: sample.sortOrder })
        .eq('id', relation.id)

      if (error) throw error
    }
    else {
      const { error } = await supabase
        .from('entity_media')
        .insert({
          media_id: asset.id,
          entity_type: 'place',
          entity_id: place.id,
          role: sample.role,
          sort_order: sample.sortOrder,
        })

      if (error) throw error
    }
  }

  for (const [mediaId, storagePath] of replacedMedia) {
    const { data: remainingRelations, error: remainingRelationsError } = await supabase
      .from('entity_media')
      .select('id')
      .eq('media_id', mediaId)

    if (remainingRelationsError) throw remainingRelationsError
    if (remainingRelations?.length) continue

    const { error: removeStorageError } = await supabase.storage.from('media').remove([storagePath])
    if (removeStorageError) throw removeStorageError

    const { error: removeAssetError } = await supabase.from('media_assets').delete().eq('id', mediaId)
    if (removeAssetError) throw removeAssetError
  }

  console.log(dryRun
    ? `Validated ${sampleMedia.length} local-only gallery images for ${placeSlug}.`
    : `Seeded ${sampleMedia.length} local-only gallery images for ${placeSlug}.`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
