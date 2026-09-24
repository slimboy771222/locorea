export const useHomeData = () => {
  const supabase = useSupabase()

  const getPopularPlaces = async () => {
    const { data, error } = await supabase
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
      .limit(4)

    if (error) {
      throw error
    }

    return data
  }

  const getFeaturedGuides = async () => {
    const { data, error } = await supabase
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

    return data
  }

  return {
    getPopularPlaces,
    getFeaturedGuides,
  }
}