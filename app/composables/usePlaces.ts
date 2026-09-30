export const usePlaces = () => {
  const supabase = useSupabase()

  const getPlaceTags = async (placeId: string) => {
    const { data, error } = await supabase
      .from('place_tags')
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
      .eq('place_id', placeId)

    if (error) {
      throw error
    }

    return (data ?? []).flatMap(item => item.tags
      ? [{ id: item.tag_id, ...item.tags }]
      : [])
  }

  const getRelatedRoutes = async (placeId: string) => {
    const { data: routeLinks, error: routeLinksError } = await supabase
      .from('route_places')
      .select('route_id')
      .eq('place_id', placeId)

    if (routeLinksError) {
      throw routeLinksError
    }

    const routeIds = [...new Set((routeLinks ?? []).map(item => item.route_id))]

    if (!routeIds.length) {
      return []
    }

    const { data, error } = await supabase
      .from('routes')
      .select(`
        id,
        slug,
        duration_minutes,
        distance_km,
        difficulty,
        route_translations (
          language_code,
          name,
          summary
        )
      `)
      .eq('status', 'published')
      .in('id', routeIds)

    if (error) {
      throw error
    }

    return data ?? []
  }

  const getRelatedGuides = async (tagIds: string[]) => {
    if (!tagIds.length) {
      return []
    }

    const { data: guideLinks, error: guideLinksError } = await supabase
      .from('guide_tags')
      .select('guide_id')
      .in('tag_id', tagIds)

    if (guideLinksError) {
      throw guideLinksError
    }

    const guideIds = [...new Set((guideLinks ?? []).map(item => item.guide_id))]

    if (!guideIds.length) {
      return []
    }

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

    if (error) {
      throw error
    }

    return data ?? []
  }

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
        location,
        opening_hours,
        regular_closed_days,
        price_level,
        foreigner_friendly,
        last_verified_at,
        source_url,

        place_translations (
          language_code,
          name,
          summary,
          description,
          address_text,
          local_tip,
          admission_info,
          getting_there,
          signature_menu
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
      console.error('[getPlaceBySlug] place query failed:', error)
      throw error
    }

    if (!place) {
      return null
    }

    const { data: entityMedia, error: entityMediaError } = await supabase
      .from('entity_media')
      .select(`
        role,
        sort_order,
        created_at,
        media_assets (
          id,
          bucket,
          storage_path,
          alt_text,
          source_provider,
          source_url,
          license_code,
          attribution_text,
          attribution_required
        )
      `)
      .eq('entity_type', 'place')
      .eq('entity_id', place.id)
      .in('role', ['cover', 'gallery'])
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (entityMediaError) {
      console.error('[getPlaceBySlug] media query failed:', entityMediaError)
      throw entityMediaError
    }

    const media = (entityMedia ?? [])
      .flatMap((relation) => relation.media_assets
        ? [{
            ...relation.media_assets,
            role: relation.role,
            sort_order: relation.sort_order,
            created_at: relation.created_at,
          }]
        : [])
      .sort((first, second) => {
        const firstRoleOrder = first.role === 'cover' ? 0 : 1
        const secondRoleOrder = second.role === 'cover' ? 0 : 1

        return firstRoleOrder - secondRoleOrder
          || first.sort_order - second.sort_order
          || first.created_at.localeCompare(second.created_at)
      })
      .slice(0, 4)

 //   const [tags, relatedRoutes] = await Promise.all([
 //     getPlaceTags(place.id),
 //     getRelatedRoutes(place.id),
 //   ])
 //   const relatedGuides = await getRelatedGuides(tags.map(tag => tag.id))
 let tags
let relatedRoutes
let relatedGuides

try {
  ;[tags, relatedRoutes] = await Promise.all([
    getPlaceTags(place.id),
    getRelatedRoutes(place.id),
  ])

  relatedGuides = await getRelatedGuides(tags.map(tag => tag.id))
}
catch (error) {
  console.error('[getPlaceBySlug] related content query failed:', error)
  throw error
}

    return {
      ...place,
      media,
      tags,
      relatedRoutes,
      relatedGuides,
    }
  }

  return {
    getPlaceBySlug,
  }
}
