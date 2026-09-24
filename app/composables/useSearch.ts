export type SearchResultType = 'place' | 'route' | 'guide'

export interface SearchResult {
  id: string
  type: SearchResultType
  slug: string
  title: string
  summary: string
  meta?: string
}

export const useSearch = () => {
  const supabase = useSupabase()

  const search = async (keyword: string): Promise<SearchResult[]> => {
    const query = keyword.trim().toLowerCase()

    if (!query) {
      return []
    }

    const [
      placesResult,
      routesResult,
      guidesResult,
    ] = await Promise.all([
      supabase
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
        .eq('status', 'published'),

      supabase
        .from('routes')
        .select(`
          id,
          slug,
          route_type,
          duration_minutes,
          route_translations (
            language_code,
            name,
            summary
          )
        `)
        .eq('status', 'published'),

      supabase
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
        .eq('status', 'published'),
    ])

    if (placesResult.error) {
      throw placesResult.error
    }

    if (routesResult.error) {
      throw routesResult.error
    }

    if (guidesResult.error) {
      throw guidesResult.error
    }

    const places: SearchResult[] = (placesResult.data ?? [])
      .map((place) => {
        const translation = place.place_translations?.find(
          item => item.language_code === 'en',
        )

        return {
          id: place.id,
          type: 'place' as const,
          slug: place.slug,
          title: translation?.name ?? '',
          summary: translation?.summary ?? '',
          meta: place.place_type,
        }
      })
      .filter(item =>
        `${item.title} ${item.summary} ${item.meta}`
          .toLowerCase()
          .includes(query),
      )

    const routes: SearchResult[] = (routesResult.data ?? [])
      .map((route) => {
        const translation = route.route_translations?.find(
          item => item.language_code === 'en',
        )

        return {
          id: route.id,
          type: 'route' as const,
          slug: route.slug,
          title: translation?.name ?? '',
          summary: translation?.summary ?? '',
          meta: route.duration_minutes
            ? `${route.duration_minutes} min`
            : route.route_type,
        }
      })
      .filter(item =>
        `${item.title} ${item.summary} ${item.meta}`
          .toLowerCase()
          .includes(query),
      )

    const guides: SearchResult[] = (guidesResult.data ?? [])
      .map((guide) => {
        const translation = guide.guide_translations?.find(
          item => item.language_code === 'en',
        )

        return {
          id: guide.id,
          type: 'guide' as const,
          slug: guide.slug,
          title: translation?.title ?? '',
          summary: translation?.summary ?? '',
          meta: guide.guide_type,
        }
      })
      .filter(item =>
        `${item.title} ${item.summary} ${item.meta}`
          .toLowerCase()
          .includes(query),
      )

    return [
      ...places,
      ...routes,
      ...guides,
    ]
  }

  return {
    search,
  }
}