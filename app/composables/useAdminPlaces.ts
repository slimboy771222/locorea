import type { Json } from '~/types/database.types'

export type AdminPlaceFormValues = {
  slug: string
  placeType: string
  areaId: string
  sourceId: string
  sourceUrl: string
  status: 'draft' | 'published' | 'archived'
  phone: string
  websiteUrl: string
  naverMapUrl: string
  kakaoMapUrl: string
  openingHours: string
  foreignerFriendly: '' | 'true' | 'false'
  lastVerifiedAt: string
  name: string
  summary: string
  description: string
  addressText: string
  localTip: string
  coverAltText: string
  coverCreditText: string
}

export type CreateAdminPlaceResult = {
  id: string
  coverUploadFailed: boolean
}

type ExistingCover = {
  entityMediaId: string
  mediaId: string
  storage_path: string
}

const toNullable = (value: string) => value.trim() || null

const getImageExtension = (file: File) => {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }

  return extensions[file.type] ?? null
}

const getErrorProperty = (failure: unknown, property: string) => {
  if (typeof failure !== 'object' || failure === null || !(property in failure)) {
    return null
  }

  const value = failure[property as keyof typeof failure]
  return typeof value === 'string' || typeof value === 'number' ? value : null
}

const logAdminPlaceError = (failure: unknown) => {
  if (import.meta.dev) {
    console.error('Admin place save failed.', failure)
  }
}

export const getAdminPlaceSaveError = (failure: unknown, slug: string) => {
  logAdminPlaceError(failure)

  const message = failure instanceof Error ? failure.message : ''
  const code = getErrorProperty(failure, 'code')
  const status = getErrorProperty(failure, 'status')

  if (code === '23505' || status === 409 || message.includes('duplicate key')) {
    return `The slug '${slug}' is already being used by another place. Please choose a different slug.`
  }

  const safeMessages = [
    'Opening hours must be valid JSON.',
    'Cover images must be JPEG, PNG, or WebP files.',
    'The cover image could not be uploaded.',
    'The cover image metadata could not be updated.',
    'The cover image metadata could not be saved.',
    'The cover image could not be linked to this place.',
  ]

  return safeMessages.includes(message)
    ? message
    : 'The place could not be saved. Please try again.'
}

export const useAdminPlaces = () => {
  const supabase = useSupabase()

  const getAdminPlaces = async () => {
    const { data, error } = await supabase
      .from('places')
      .select(`
        id,
        slug,
        place_type,
        status,
        last_verified_at,
        updated_at,
        place_translations (
          language_code,
          name
        ),
        areas (
          area_translations (
            language_code,
            name
          )
        )
      `)
      .order('updated_at', { ascending: false })

    if (error) {
      throw error
    }

    return data
  }

  const getAdminDashboard = async () => {
    const [statusResult, recentResult] = await Promise.all([
      supabase
        .from('places')
        .select('id, status'),
      supabase
        .from('places')
        .select(`
          id,
          slug,
          place_type,
          status,
          updated_at,
          place_translations (
            language_code,
            name
          )
        `)
        .order('updated_at', { ascending: false })
        .limit(5),
    ])

    if (statusResult.error) {
      throw statusResult.error
    }

    if (recentResult.error) {
      throw recentResult.error
    }

    const placesByStatus = (statusResult.data ?? []).reduce(
      (counts, place) => {
        counts.total += 1

        if (place.status === 'published') {
          counts.published += 1
        }
        else if (place.status === 'draft') {
          counts.draft += 1
        }
        else if (place.status === 'archived') {
          counts.archived += 1
        }

        return counts
      },
      { total: 0, published: 0, draft: 0, archived: 0 },
    )

    return {
      placesByStatus,
      recentPlaces: recentResult.data ?? [],
    }
  }

  const getAdminPlaceOptions = async () => {
    const [areasResult, sourcesResult] = await Promise.all([
      supabase
        .from('areas')
        .select(`
          id,
          slug,
          area_translations (
            language_code,
            name
          )
        `)
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('sources')
        .select('id, name')
        .order('name'),
    ])

    if (areasResult.error) {
      throw areasResult.error
    }

    if (sourcesResult.error) {
      throw sourcesResult.error
    }

    return {
      areas: areasResult.data ?? [],
      sources: sourcesResult.data ?? [],
    }
  }

  const getAdminPlaceById = async (id: string) => {
    const { data: place, error } = await supabase
      .from('places')
      .select(`
        id,
        slug,
        place_type,
        area_id,
        source_id,
        source_url,
        status,
        review_status,
        reviewed_at,
        reviewed_by,
        review_note,
        phone,
        website_url,
        naver_map_url,
        kakao_map_url,
        opening_hours,
        foreigner_friendly,
        last_verified_at,
        updated_at,
        place_translations (
          id,
          language_code,
          name,
          summary,
          description,
          address_text,
          local_tip
        )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!place) {
      return null
    }

    const { data: entityMedia, error: entityMediaError } = await supabase
      .from('entity_media')
      .select(`
        id,
        media_id,
        media_assets (
          id,
          storage_path,
          alt_text,
          credit_text,
          mime_type
        )
      `)
      .eq('entity_type', 'place')
      .eq('entity_id', id)
      .eq('role', 'cover')
      .maybeSingle()

    if (entityMediaError) {
      throw entityMediaError
    }

    return {
      ...place,
      cover: entityMedia?.media_assets
        ? {
            entityMediaId: entityMedia.id,
            mediaId: entityMedia.media_id,
            ...entityMedia.media_assets,
          }
        : null,
    }
  }

  const toPlacePayload = (values: AdminPlaceFormValues) => {
    let openingHours: Json | null = null

    if (values.openingHours.trim()) {
      try {
        openingHours = JSON.parse(values.openingHours) as Json
      }
      catch {
        throw new Error('Opening hours must be valid JSON.')
      }
    }

    return {
      slug: values.slug.trim().toLowerCase(),
      place_type: values.placeType.trim(),
      area_id: toNullable(values.areaId),
      source_id: toNullable(values.sourceId),
      source_url: toNullable(values.sourceUrl),
      status: values.status,
      phone: toNullable(values.phone),
      website_url: toNullable(values.websiteUrl),
      naver_map_url: toNullable(values.naverMapUrl),
      kakao_map_url: toNullable(values.kakaoMapUrl),
      opening_hours: openingHours,
      foreigner_friendly: values.foreignerFriendly === ''
        ? null
        : values.foreignerFriendly === 'true',
      last_verified_at: toNullable(values.lastVerifiedAt),
    }
  }

  const toTranslationPayload = (placeId: string, values: AdminPlaceFormValues) => ({
    place_id: placeId,
    language_code: 'en',
    name: values.name.trim(),
    summary: toNullable(values.summary),
    description: toNullable(values.description),
    address_text: toNullable(values.addressText),
    local_tip: toNullable(values.localTip),
  })

  const saveCoverImage = async (
    placeId: string,
    file: File,
    values: AdminPlaceFormValues,
    existingCover: ExistingCover | null,
  ) => {
    const extension = getImageExtension(file)

    if (!extension) {
      throw new Error('Cover images must be JPEG, PNG, or WebP files.')
    }

    const storagePath = `places/${placeId}/cover.${extension}`
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      throw new Error('The cover image could not be uploaded.')
    }

    const metadata = {
      bucket: 'media',
      storage_path: storagePath,
      media_type: 'image',
      mime_type: file.type,
      alt_text: toNullable(values.coverAltText),
      credit_text: toNullable(values.coverCreditText),
    }

    if (existingCover?.storage_path === storagePath) {
      const { error } = await supabase
        .from('media_assets')
        .update(metadata)
        .eq('id', existingCover.mediaId)

      if (error) {
        throw new Error('The cover image metadata could not be updated.')
      }

      return
    }

    const { data: mediaAsset, error: mediaError } = await supabase
      .from('media_assets')
      .insert(metadata)
      .select('id')
      .single()

    if (mediaError || !mediaAsset) {
      throw new Error('The cover image metadata could not be saved.')
    }

    const relationError = existingCover
      ? (await supabase
          .from('entity_media')
          .update({ media_id: mediaAsset.id })
          .eq('id', existingCover.entityMediaId)).error
      : (await supabase
          .from('entity_media')
          .insert({
            media_id: mediaAsset.id,
            entity_type: 'place',
            entity_id: placeId,
            role: 'cover',
          })).error

    if (relationError) {
      await supabase.storage.from('media').remove([storagePath])
      await supabase.from('media_assets').delete().eq('id', mediaAsset.id)
      throw new Error('The cover image could not be linked to this place.')
    }

    if (existingCover) {
      const { error: oldStorageError } = await supabase.storage
        .from('media')
        .remove([existingCover.storage_path])

      if (!oldStorageError) {
        await supabase.from('media_assets').delete().eq('id', existingCover.mediaId)
      }
    }
  }

  const updateCoverMetadata = async (existingCover: ExistingCover, values: AdminPlaceFormValues) => {
    const { error } = await supabase
      .from('media_assets')
      .update({
        alt_text: toNullable(values.coverAltText),
        credit_text: toNullable(values.coverCreditText),
      })
      .eq('id', existingCover.mediaId)

    if (error) {
      throw new Error('The cover image metadata could not be updated.')
    }
  }

  const createAdminPlace = async (
    values: AdminPlaceFormValues,
    coverFile: File | null,
  ): Promise<CreateAdminPlaceResult> => {
    const { data: place, error: placeError } = await supabase
      .from('places')
      .insert(toPlacePayload(values))
      .select('id')
      .single()

    if (placeError || !place) {
      throw placeError ?? new Error('The place could not be created.')
    }

    const { error: translationError } = await supabase
      .from('place_translations')
      .insert(toTranslationPayload(place.id, values))

    if (translationError) {
      throw translationError
    }

    if (coverFile) {
      try {
        await saveCoverImage(place.id, coverFile, values, null)
      }
      catch (coverError: unknown) {
        logAdminPlaceError(coverError)
        return { id: place.id, coverUploadFailed: true }
      }
    }

    return { id: place.id, coverUploadFailed: false }
  }

  const updateAdminPlace = async (
    id: string,
    values: AdminPlaceFormValues,
    coverFile: File | null,
    existingCover: ExistingCover | null,
  ) => {
    const { error: placeError } = await supabase
      .from('places')
      .update(toPlacePayload(values))
      .eq('id', id)

    if (placeError) {
      throw placeError
    }

    const { error: translationError } = await supabase
      .from('place_translations')
      .upsert(toTranslationPayload(id, values), {
        onConflict: 'place_id,language_code',
      })

    if (translationError) {
      throw translationError
    }

    if (coverFile) {
      await saveCoverImage(id, coverFile, values, existingCover)
    }
    else if (existingCover) {
      await updateCoverMetadata(existingCover, values)
    }
  }

  return {
    getAdminPlaces,
    getAdminDashboard,
    getAdminPlaceOptions,
    getAdminPlaceById,
    createAdminPlace,
    updateAdminPlace,
  }
}
