export type AdminGuideFormValues = {
  slug: string
  guideType: 'arrival' | 'transport' | 'payment' | 'sim' | 'maps' | 'language' | 'etiquette' | 'emergency' | 'troubleshooting' | 'general'
  sourceId: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  lastVerifiedAt: string
  title: string
  summary: string
  bodyMarkdown: string
  coverAltText: string
  coverCreditText: string
}

type ExistingCover = { entityMediaId: string; mediaId: string; storage_path: string }
const nullable = (value: string) => value.trim() || null
const logError = (error: unknown) => { if (import.meta.dev) console.error('Admin guide save failed.', error) }
const extensionFor = (file: File) => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type] ?? null)

export const getAdminGuideSaveError = (error: unknown, slug: string) => {
  logError(error)
  const record = typeof error === 'object' && error !== null ? error as { code?: string; status?: number; message?: string } : {}
  const message = error instanceof Error ? error.message : record.message ?? ''
  if (record.code === '23505' || record.status === 409 || message.includes('duplicate key')) return `The slug '${slug}' is already being used by another guide. Please choose a different slug.`
  const safe = ['Guide translation could not be saved.', 'The guide cover could not be uploaded.', 'The guide cover metadata could not be saved.', 'The guide cover could not be linked.']
  return safe.includes(message) ? message : 'The guide could not be saved. Please try again.'
}

export const useAdminGuides = () => {
  const supabase = useSupabase()
  const getAdminGuides = async () => {
    const { data, error } = await supabase.from('guides').select('id, slug, guide_type, featured, status, last_verified_at, updated_at, guide_translations(language_code, title)').order('updated_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }
  const getSources = async () => {
    const { data, error } = await supabase.from('sources').select('id, name').order('name')
    if (error) throw error
    return data ?? []
  }
  const getAdminGuideById = async (id: string) => {
    const { data: guide, error } = await supabase.from('guides').select('id, slug, guide_type, source_id, status, review_status, reviewed_at, reviewed_by, review_note, featured, last_verified_at, updated_at, guide_translations(language_code, title, summary, body_markdown)').eq('id', id).maybeSingle()
    if (error) throw error
    if (!guide) return null
    const { data: relation, error: mediaError } = await supabase.from('entity_media').select('id, media_id, media_assets(id, storage_path, alt_text, credit_text)').eq('entity_type', 'guide').eq('entity_id', id).eq('role', 'cover').maybeSingle()
    if (mediaError) throw mediaError
    return { ...guide, cover: relation?.media_assets ? { entityMediaId: relation.id, mediaId: relation.media_id, ...relation.media_assets } : null }
  }
  const payload = (values: AdminGuideFormValues) => ({ slug: values.slug.trim().toLowerCase(), guide_type: values.guideType, source_id: nullable(values.sourceId), status: values.status, featured: values.featured, last_verified_at: nullable(values.lastVerifiedAt) })
  const saveTranslation = async (id: string, values: AdminGuideFormValues) => {
    const { error } = await supabase.from('guide_translations').upsert({ guide_id: id, language_code: 'en', title: values.title.trim(), summary: nullable(values.summary), body_markdown: nullable(values.bodyMarkdown) }, { onConflict: 'guide_id,language_code' })
    if (error) throw new Error('Guide translation could not be saved.')
  }
  const saveCover = async (id: string, file: File, values: AdminGuideFormValues, existing: ExistingCover | null) => {
    const extension = extensionFor(file); if (!extension) throw new Error('The guide cover could not be uploaded.')
    const storagePath = `guides/${id}/cover.${extension}`
    const { error: uploadError } = await supabase.storage.from('media').upload(storagePath, file, { contentType: file.type, upsert: true }); if (uploadError) throw new Error('The guide cover could not be uploaded.')
    const metadata = { bucket: 'media', storage_path: storagePath, media_type: 'image', mime_type: file.type, alt_text: nullable(values.coverAltText), credit_text: nullable(values.coverCreditText) }
    if (existing?.storage_path === storagePath) { const { error } = await supabase.from('media_assets').update(metadata).eq('id', existing.mediaId); if (error) throw new Error('The guide cover metadata could not be saved.'); return }
    const { data: asset, error: assetError } = await supabase.from('media_assets').insert(metadata).select('id').single(); if (assetError || !asset) throw new Error('The guide cover metadata could not be saved.')
    const { error: relationError } = existing ? await supabase.from('entity_media').update({ media_id: asset.id }).eq('id', existing.entityMediaId) : await supabase.from('entity_media').insert({ media_id: asset.id, entity_type: 'guide', entity_id: id, role: 'cover' }); if (relationError) throw new Error('The guide cover could not be linked.')
    if (existing) { const { error } = await supabase.storage.from('media').remove([existing.storage_path]); if (!error) await supabase.from('media_assets').delete().eq('id', existing.mediaId) }
  }
  const createAdminGuide = async (values: AdminGuideFormValues, cover: File | null) => {
    const { data, error } = await supabase.from('guides').insert(payload(values)).select('id').single(); if (error || !data) throw error ?? new Error('The guide could not be created.')
    try { await saveTranslation(data.id, values); if (cover) await saveCover(data.id, cover, values, null); return { id: data.id, partial: false } } catch (error) { logError(error); return { id: data.id, partial: true } }
  }
  const updateAdminGuide = async (id: string, values: AdminGuideFormValues, cover: File | null, existing: ExistingCover | null) => {
    const { error } = await supabase.from('guides').update(payload(values)).eq('id', id); if (error) throw error
    await saveTranslation(id, values)
    if (cover) await saveCover(id, cover, values, existing)
    else if (existing) { const { error: metadataError } = await supabase.from('media_assets').update({ alt_text: nullable(values.coverAltText), credit_text: nullable(values.coverCreditText) }).eq('id', existing.mediaId); if (metadataError) throw new Error('The guide cover metadata could not be saved.') }
  }
  return { getAdminGuides, getSources, getAdminGuideById, createAdminGuide, updateAdminGuide }
}
