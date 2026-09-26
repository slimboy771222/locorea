import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database.types'
import { loadImportEnvironment } from '../lib/load-import-env'
import { inputFile } from '../lib/input-file'

const inputPath = inputFile('data/imports/routes-seongsu.json')
const dryRun = process.argv.includes('--dry-run')
const validRouteTypes = new Set(['walking', 'half_day', 'one_day', 'multi_day', 'food', 'shopping', 'culture', 'custom'])
const validDifficulties = new Set(['easy', 'normal', 'hard'])
const validStatuses = new Set(['draft', 'published', 'archived'])

type ImportStop = {
  place_slug?: unknown
  stay_minutes?: unknown
  travel_minutes_to_next?: unknown
  note?: unknown
}

type ImportRoute = {
  slug?: unknown
  route_type?: unknown
  name?: unknown
  summary?: unknown
  description?: unknown
  duration_minutes?: unknown
  distance_km?: unknown
  difficulty?: unknown
  status?: unknown
  area_slug?: unknown
  source_name?: unknown
  source_url?: unknown
  last_verified_at?: unknown
  stops?: unknown
}

type ValidatedRoute = {
  index: number
  slug: string
  routeType: string
  name: string
  summary: string | null
  description: string | null
  durationMinutes: number | null
  distanceKm: number | null
  difficulty: string | null
  status: string
  areaId: string | null
  sourceId: string | null
  sourceUrl: string | null
  lastVerifiedAt: string | null
  stops: Array<{
    placeId: string
    stayMinutes: number | null
    travelMinutesToNext: number | null
    note: string | null
  }>
}

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const nullableText = (value: unknown) => text(value) || null

const nullableNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return { value: null, valid: true }
  if (typeof value !== 'number' || !Number.isFinite(value)) return { value: null, valid: false }
  return { value, valid: true }
}

const nullableInteger = (value: unknown) => {
  const parsed = nullableNumber(value)
  return parsed.valid && parsed.value !== null && !Number.isInteger(parsed.value)
    ? { value: null, valid: false }
    : parsed
}

const isDate = (value: string) => !value || !Number.isNaN(Date.parse(value))
const isHttpUrl = (value: string) => {
  try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:' }
  catch { return false }
}

const report = (state: 'VALID' | 'INVALID' | 'SKIPPED' | 'IMPORTED', index: number, slug: string, reason: string) => {
  console.log(`${state}: route ${index + 1} · ${slug || '(missing slug)'} · ${reason}`)
}

const reportPartialFailure = (index: number, slug: string, routeId: string, reason: string) => {
  console.error(`PARTIAL FAILURE: route ${index + 1} · ${slug} · Route ID ${routeId} · ${reason}`)
}

const readRoutes = async (): Promise<ImportRoute[]> => {
  let contents: string
  try {
    contents = await readFile(inputPath, 'utf8')
  }
  catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`Route import file not found: ${inputPath}`)
    }
    throw error
  }

  const parsed: unknown = JSON.parse(contents)
  if (!Array.isArray(parsed)) throw new Error('Route import JSON must contain an array.')
  return parsed.filter((route): route is ImportRoute => route !== null && typeof route === 'object')
}

const main = async () => {
  const { url, serviceRoleKey } = loadImportEnvironment()

  const routes = await readRoutes()
  const supabase = createClient<Database>(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const routeSlugs = routes.map(route => text(route.slug).toLowerCase()).filter(Boolean)
  const stopSlugs = routes.flatMap(route => Array.isArray(route.stops)
    ? route.stops.map(stop => text((stop as ImportStop).place_slug).toLowerCase()).filter(Boolean)
    : [])

  const [areasResult, sourcesResult, existingResult, placesResult] = await Promise.all([
    supabase.from('areas').select('id, slug'),
    supabase.from('sources').select('id, name'),
    routeSlugs.length ? supabase.from('routes').select('slug').in('slug', routeSlugs) : Promise.resolve({ data: [], error: null }),
    stopSlugs.length ? supabase.from('places').select('id, slug').in('slug', stopSlugs) : Promise.resolve({ data: [], error: null }),
  ])

  const lookupError = areasResult.error ?? sourcesResult.error ?? existingResult.error ?? placesResult.error
  if (lookupError) {
    console.error('Route import lookup error:', lookupError)
    throw new Error('Could not load Areas, Sources, Routes, or Places for Route import.')
  }

  const areaIds = new Map((areasResult.data ?? []).map(area => [area.slug, area.id]))
  const sourceIds = new Map((sourcesResult.data ?? []).map(source => [source.name, source.id]))
  const existingSlugs = new Set((existingResult.data ?? []).map(route => route.slug))
  const placeIds = new Map((placesResult.data ?? []).map(place => [place.slug, place.id]))
  const valid: ValidatedRoute[] = []
  let invalid = 0
  let skipped = 0
  let imported = 0

  for (const [index, route] of routes.entries()) {
    const slug = text(route.slug).toLowerCase()
    const name = text(route.name)
    const routeType = text(route.route_type).toLowerCase()
    const status = text(route.status).toLowerCase()
    const difficulty = nullableText(route.difficulty)?.toLowerCase() ?? null
    const areaSlug = text(route.area_slug)
    const sourceName = text(route.source_name)
    const sourceUrl = nullableText(route.source_url)
    const lastVerifiedAt = nullableText(route.last_verified_at)
    const duration = nullableInteger(route.duration_minutes)
    const distance = nullableNumber(route.distance_km)
    const stops = Array.isArray(route.stops) ? route.stops : null

    if (!slug) { invalid += 1; report('INVALID', index, slug, 'missing slug'); continue }
    if (!name) { invalid += 1; report('INVALID', index, slug, 'missing name'); continue }
    if (!routeType || !validRouteTypes.has(routeType)) { invalid += 1; report('INVALID', index, slug, 'unsupported route_type'); continue }
    if (!status || !validStatuses.has(status)) { invalid += 1; report('INVALID', index, slug, 'unsupported status'); continue }
    if (difficulty && !validDifficulties.has(difficulty)) { invalid += 1; report('INVALID', index, slug, 'unsupported difficulty'); continue }
    if (!duration.valid) { invalid += 1; report('INVALID', index, slug, 'invalid duration_minutes'); continue }
    if (!distance.valid) { invalid += 1; report('INVALID', index, slug, 'invalid distance_km'); continue }
    if (!isDate(lastVerifiedAt ?? '')) { invalid += 1; report('INVALID', index, slug, 'invalid last_verified_at'); continue }
    if (sourceUrl && !isHttpUrl(sourceUrl)) { invalid += 1; report('INVALID', index, slug, 'invalid source_url'); continue }
    if (!stops || stops.length < 2) { invalid += 1; report('INVALID', index, slug, 'at least 2 stops are required'); continue }
    if (areaSlug && !areaIds.has(areaSlug)) { invalid += 1; report('INVALID', index, slug, 'Area not found'); continue }
    if (sourceName && !sourceIds.has(sourceName)) { invalid += 1; report('INVALID', index, slug, 'Source not found'); continue }
    if (existingSlugs.has(slug)) { skipped += 1; report('SKIPPED', index, slug, 'slug already exists'); continue }

    const resolvedStops: ValidatedRoute['stops'] = []
    let stopError: string | null = null
    for (const stop of stops) {
      if (!stop || typeof stop !== 'object') { stopError = 'invalid stop'; break }
      const values = stop as ImportStop
      const placeSlug = text(values.place_slug).toLowerCase()
      const stay = nullableInteger(values.stay_minutes)
      const travel = nullableInteger(values.travel_minutes_to_next)
      if (!placeSlug) { stopError = 'missing Place slug'; break }
      if (!placeIds.has(placeSlug)) { stopError = `Place not found: ${placeSlug}`; break }
      if (!stay.valid) { stopError = `invalid stay_minutes for ${placeSlug}`; break }
      if (!travel.valid) { stopError = `invalid travel_minutes_to_next for ${placeSlug}`; break }
      resolvedStops.push({ placeId: placeIds.get(placeSlug)!, stayMinutes: stay.value, travelMinutesToNext: travel.value, note: nullableText(values.note) })
    }
    if (stopError) { invalid += 1; report('INVALID', index, slug, stopError); continue }

    valid.push({ index, slug, routeType, name, summary: nullableText(route.summary), description: nullableText(route.description), durationMinutes: duration.value, distanceKm: distance.value, difficulty, status, areaId: areaSlug ? areaIds.get(areaSlug) ?? null : null, sourceId: sourceName ? sourceIds.get(sourceName) ?? null : null, sourceUrl, lastVerifiedAt, stops: resolvedStops })
    report('VALID', index, slug, dryRun ? 'would import' : 'ready to import')
  }

  if (!dryRun) {
    for (const route of valid) {
      const { data: createdRoute, error: routeError } = await supabase.from('routes').insert({ slug: route.slug, route_type: route.routeType, status: route.status, difficulty: route.difficulty, duration_minutes: route.durationMinutes, distance_km: route.distanceKm, area_id: route.areaId, source_id: route.sourceId, source_url: route.sourceUrl, last_verified_at: route.lastVerifiedAt }).select('id').single()
      if (routeError || !createdRoute) {
        invalid += 1
        console.error(`Route insert error for ${route.slug}:`, routeError)
        report('INVALID', route.index, route.slug, 'Route insert failed')
        continue
      }

      const { error: translationError } = await supabase.from('route_translations').insert({ route_id: createdRoute.id, language_code: 'en', name: route.name, summary: route.summary, description: route.description })
      if (translationError) {
        invalid += 1
        console.error(`Route translation error for ${route.slug}:`, translationError)
        reportPartialFailure(route.index, route.slug, createdRoute.id, 'Route inserted, translation failed')
        continue
      }

      const { error: stopsError } = await supabase.from('route_places').insert(route.stops.map((stop, offset) => ({ route_id: createdRoute.id, place_id: stop.placeId, stop_order: offset + 1, stay_minutes: stop.stayMinutes, travel_minutes_to_next: stop.travelMinutesToNext, note: stop.note })))
      if (stopsError) {
        invalid += 1
        console.error(`Route stops error for ${route.slug}:`, stopsError)
        reportPartialFailure(route.index, route.slug, createdRoute.id, 'Route and translation inserted, stops failed')
        continue
      }

      imported += 1
      report('IMPORTED', route.index, route.slug, 'Route, translation, and stops imported')
    }
  }

  console.log(`\nTotals\nValid: ${valid.length}\nInvalid: ${invalid}\nSkipped: ${skipped}\nImported: ${imported}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
