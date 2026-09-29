export const useGuides = () => {
  const supabase = useSupabase()

  const getGuideTags = async (guideId: string) => {
    const { data, error } = await supabase
      .from('guide_tags')
      .select(`
        tag_id,
        tags (
          slug,
          tag_translations (
            language_code,
            name
          )
        )
      `)
      .eq('guide_id', guideId)

    if (error) throw error

    return (data ?? []).flatMap(item => item.tags
      ? [{ id: item.tag_id, ...item.tags }]
      : [])
  }

  const getRelatedGuides = async (tagIds: string[], guideId: string) => {
    if (!tagIds.length) return []

    const { data: guideLinks, error: guideLinksError } = await supabase
      .from('guide_tags')
      .select('guide_id')
      .in('tag_id', tagIds)

    if (guideLinksError) throw guideLinksError

    const guideIds = [...new Set((guideLinks ?? []).map(item => item.guide_id))]
      .filter(id => id !== guideId)

    if (!guideIds.length) return []

    const { data, error } = await supabase
      .from('guides')
      .select(`
        id,
        slug,
        guide_type,
        guide_translations (
          language_code,
          title,
          summary
        )
      `)
      .eq('status', 'published')
      .in('id', guideIds)
      .limit(3)

    if (error) throw error

    return data ?? []
  }

  const getGuideBySlug = async (slug: string) => {
    const { data, error } = await supabase
      .from('guides')
      .select(`
        id,
        slug,
        guide_type,
        featured,
        last_verified_at,
        source_url,

        guide_translations (
          language_code,
          title,
          summary,
          body_markdown
        ),

        sources (
          name,
          url,
          attribution
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!data) return null

    const [{ data: entityMedia, error: entityMediaError }, tags] = await Promise.all([
      supabase
        .from('entity_media')
        .select(`
          media_assets (
            storage_path,
            alt_text,
            credit_text
          )
        `)
        .eq('entity_type', 'guide')
        .eq('role', 'cover')
        .eq('entity_id', data.id)
        .maybeSingle(),
      getGuideTags(data.id),
    ])

    if (entityMediaError) throw entityMediaError

    const relatedGuides = await getRelatedGuides(tags.map(tag => tag.id), data.id)

    return {
      ...data,
      cover: entityMedia?.media_assets ?? null,
      tags,
      relatedGuides,
    }
  }

  return {
    getGuideBySlug,
  }
}
