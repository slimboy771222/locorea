import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database.types'

type EntityType = 'PLACE' | 'ROUTE' | 'GUIDE'
type Manifest = {
  release: string
  places: string[]
  routes: string[]
  guides: string[]
}
type ReleaseItem = {
  type: EntityType
  id: string
  slug: string
}
type Summary = {
  valid: number
  skipped: number
  invalid: number
  publishable: ReleaseItem[]
}

const manifestArgument = process.argv[2]
const dryRun = process.argv.includes('--dry-run')

const loadEnvironment = () => {
  try {
    process.loadEnvFile(resolve('.env'))
  }
  catch (error: unknown) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error
  }
}

const report = (state: 'VALID' | 'SKIPPED' | 'INVALID' | 'PUBLISHED', type: EntityType, slug: string, reason: string) => {
  console.log(`${state} ${type}: ${slug} · ${reason}`)
}

const createSummary = (): Summary => ({ valid: 0, skipped: 0, invalid: 0, publishable: [] })

const printTotals = (summaries: Record<EntityType, Summary>) => {
  for (const type of ['PLACE', 'ROUTE', 'GUIDE'] as const) {
    const summary = summaries[type]
    console.log(`\n${type[0]}${type.slice(1).toLowerCase()}s\nValid: ${summary.valid}\nSkipped: ${summary.skipped}\nInvalid: ${summary.invalid}`)
  }
}

const requireStringArray = (value: unknown, key: string) => {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item.trim())) {
    throw new Error(`Release manifest field '${key}' must be an array of non-empty slugs.`)
  }
  return value.map(item => item.trim())
}

const readManifest = async (): Promise<Manifest> => {
  if (!manifestArgument) throw new Error('Usage: tsx scripts/release/publish-content.ts <manifest-path> [--dry-run]')
  const path = resolve(manifestArgument)
  let contents: string
  try {
    contents = await readFile(path, 'utf8')
  }
  catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') throw new Error(`Release manifest not found: ${path}`)
    throw error
  }

  const parsed: unknown = JSON.parse(contents)
  if (!parsed || typeof parsed !== 'object') throw new Error('Release manifest must be an object.')
  const manifest = parsed as Record<string, unknown>
  if (typeof manifest.release !== 'string' || !manifest.release.trim()) throw new Error("Release manifest field 'release' is required.")
  return {
    release: manifest.release.trim(),
    places: requireStringArray(manifest.places, 'places'),
    routes: requireStringArray(manifest.routes, 'routes'),
    guides: requireStringArray(manifest.guides, 'guides'),
  }
}

const hasDuplicates = (slugs: string[]) => new Set(slugs).size !== slugs.length

const main = async () => {
  loadEnvironment()
  const url = process.env.LOCOREA_IMPORT_SUPABASE_URL ?? process.env.NUXT_PUBLIC_SUPABASE_URL
  const key = process.env.LOCOREA_IMPORT_SERVICE_ROLE_KEY
  if (!key) throw new Error('Missing LOCOREA_IMPORT_SERVICE_ROLE_KEY. Bulk releases require the local server-side release credential.')
  if (!url) throw new Error('Missing LOCOREA_IMPORT_SUPABASE_URL or NUXT_PUBLIC_SUPABASE_URL.')

  const manifest = await readManifest()
  const summaries: Record<EntityType, Summary> = { PLACE: createSummary(), ROUTE: createSummary(), GUIDE: createSummary() }
  const duplicateManifestFields = ([['PLACE', manifest.places], ['ROUTE', manifest.routes], ['GUIDE', manifest.guides]] as const)
  for (const [type, slugs] of duplicateManifestFields) {
    if (hasDuplicates(slugs)) {
      summaries[type].invalid += 1
      report('INVALID', type, '(manifest)', 'duplicate slugs in manifest')
    }
  }

  const supabase = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const [placesResult, routesResult, guidesResult] = await Promise.all([
    supabase.from('places').select('id, slug, status').in('slug', manifest.places),
    supabase.from('routes').select('id, slug, status').in('slug', manifest.routes),
    supabase.from('guides').select('id, slug, status').in('slug', manifest.guides),
  ])
  const entityError = placesResult.error ?? routesResult.error ?? guidesResult.error
  if (entityError) {
    console.error('Release entity lookup error:', entityError)
    throw new Error('Could not load release entities.')
  }

  const places = placesResult.data ?? []
  const routes = routesResult.data ?? []
  const guides = guidesResult.data ?? []
  const [placeTranslationsResult, routeTranslationsResult, guideTranslationsResult, routeStopsResult] = await Promise.all([
    places.length ? supabase.from('place_translations').select('place_id, name').eq('language_code', 'en').in('place_id', places.map(place => place.id)) : Promise.resolve({ data: [], error: null }),
    routes.length ? supabase.from('route_translations').select('route_id, name').eq('language_code', 'en').in('route_id', routes.map(route => route.id)) : Promise.resolve({ data: [], error: null }),
    guides.length ? supabase.from('guide_translations').select('guide_id, title, body_markdown').eq('language_code', 'en').in('guide_id', guides.map(guide => guide.id)) : Promise.resolve({ data: [], error: null }),
    routes.length ? supabase.from('route_places').select('route_id, place_id').in('route_id', routes.map(route => route.id)) : Promise.resolve({ data: [], error: null }),
  ])
  const translationError = placeTranslationsResult.error ?? routeTranslationsResult.error ?? guideTranslationsResult.error ?? routeStopsResult.error
  if (translationError) {
    console.error('Release translation or stop lookup error:', translationError)
    throw new Error('Could not load release translations or Route stops.')
  }

  const routeStops = routeStopsResult.data ?? []
  const stopPlaceIds = [...new Set(routeStops.map(stop => stop.place_id))]
  const stopPlacesResult = stopPlaceIds.length
    ? await supabase.from('places').select('id, slug, status').in('id', stopPlaceIds)
    : { data: [], error: null }
  if (stopPlacesResult.error) {
    console.error('Release Route dependency lookup error:', stopPlacesResult.error)
    throw new Error('Could not load Route stop Places.')
  }

  const placeBySlug = new Map(places.map(place => [place.slug, place]))
  const routeBySlug = new Map(routes.map(route => [route.slug, route]))
  const guideBySlug = new Map(guides.map(guide => [guide.slug, guide]))
  const placeTranslationById = new Map((placeTranslationsResult.data ?? []).map(translation => [translation.place_id, translation]))
  const routeTranslationById = new Map((routeTranslationsResult.data ?? []).map(translation => [translation.route_id, translation]))
  const guideTranslationById = new Map((guideTranslationsResult.data ?? []).map(translation => [translation.guide_id, translation]))
  const stopsByRouteId = new Map<string, string[]>()
  for (const stop of routeStops) {
    const stops = stopsByRouteId.get(stop.route_id) ?? []
    stops.push(stop.place_id)
    stopsByRouteId.set(stop.route_id, stops)
  }
  const stopPlaceById = new Map((stopPlacesResult.data ?? []).map(place => [place.id, place]))
  const manifestPlaceSlugs = new Set(manifest.places)

  const validateStatus = (type: EntityType, summary: Summary, item: { id: string, slug: string, status: string }, reason: string | null) => {
    if (reason) { summary.invalid += 1; report('INVALID', type, item.slug, reason); return }
    if (item.status === 'published') { summary.skipped += 1; report('SKIPPED', type, item.slug, 'already published'); return }
    if (item.status === 'archived') { summary.invalid += 1; report('INVALID', type, item.slug, 'entity is archived'); return }
    if (item.status !== 'draft') { summary.invalid += 1; report('INVALID', type, item.slug, `unsupported status: ${item.status}`); return }
    summary.valid += 1
    summary.publishable.push({ type, id: item.id, slug: item.slug })
    report('VALID', type, item.slug, 'draft -> published')
  }

  for (const slug of manifest.places) {
    const place = placeBySlug.get(slug)
    if (!place) { summaries.PLACE.invalid += 1; report('INVALID', 'PLACE', slug, 'entity not found'); continue }
    const translation = placeTranslationById.get(place.id)
    validateStatus('PLACE', summaries.PLACE, place, !translation ? 'English translation missing' : !translation.name.trim() ? 'English name missing' : null)
  }
  for (const slug of manifest.routes) {
    const route = routeBySlug.get(slug)
    if (!route) { summaries.ROUTE.invalid += 1; report('INVALID', 'ROUTE', slug, 'entity not found'); continue }
    const translation = routeTranslationById.get(route.id)
    const stops = stopsByRouteId.get(route.id) ?? []
    const missingDependency = stops.find(placeId => {
      const stopPlace = stopPlaceById.get(placeId)
      return !stopPlace || (stopPlace.status !== 'published' && !manifestPlaceSlugs.has(stopPlace.slug))
    })
    const reason = !translation
      ? 'English translation missing'
      : !translation.name.trim()
        ? 'English name missing'
        : stops.length < 2
          ? 'at least 2 Route stops are required'
          : missingDependency
            ? `Route stop is not published or included in this release: ${stopPlaceById.get(missingDependency)?.slug ?? missingDependency}`
            : null
    validateStatus('ROUTE', summaries.ROUTE, route, reason)
  }
  for (const slug of manifest.guides) {
    const guide = guideBySlug.get(slug)
    if (!guide) { summaries.GUIDE.invalid += 1; report('INVALID', 'GUIDE', slug, 'entity not found'); continue }
    const translation = guideTranslationById.get(guide.id)
    const reason = !translation
      ? 'English translation missing'
      : !translation.title.trim()
        ? 'English title missing'
        : !translation.body_markdown?.trim()
          ? 'English body_markdown missing'
          : null
    validateStatus('GUIDE', summaries.GUIDE, guide, reason)
  }

  printTotals(summaries)
  const invalidCount = summaries.PLACE.invalid + summaries.ROUTE.invalid + summaries.GUIDE.invalid
  if (invalidCount > 0) {
    console.log('\nRelease status: NOT READY')
    if (!dryRun) console.log('RELEASE ABORTED\nNo records were modified.')
    return
  }
  console.log('\nRelease status: READY')
  if (dryRun) return

  const ordered = [...summaries.PLACE.publishable, ...summaries.ROUTE.publishable, ...summaries.GUIDE.publishable]
  const published: string[] = []
  for (const item of ordered) {
    const table = item.type === 'PLACE' ? 'places' : item.type === 'ROUTE' ? 'routes' : 'guides'
    const { error } = await supabase.from(table).update({ status: 'published' }).eq('id', item.id)
    if (error) {
      console.error(`Release write error for ${item.type} ${item.slug}:`, error)
      const remaining = ordered.slice(published.length).map(pending => `${pending.type} ${pending.slug}`)
      console.error(`Already published: ${published.join(', ') || 'none'}`)
      console.error(`Remaining unchanged: ${remaining.join(', ') || 'none'}`)
      return
    }
    published.push(`${item.type} ${item.slug}`)
    report('PUBLISHED', item.type, item.slug, 'status updated to published')
  }
  console.log('\nRelease completed successfully.')
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
