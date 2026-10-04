export const useHomeData = () => {
  const supabase = useSupabase()

  const getCuratedPlaces = async (slugs: readonly string[]) => {
    if (!slugs.length) {
      return []
    }

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
        ),
        areas (
          slug,
          area_translations (
            language_code,
            name
          )
        )
      `)
      .eq('status', 'published')
      .in('slug', [...slugs])

    if (error) {
      throw error
    }

    const placesBySlug = new Map((places ?? []).map(place => [place.slug, place]))
    const curatedPlaces = slugs.flatMap(slug => {
      const place = placesBySlug.get(slug)

      return place ? [place] : []
    })

    return getPlacesWithCovers(curatedPlaces)
  }

  const getPlacesWithCovers = async <T extends { id: string }>(places: T[]) => {
    const placeIds = places.map(place => place.id)

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

  const getCuratedRoutes = async (slugs: readonly string[], limit = 3) => {
    const curatedSlugs = slugs.slice(0, limit)

    if (!curatedSlugs.length) {
      return []
    }

    const { data: routes, error } = await supabase
      .from('routes')
      .select(`
        id,
        slug,
        route_type,
        duration_minutes,
        distance_km,
        difficulty,
        route_translations (
          language_code,
          name,
          summary
        ),
        route_places (
          stop_order,
          places (
            slug,
            place_translations (
              language_code,
              name
            )
          )
        )
      `)
      .eq('status', 'published')
      .in('slug', [...curatedSlugs])

    if (error) {
      throw error
    }

    const routesBySlug = new Map((routes ?? []).map(route => [route.slug, route]))
    const curatedRoutes = curatedSlugs.flatMap(slug => {
      const route = routesBySlug.get(slug)

      return route ? [route] : []
    })

    return getRoutesWithCovers(curatedRoutes)
  }

  const getRoutesWithCovers = async <T extends { id: string, route_places: Array<{ stop_order: number }> }>(routes: T[]) => {
    const routeIds = routes.map(route => route.id)

    if (!routeIds.length) {
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
      .eq('entity_type', 'route')
      .eq('role', 'cover')
      .in('entity_id', routeIds)

    if (error) {
      throw error
    }

    const coversByRouteId = new Map(
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

    return routes.map(route => ({
      ...route,
      route_places: [...route.route_places].sort((a, b) => a.stop_order - b.stop_order),
      cover: coversByRouteId.get(route.id) ?? null,
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
    getCuratedPlaces,
    getCuratedRoutes,
    getFeaturedGuides,
  }
}
