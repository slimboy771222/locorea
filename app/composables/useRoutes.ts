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
        ),

        areas (
          slug,
          area_translations (
            language_code,
            name
          )
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

    if (!data) {
      return null
    }

    const placeIds = data.route_places
      .map(stop => stop.places?.id)
      .filter((id): id is string => Boolean(id))
    const entityIds = [data.id, ...placeIds]

    const [{ data: entityMedia, error: entityMediaError }, { data: routeTags, error: routeTagsError }] = await Promise.all([
      supabase
        .from('entity_media')
        .select(`
          entity_type,
          entity_id,
          media_assets (
            storage_path,
            alt_text,
            credit_text
          )
        `)
        .in('entity_type', ['route', 'place'])
        .eq('role', 'cover')
        .in('entity_id', entityIds),
      supabase
        .from('route_tags')
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
        .eq('route_id', data.id),
    ])

    if (entityMediaError) {
      throw entityMediaError
    }

    if (routeTagsError) {
      throw routeTagsError
    }

    const covers = new Map(
      (entityMedia ?? [])
        .filter(item => item.media_assets)
        .map(item => [`${item.entity_type}:${item.entity_id}`, item.media_assets!]),
    )

    const tags = (routeTags ?? []).flatMap(item => item.tags
      ? [{ id: item.tag_id, ...item.tags }]
      : [])

    return {
      ...data,
      cover: covers.get(`route:${data.id}`) ?? null,
      tags,
      route_places: data.route_places.map(stop => ({
        ...stop,
        places: stop.places
          ? {
              ...stop.places,
              cover: covers.get(`place:${stop.places.id}`) ?? null,
            }
          : null,
      })),
    }
  }

  return {
    getRouteBySlug,
  }
}
