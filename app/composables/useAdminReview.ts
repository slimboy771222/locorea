export type ReviewStatus = 'unreviewed' | 'in_review' | 'needs_fix' | 'approved'
export type ReviewEntityType = 'place' | 'route' | 'guide'

export type ReviewItem = {
  id: string
  type: ReviewEntityType
  title: string
  slug: string
  status: string
  reviewStatus: ReviewStatus
  reviewedAt: string | null
  reviewedBy: string | null
  reviewNote: string | null
  source: string | null
  lastVerifiedAt: string | null
  updatedAt: string
  hasCover: boolean
}

export type ReviewCounts = Record<ReviewStatus, number>

const reviewStatuses: ReviewStatus[] = ['unreviewed', 'in_review', 'needs_fix', 'approved']
const asReviewStatus = (value: string): ReviewStatus => reviewStatuses.includes(value as ReviewStatus) ? value as ReviewStatus : 'unreviewed'
const english = <T extends { language_code: string }>(translations: T[]) => translations.find(item => item.language_code === 'en')
const nullable = (value: string) => value.trim() || null

export const useAdminReview = () => {
  const supabase = useSupabase()
  const { getCurrentUser } = useAdminAuth()

  const getReviewQueue = async () => {
    const [placesResult, routesResult, guidesResult] = await Promise.all([
      supabase.from('places').select('id, slug, status, review_status, reviewed_at, reviewed_by, review_note, last_verified_at, updated_at, sources(name), place_translations(language_code, name)').order('updated_at', { ascending: false }),
      supabase.from('routes').select('id, slug, status, review_status, reviewed_at, reviewed_by, review_note, last_verified_at, updated_at, sources(name), route_translations(language_code, name)').order('updated_at', { ascending: false }),
      supabase.from('guides').select('id, slug, status, review_status, reviewed_at, reviewed_by, review_note, last_verified_at, updated_at, sources(name), guide_translations(language_code, title)').order('updated_at', { ascending: false }),
    ])
    const error = placesResult.error ?? routesResult.error ?? guidesResult.error
    if (error) throw error

    const places = placesResult.data ?? []
    const routes = routesResult.data ?? []
    const guides = guidesResult.data ?? []
    const entityIds = [...places, ...routes, ...guides].map(item => item.id)
    const coversResult = entityIds.length
      ? await supabase.from('entity_media').select('entity_id').eq('role', 'cover').in('entity_type', ['place', 'route', 'guide']).in('entity_id', entityIds)
      : { data: [], error: null }
    if (coversResult.error) throw coversResult.error
    const coverIds = new Set((coversResult.data ?? []).map(item => item.entity_id))

    const items: ReviewItem[] = [
      ...places.map(place => ({
        id: place.id, type: 'place' as const, title: english(place.place_translations)?.name ?? 'Untitled place', slug: place.slug,
        status: place.status, reviewStatus: asReviewStatus(place.review_status), reviewedAt: place.reviewed_at, reviewedBy: place.reviewed_by,
        reviewNote: place.review_note, source: place.sources?.name ?? null, lastVerifiedAt: place.last_verified_at, updatedAt: place.updated_at, hasCover: coverIds.has(place.id),
      })),
      ...routes.map(route => ({
        id: route.id, type: 'route' as const, title: english(route.route_translations)?.name ?? 'Untitled route', slug: route.slug,
        status: route.status, reviewStatus: asReviewStatus(route.review_status), reviewedAt: route.reviewed_at, reviewedBy: route.reviewed_by,
        reviewNote: route.review_note, source: route.sources?.name ?? null, lastVerifiedAt: route.last_verified_at, updatedAt: route.updated_at, hasCover: coverIds.has(route.id),
      })),
      ...guides.map(guide => ({
        id: guide.id, type: 'guide' as const, title: english(guide.guide_translations)?.title ?? 'Untitled guide', slug: guide.slug,
        status: guide.status, reviewStatus: asReviewStatus(guide.review_status), reviewedAt: guide.reviewed_at, reviewedBy: guide.reviewed_by,
        reviewNote: guide.review_note, source: guide.sources?.name ?? null, lastVerifiedAt: guide.last_verified_at, updatedAt: guide.updated_at, hasCover: coverIds.has(guide.id),
      })),
    ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

    const counts = items.reduce<ReviewCounts>((total, item) => {
      total[item.reviewStatus] = (total[item.reviewStatus] ?? 0) + 1
      return total
    }, { unreviewed: 0, in_review: 0, needs_fix: 0, approved: 0 })

    return { items, counts }
  }

  const getApprovalRequirements = async (type: ReviewEntityType, id: string) => {
    if (type === 'place') {
      const { data, error } = await supabase.from('places').select('slug, source_id, place_translations(language_code, name)').eq('id', id).single()
      if (error) throw error
      const translation = english(data.place_translations)
      return [!data.slug.trim() && 'Slug is required.', !data.source_id && 'Source is required.', !translation && 'English translation is required.', !translation?.name.trim() && 'English name is required.'].filter(Boolean) as string[]
    }
    if (type === 'route') {
      const { data, error } = await supabase.from('routes').select('slug, source_id, route_translations(language_code, name), route_places(id)').eq('id', id).single()
      if (error) throw error
      const translation = english(data.route_translations)
      return [!data.slug.trim() && 'Slug is required.', !data.source_id && 'Source is required.', !translation && 'English translation is required.', !translation?.name.trim() && 'English name is required.', data.route_places.length < 2 && 'At least 2 route stops are required.'].filter(Boolean) as string[]
    }
    const { data, error } = await supabase.from('guides').select('slug, source_id, guide_translations(language_code, title, body_markdown)').eq('id', id).single()
    if (error) throw error
    const translation = english(data.guide_translations)
    return [!data.slug.trim() && 'Slug is required.', !data.source_id && 'Source is required.', !translation && 'English translation is required.', !translation?.title.trim() && 'English title is required.', !translation?.body_markdown?.trim() && 'English body is required.'].filter(Boolean) as string[]
  }

  const updateReview = async ({ type, id, reviewStatus, reviewNote, preserveReviewMetadata = false }: { type: ReviewEntityType; id: string; reviewStatus: ReviewStatus; reviewNote: string; preserveReviewMetadata?: boolean }) => {
    if (reviewStatus === 'approved' && !preserveReviewMetadata) {
      const missing = await getApprovalRequirements(type, id)
      if (missing.length) throw new Error(`Cannot approve until: ${missing.join(' ')}`)
    }

    const user = reviewStatus === 'approved' && !preserveReviewMetadata ? await getCurrentUser() : null
    if (reviewStatus === 'approved' && !user) throw new Error('Your admin session has expired. Please sign in again.')
    const reviewFields = preserveReviewMetadata
      ? {}
      : reviewStatus === 'approved'
      ? { reviewed_at: new Date().toISOString(), reviewed_by: user!.id }
      : reviewStatus === 'unreviewed'
        ? { reviewed_at: null, reviewed_by: null }
        : {}
    const payload = { review_status: reviewStatus, review_note: nullable(reviewNote), ...reviewFields }
    const query = type === 'place'
      ? supabase.from('places').update(payload).eq('id', id)
      : type === 'route'
        ? supabase.from('routes').update(payload).eq('id', id)
        : supabase.from('guides').update(payload).eq('id', id)
    const { error } = await query
    if (error) throw error
  }

  return { getReviewQueue, getApprovalRequirements, updateReview }
}
