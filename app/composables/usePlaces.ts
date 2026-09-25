export const usePlaces = () => {
  const supabase = useSupabase()

  const getPlaceBySlug = async (slug: string) => {
    const { data: place, error } = await supabase
      .from('places')
      .select(`
        id,
        slug,
        place_type,
        phone,
        website_url,
        naver_map_url,
        kakao_map_url,
        opening_hours,
        foreigner_friendly,
        last_verified_at,

        place_translations (
          language_code,
          name,
          summary,
          description,
          address_text,
          local_tip
        ),

        areas (
          slug,
          area_translations (
            language_code,
            name
          )
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

    if (!place) {
      return null
    }

    const { data: entityMedia, error: entityMediaError } = await supabase
      .from('entity_media')
      .select(`
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
      .eq('entity_id', place.id)
      .maybeSingle()

    if (entityMediaError) {
      throw entityMediaError
    }

    const mediaAsset = entityMedia?.media_assets

    return {
      ...place,
      cover: mediaAsset
        ? {
            storage_path: mediaAsset.storage_path,
            alt_text: mediaAsset.alt_text,
            credit_text: mediaAsset.credit_text,
          }
        : null,
    }
  }

  return {
    getPlaceBySlug,
  }
}
