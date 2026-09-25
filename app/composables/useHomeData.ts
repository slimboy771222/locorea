export const useHomeData = () => {
  const supabase = useSupabase()

  const getPopularPlaces = async () => {
    const { data: places, error } = await supabase
      .from('places')
      .select(`
        id,
        slug,
        place_type,
        place_translations (
          language_code,
          name,
          summary
        )
      `)
      .eq('status', 'published')
      .limit(5)

    if (error) {
      throw error
    }

    const placeIds = (places ?? []).map(place => place.id)

    if (!placeIds.length) {
      return []
    }

    const { data: entityMedia, error: entityMediaError } = await supabase
      .from('entity_media')
      .select(`
        entity_id,
        media_assets (
          id,
          bucket,
          storage_path,
          alt_text,
          credit_text
        )
      `)
      .eq('entity_type', 'place')
      .eq('role', 'cover')
      .in('entity_id', placeIds)

    if (entityMediaError) {
      throw entityMediaError
    }

    const coversByPlaceId = new Map(
      (entityMedia ?? [])
        .filter(item => item.media_assets)
        .map(item => [
          item.entity_id,
          {
            storage_path: item.media_assets!.storage_path,
            alt_text: item.media_assets!.alt_text,
            credit_text: item.media_assets!.credit_text,
          },
        ]),
    )

    return places.map(place => ({
      ...place,
      cover: coversByPlaceId.get(place.id) ?? null,
    }))
  }

  const getFeaturedGuides = async () => {
    const { data: guides, error } = await supabase
      .from('guides')
      .select(`
        id,
        slug,
        guide_type,
        featured,
        guide_translations (
          language_code,
          title,
          summary
        )
      `)
      .eq('status', 'published')
      .eq('featured', true)
      .limit(6)

    if (error) {
      throw error
    }

    return getGuidesWithCovers(guides ?? [])
  }

  const getPopularGuides = async () => {
    const { data: guides, error } = await supabase
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
      .limit(5)

    if (error) {
      throw error
    }

    return getGuidesWithCovers(guides ?? [])
  }

  const getGuidesWithCovers = async <T extends { id: string }>(guides: T[]) => {
    const guideIds = guides.map(guide => guide.id)

    if (!guideIds.length) {
      return []
    }

    const { data: entityMedia, error } = await supabase
      .from('entity_media')
      .select(`
        entity_id,
        media_assets (
          id,
          bucket,
          storage_path,
          alt_text,
          credit_text
        )
      `)
      .eq('entity_type', 'guide')
      .eq('role', 'cover')
      .in('entity_id', guideIds)

    if (error) {
      throw error
    }

    const coversByGuideId = new Map(
      (entityMedia ?? [])
        .filter(item => item.media_assets)
        .map(item => [
          item.entity_id,
          {
            storage_path: item.media_assets!.storage_path,
            alt_text: item.media_assets!.alt_text,
            credit_text: item.media_assets!.credit_text,
          },
        ]),
    )

    return guides.map(guide => ({
      ...guide,
      cover: coversByGuideId.get(guide.id) ?? null,
    }))
  }

  return {
    getPopularPlaces,
    getFeaturedGuides,
    getPopularGuides,
  }
}
