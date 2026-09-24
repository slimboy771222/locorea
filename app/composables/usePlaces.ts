export const usePlaces = () => {
  const supabase = useSupabase()

  const getPlaceBySlug = async (slug: string) => {
    const { data, error } = await supabase
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

    return data
  }

  return {
    getPlaceBySlug,
  }
}