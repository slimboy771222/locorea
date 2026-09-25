export type AdminRouteStop = {
  placeId: string
  stayMinutes: string
  travelMinutesToNext: string
  note: string
}

export type AdminRouteFormValues = {
  slug: string
  routeType: 'walking' | 'half_day' | 'one_day' | 'multi_day' | 'food' | 'shopping' | 'culture' | 'custom'
  areaId: string
  sourceId: string
  durationMinutes: string
  distanceKm: string
  difficulty: '' | 'easy' | 'normal' | 'hard'
  status: 'draft' | 'published' | 'archived'
  lastVerifiedAt: string
  name: string
  summary: string
  description: string
  coverAltText: string
  coverCreditText: string
  stops: AdminRouteStop[]
}

type ExistingCover = { entityMediaId: string; mediaId: string; storage_path: string }

const toNullable = (value: string) => value.trim() || null
const toNumber = (value: string | number | null | undefined): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()

  if (!normalized) {
    return null
  }

  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

const logError = (error: unknown) => {
  if (import.meta.dev) console.error('Admin route save failed.', error)
}

const extensionFor = (file: File) => ({
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}[file.type] ?? null)

export const getAdminRouteSaveError = (error: unknown, slug: string) => {
  logError(error)
  const record = typeof error === 'object' && error !== null ? error as { code?: string; status?: number; message?: string } : {}
  const message = error instanceof Error ? error.message : record.message ?? ''

  if (record.code === '23505' || record.status === 409 || message.includes('duplicate key')) {
    return `The slug '${slug}' is already being used by another route. Please choose a different slug.`
  }

  const safe = [
    'Route stops could not be saved. Your route still exists; reopen it and try again.',
    'The route cover could not be uploaded.',
    'The route cover metadata could not be saved.',
    'The route cover could not be linked.',
    'Route translation could not be saved.',
  ]
  return safe.includes(message) ? message : 'The route could not be saved. Please try again.'
}

export const useAdminRoutes = () => {
  const supabase = useSupabase()

  const getAdminRoutes = async () => {
    const { data, error } = await supabase.from('routes').select(`
      id, slug, route_type, duration_minutes, difficulty, status, updated_at,
      route_translations(language_code, name), route_places(id),
      areas(area_translations(language_code, name))
    `).order('updated_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }

  const getOptions = async () => {
    const [areas, sources, places] = await Promise.all([
      supabase.from('areas').select('id, slug, area_translations(language_code, name)').eq('is_active', true).order('sort_order'),
      supabase.from('sources').select('id, name').order('name'),
      supabase.from('places').select('id, slug, place_translations(language_code, name)').order('slug'),
    ])
    if (areas.error) throw areas.error
    if (sources.error) throw sources.error
    if (places.error) throw places.error
    return { areas: areas.data ?? [], sources: sources.data ?? [], places: places.data ?? [] }
  }

  const getAdminRouteById = async (id: string) => {
    const { data: route, error } = await supabase.from('routes').select(`
      id, slug, route_type, area_id, source_id, duration_minutes, distance_km, difficulty, status, last_verified_at, updated_at,
      route_translations(language_code, name, summary, description),
      route_places(place_id, stop_order, stay_minutes, travel_minutes_to_next, note)
    `).eq('id', id).maybeSingle()
    if (error) throw error
    if (!route) return null
    const { data: entityMedia, error: mediaError } = await supabase.from('entity_media').select(`
      id, media_id, media_assets(id, storage_path, alt_text, credit_text)
    `).eq('entity_type', 'route').eq('entity_id', id).eq('role', 'cover').maybeSingle()
    if (mediaError) throw mediaError
    return { ...route, route_places: [...route.route_places].sort((a, b) => a.stop_order - b.stop_order), cover: entityMedia?.media_assets ? { entityMediaId: entityMedia.id, mediaId: entityMedia.media_id, ...entityMedia.media_assets } : null }
  }

  const routePayload = (values: AdminRouteFormValues) => ({
    slug: values.slug.trim().toLowerCase(), route_type: values.routeType, area_id: toNullable(values.areaId), source_id: toNullable(values.sourceId),
    duration_minutes: toNumber(values.durationMinutes), distance_km: toNumber(values.distanceKm), difficulty: toNullable(values.difficulty), status: values.status,
    last_verified_at: toNullable(values.lastVerifiedAt),
  })

  const saveTranslation = async (routeId: string, values: AdminRouteFormValues) => {
    const { error } = await supabase.from('route_translations').upsert({ route_id: routeId, language_code: 'en', name: values.name.trim(), summary: toNullable(values.summary), description: toNullable(values.description) }, { onConflict: 'route_id,language_code' })
    if (error) throw new Error('Route translation could not be saved.')
  }

  const saveStops = async (routeId: string, stops: AdminRouteStop[]) => {
    const { error: deleteError } = await supabase.from('route_places').delete().eq('route_id', routeId)
    if (deleteError) throw new Error('Route stops could not be saved. Your route still exists; reopen it and try again.')
    if (!stops.length) return
    const { error } = await supabase.from('route_places').insert(stops.map((stop, index) => ({ route_id: routeId, place_id: stop.placeId, stop_order: index + 1, stay_minutes: toNumber(stop.stayMinutes), travel_minutes_to_next: toNumber(stop.travelMinutesToNext), note: toNullable(stop.note) })))
    if (error) throw new Error('Route stops could not be saved. Your route still exists; reopen it and try again.')
  }

  const saveCover = async (routeId: string, file: File, values: AdminRouteFormValues, existing: ExistingCover | null) => {
    const extension = extensionFor(file)
    if (!extension) throw new Error('The route cover could not be uploaded.')
    const storagePath = `routes/${routeId}/cover.${extension}`
    const { error: uploadError } = await supabase.storage.from('media').upload(storagePath, file, { contentType: file.type, upsert: true })
    if (uploadError) throw new Error('The route cover could not be uploaded.')
    const metadata = { bucket: 'media', storage_path: storagePath, media_type: 'image', mime_type: file.type, alt_text: toNullable(values.coverAltText), credit_text: toNullable(values.coverCreditText) }
    if (existing?.storage_path === storagePath) {
      const { error } = await supabase.from('media_assets').update(metadata).eq('id', existing.mediaId)
      if (error) throw new Error('The route cover metadata could not be saved.')
      return
    }
    const { data: asset, error: assetError } = await supabase.from('media_assets').insert(metadata).select('id').single()
    if (assetError || !asset) throw new Error('The route cover metadata could not be saved.')
    const { error: relationError } = existing
      ? await supabase.from('entity_media').update({ media_id: asset.id }).eq('id', existing.entityMediaId)
      : await supabase.from('entity_media').insert({ media_id: asset.id, entity_type: 'route', entity_id: routeId, role: 'cover' })
    if (relationError) throw new Error('The route cover could not be linked.')
    if (existing) {
      const { error } = await supabase.storage.from('media').remove([existing.storage_path])
      if (!error) await supabase.from('media_assets').delete().eq('id', existing.mediaId)
    }
  }

  const createAdminRoute = async (values: AdminRouteFormValues, cover: File | null) => {
    const { data, error } = await supabase.from('routes').insert(routePayload(values)).select('id').single()
    if (error || !data) throw error ?? new Error('The route could not be created.')
    try {
      await saveTranslation(data.id, values)
      await saveStops(data.id, values.stops)
      if (cover) await saveCover(data.id, cover, values, null)
      return { id: data.id, partial: false }
    }
    catch (saveError) {
      logError(saveError)
      return { id: data.id, partial: true }
    }
  }

  const updateAdminRoute = async (id: string, values: AdminRouteFormValues, cover: File | null, existing: ExistingCover | null) => {
    const { error } = await supabase.from('routes').update(routePayload(values)).eq('id', id)
    if (error) throw error
    await saveTranslation(id, values)
    await saveStops(id, values.stops)
    if (cover) await saveCover(id, cover, values, existing)
    else if (existing) {
      const { error: metadataError } = await supabase.from('media_assets').update({ alt_text: toNullable(values.coverAltText), credit_text: toNullable(values.coverCreditText) }).eq('id', existing.mediaId)
      if (metadataError) throw new Error('The route cover metadata could not be saved.')
    }
  }

  return { getAdminRoutes, getOptions, getAdminRouteById, createAdminRoute, updateAdminRoute }
}
