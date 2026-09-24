export const useRoutes = () => {
  const supabase = useSupabase()

  const getRouteBySlug = async (slug: string) => {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        id,
        slug,
        route_type,
        duration_minutes,
        distance_km,
        difficulty,
        last_verified_at,

        route_translations (
          language_code,
          name,
          summary,
          description
        ),

        route_places (
          stop_order,
          stay_minutes,
          travel_minutes_to_next,
          note,

          places (
            id,
            slug,
            place_type,

            place_translations (
              language_code,
              name,
              summary
            )
          )
        ),

        sources (
          name,
          url
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (error) {
      throw error
    }

    if (data?.route_places) {
      data.route_places.sort(
        (a, b) => a.stop_order - b.stop_order,
      )
    }

    return data
  }

  return {
    getRouteBySlug,
  }
}