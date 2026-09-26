export type SearchTab = 'all' | 'places' | 'routes' | 'guides'

export type SearchCover = {
  storage_path: string
  alt_text: string | null
  credit_text: string | null
}

export type PlaceSearchResult = {
  id: string
  slug: string
  title: string
  summary: string
  placeType: string
  area: string | null
  areaSlug: string | null
  cover: SearchCover | null
}

export type RouteSearchResult = {
  id: string
  slug: string
  title: string
  summary: string
  routeType: string
  durationMinutes: number | null
  difficulty: string | null
  stopsCount: number
  cover: SearchCover | null
}

export type GuideSearchResult = {
  id: string
  slug: string
  title: string
  summary: string
  guideType: string
  lastVerifiedAt: string | null
  cover: SearchCover | null
}

export type SearchFilters = {
  placeType?: string
  area?: string
  routeType?: string
  difficulty?: string
  guideType?: string
  tag?: string
}

export type SearchResults = {
  places: PlaceSearchResult[]
  routes: RouteSearchResult[]
  guides: GuideSearchResult[]
}

const english = <T extends { language_code: string }>(translations: T[]) => {
  return translations.find(translation => translation.language_code === 'en')
}

const includesQuery = (query: string, ...values: Array<string | null | undefined>) => {
  if (!query) return true
  return values.join(' ').toLowerCase().includes(query)
}

export const useSearch = () => {
  const supabase = useSupabase()

  const search = async (keyword: string, filters: SearchFilters = {}): Promise<SearchResults> => {
    const query = keyword.trim().toLowerCase()
    const [placesResult, routesResult, guidesResult] = await Promise.all([
      supabase
        .from('places')
        .select(`
          id, slug, place_type,
          place_translations (language_code, name, summary, description),
          areas (slug, area_translations (language_code, name)),
          place_tags (tags (slug))
        `)
        .eq('status', 'published'),
      supabase
        .from('routes')
        .select(`
          id, slug, route_type, duration_minutes, difficulty,
          route_translations (language_code, name, summary, description),
          route_places (id),
          route_tags (tags (slug))
        `)
        .eq('status', 'published'),
      supabase
        .from('guides')
        .select(`
          id, slug, guide_type, last_verified_at,
          guide_translations (language_code, title, summary, body_markdown),
          guide_tags (tags (slug))
        `)
        .eq('status', 'published'),
    ])

    const error = placesResult.error ?? routesResult.error ?? guidesResult.error
    if (error) throw error

    const places = placesResult.data ?? []
    const routes = routesResult.data ?? []
    const guides = guidesResult.data ?? []
    const entityIds = [...places, ...routes, ...guides].map(item => item.id)
    const coversResult = entityIds.length
      ? await supabase
          .from('entity_media')
          .select('entity_id, media_assets (storage_path, alt_text, credit_text)')
          .eq('role', 'cover')
          .in('entity_type', ['place', 'route', 'guide'])
          .in('entity_id', entityIds)
      : { data: [], error: null }

    if (coversResult.error) throw coversResult.error

    const covers = new Map(
      (coversResult.data ?? [])
        .filter(item => item.media_assets)
        .map(item => [
          item.entity_id,
          {
            storage_path: item.media_assets!.storage_path,
            alt_text: item.media_assets!.alt_text,
            credit_text: item.media_assets!.credit_text,
          } satisfies SearchCover,
        ]),
    )

    return {
      places: places
        .map(place => {
          const translation = english(place.place_translations)
          if (!translation) return null
          const area = place.areas
          const areaTranslation = area ? english(area.area_translations) : null
          return {
            id: place.id,
            slug: place.slug,
            title: translation?.name ?? '',
            summary: translation?.summary ?? '',
            placeType: place.place_type,
            area: areaTranslation?.name ?? null,
            areaSlug: area?.slug ?? null,
            cover: covers.get(place.id) ?? null,
            description: translation?.description ?? '',
            tagSlugs: place.place_tags.flatMap(item => item.tags ? [item.tags.slug] : []),
          }
        })
        .filter((place): place is NonNullable<typeof place> => place !== null)
        .filter(place => includesQuery(query, place.title, place.summary, place.description))
        .filter(place => !filters.placeType || place.placeType === filters.placeType)
        .filter(place => !filters.area || place.areaSlug === filters.area)
        .filter(place => !filters.tag || place.tagSlugs.includes(filters.tag))
        .map(({ description: _description, tagSlugs: _tagSlugs, ...place }) => place),
      routes: routes
        .map(route => {
          const translation = english(route.route_translations)
          if (!translation) return null
          return {
            id: route.id,
            slug: route.slug,
            title: translation?.name ?? '',
            summary: translation?.summary ?? '',
            routeType: route.route_type,
            durationMinutes: route.duration_minutes,
            difficulty: route.difficulty,
            stopsCount: route.route_places.length,
            cover: covers.get(route.id) ?? null,
            description: translation?.description ?? '',
            tagSlugs: route.route_tags.flatMap(item => item.tags ? [item.tags.slug] : []),
          }
        })
        .filter((route): route is NonNullable<typeof route> => route !== null)
        .filter(route => includesQuery(query, route.title, route.summary, route.description))
        .filter(route => !filters.routeType || route.routeType === filters.routeType)
        .filter(route => !filters.difficulty || route.difficulty === filters.difficulty)
        .filter(route => !filters.tag || route.tagSlugs.includes(filters.tag))
        .map(({ description: _description, tagSlugs: _tagSlugs, ...route }) => route),
      guides: guides
        .map(guide => {
          const translation = english(guide.guide_translations)
          if (!translation) return null
          return {
            id: guide.id,
            slug: guide.slug,
            title: translation?.title ?? '',
            summary: translation?.summary ?? '',
            guideType: guide.guide_type,
            lastVerifiedAt: guide.last_verified_at,
            cover: covers.get(guide.id) ?? null,
            bodyMarkdown: translation?.body_markdown ?? '',
            tagSlugs: guide.guide_tags.flatMap(item => item.tags ? [item.tags.slug] : []),
          }
        })
        .filter((guide): guide is NonNullable<typeof guide> => guide !== null)
        .filter(guide => includesQuery(query, guide.title, guide.summary, guide.bodyMarkdown))
        .filter(guide => !filters.guideType || guide.guideType === filters.guideType)
        .filter(guide => !filters.tag || guide.tagSlugs.includes(filters.tag))
        .map(({ bodyMarkdown: _bodyMarkdown, tagSlugs: _tagSlugs, ...guide }) => guide),
    }
  }

  return { search }
}
