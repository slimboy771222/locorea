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

  // Admin mutations must only be added after Supabase Auth and authorization exist.
  return {
    getAdminPlaces,
    getAdminDashboard,
  }
}
