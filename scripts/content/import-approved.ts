import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database.types'
import { loadImportEnvironment } from '../lib/load-import-env'

const contentDirectory = resolve('data/content/approved')
const dryRun = process.argv.includes('--dry-run')
const sync = process.argv.includes('--sync')

const placeTypes = new Set(['attraction', 'restaurant', 'cafe', 'shopping', 'accommodation', 'transport', 'culture', 'nature', 'experience', 'other'])
const routeTypes = new Set(['walking', 'half_day', 'one_day', 'multi_day', 'food', 'shopping', 'culture', 'custom'])
const guideTypes = new Set(['arrival', 'transport', 'payment', 'sim', 'maps', 'language', 'etiquette', 'emergency', 'troubleshooting', 'general'])
const statuses = new Set(['draft', 'published', 'archived'])
const reviewStatuses = new Set(['unreviewed', 'in_review', 'needs_fix', 'approved'])
const difficulties = new Set(['easy', 'normal', 'hard'])

type JsonObject = Record<string, unknown>
type Manifest = { schemaVersion: 1; places: string[]; routes: string[]; guides: string[] }
type Translation = { name: string; summary: string | null; description: string | null; addressText?: string | null; localTip?: string | null; title?: string; bodyMarkdown?: string | null }
type Review = { reviewStatus: string; reviewedAt: string | null; reviewNote: string | null }
type Place = Review & { slug: string; placeType: string; status: string; areaSlug: string; sourceName: string; sourceUrl: string | null; lastVerifiedAt: string | null; foreignerFriendly: boolean | null; phone: string | null; websiteUrl: string | null; naverMapUrl: string | null; kakaoMapUrl: string | null; tagSlugs: string[]; translation: Translation }
type Stop = { placeSlug: string; stayMinutes: number | null; travelMinutesToNext: number | null; note: string | null }
type Route = Review & { slug: string; routeType: string; status: string; areaSlug: string | null; sourceName: string; sourceUrl: string | null; durationMinutes: number | null; distanceKm: number | null; difficulty: string | null; lastVerifiedAt: string | null; tagSlugs: string[]; translation: Translation; stops: Stop[] }
type Guide = Review & { slug: string; guideType: string; status: string; sourceName: string; sourceUrl: string | null; lastVerifiedAt: string | null; featured: boolean; tagSlugs: string[]; translation: Translation }
type Canonical = { manifest: Manifest; places: Place[]; routes: Route[]; guides: Guide[] }
type Existing = { places: Map<string, string>; routes: Map<string, string>; guides: Map<string, string> }
type Lookups = { areas: Map<string, string>; sources: Map<string, string>; tags: Map<string, string>; targetPlaces: Map<string, string> }

const asObject = (value: unknown): JsonObject | null => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : null
const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const nullableText = (value: unknown): string | null | undefined => value === null || value === undefined ? null : typeof value === 'string' ? value : undefined
const nullableNumber = (value: unknown): number | null | undefined => value === null || value === undefined ? null : typeof value === 'number' && Number.isFinite(value) ? value : undefined
const dateIsValid = (value: string | null) => value === null || !Number.isNaN(Date.parse(value))
const isHttpUrl = (value: string | null) => value === null || (() => { try { const url = new URL(value); return url.protocol === 'http:' || url.protocol === 'https:' } catch { return false } })()
const safeSlug = (value: string) => Boolean(value) && !value.includes('/') && !value.includes('\\') && value !== '.' && value !== '..'
const display = (slug: string) => slug || '(missing slug)'
const entityPath = (kind: 'places' | 'routes' | 'guides', slug: string) => resolve(contentDirectory, kind, `${slug}.json`)
const parseTagSlugs = (value: unknown, errors: string[]) => {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.some(slug => typeof slug !== 'string' || !safeSlug(slug))) { errors.push('tag_slugs must be an array of safe slugs'); return [] }
  const slugs = value as string[]
  if (new Set(slugs).size !== slugs.length) errors.push('tag_slugs contains duplicate slugs')
  return slugs
}

const readJson = async (path: string): Promise<unknown> => {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as unknown
  }
  catch (error) {
    throw new Error(`Could not read canonical content file ${path}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const manifestList = (value: unknown, name: string, errors: string[]) => {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !safeSlug(item))) {
    errors.push(`manifest.${name} must be an array of safe slugs`)
    return []
  }
  const slugs = value as string[]
  if (new Set(slugs).size !== slugs.length) errors.push(`manifest.${name} contains duplicate slugs`)
  return slugs
}

const parseManifest = (value: unknown): { manifest: Manifest | null; errors: string[] } => {
  const errors: string[] = []
  const raw = asObject(value)
  if (!raw) return { manifest: null, errors: ['manifest must be a JSON object'] }
  if (raw.schema_version !== 1) errors.push('manifest.schema_version must be 1')
  const places = manifestList(raw.places, 'places', errors)
  const routes = manifestList(raw.routes, 'routes', errors)
  const guides = manifestList(raw.guides, 'guides', errors)
  return { manifest: errors.length ? null : { schemaVersion: 1, places, routes, guides }, errors }
}

const review = (raw: JsonObject, errors: string[]): Review | null => {
  const reviewStatus = text(raw.review_status)
  const reviewedAt = nullableText(raw.reviewed_at)
  const reviewNote = nullableText(raw.review_note)
  if (!reviewStatuses.has(reviewStatus)) errors.push('unsupported review_status')
  if (reviewedAt === undefined || !dateIsValid(reviewedAt)) errors.push('invalid reviewed_at')
  if (reviewNote === undefined) errors.push('review_note must be a string or null')
  return errors.length ? null : { reviewStatus, reviewedAt: reviewedAt!, reviewNote: reviewNote! }
}

const common = (raw: JsonObject, expectedSlug: string, errors: string[]) => {
  if (raw.schema_version !== 1) errors.push('schema_version must be 1')
  const slug = text(raw.slug)
  if (!safeSlug(slug)) errors.push('invalid slug')
  if (slug !== expectedSlug) errors.push(`file slug does not match manifest slug (${expectedSlug})`)
  const status = text(raw.status)
  if (!statuses.has(status)) errors.push('unsupported status')
  const lastVerifiedAt = nullableText(raw.last_verified_at)
  if (lastVerifiedAt === undefined || !dateIsValid(lastVerifiedAt)) errors.push('invalid last_verified_at')
  return { slug, status, lastVerifiedAt: lastVerifiedAt as string | null }
}

const parsePlace = (value: unknown, expectedSlug: string): { item?: Place; errors: string[] } => {
  const errors: string[] = []
  const raw = asObject(value)
  if (!raw) return { errors: ['file must be a JSON object'] }
  const base = common(raw, expectedSlug, errors)
  const parsedReview = review(raw, errors)
  const placeType = text(raw.place_type)
  const areaSlug = text(raw.area_slug)
  const sourceName = text(raw.source_name)
  const sourceUrl = raw.source_url === undefined ? null : nullableText(raw.source_url)
  const foreignerFriendly = raw.foreigner_friendly === null || raw.foreigner_friendly === undefined ? null : typeof raw.foreigner_friendly === 'boolean' ? raw.foreigner_friendly : undefined
  const phone = nullableText(raw.phone)
  const websiteUrl = nullableText(raw.website_url)
  const naverMapUrl = nullableText(raw.naver_map_url)
  const kakaoMapUrl = nullableText(raw.kakao_map_url)
  const translation = asObject(raw.translation)
  if (!placeTypes.has(placeType)) errors.push('unsupported place_type')
  if (!areaSlug) errors.push('missing area_slug')
  if (!sourceName) errors.push('missing source_name')
  if (sourceUrl === undefined || !isHttpUrl(sourceUrl)) errors.push('invalid source_url')
  if (foreignerFriendly === undefined) errors.push('foreigner_friendly must be boolean or null')
  if ([phone, websiteUrl, naverMapUrl, kakaoMapUrl].some(item => item === undefined)) errors.push('optional Place text fields must be strings or null')
  if (!translation || text(translation.language_code) !== 'en' || !text(translation.name)) errors.push('English translation name is required')
  const summary = translation ? nullableText(translation.summary) : undefined
  const description = translation ? nullableText(translation.description) : undefined
  const addressText = translation ? nullableText(translation.address_text) : undefined
  const localTip = translation ? nullableText(translation.local_tip) : undefined
  const tagSlugs = parseTagSlugs(raw.tag_slugs, errors)
  if ([summary, description, addressText, localTip].some(item => item === undefined)) errors.push('Place translation fields must be strings or null')
  if (errors.length || !parsedReview || !translation) return { errors }
  return { item: { ...parsedReview, ...base, placeType, areaSlug, sourceName, sourceUrl: sourceUrl!, foreignerFriendly: foreignerFriendly!, phone: phone!, websiteUrl: websiteUrl!, naverMapUrl: naverMapUrl!, kakaoMapUrl: kakaoMapUrl!, tagSlugs, translation: { name: text(translation.name), summary: summary!, description: description!, addressText: addressText!, localTip: localTip! } }, errors }
}

const parseRoute = (value: unknown, expectedSlug: string): { item?: Route; errors: string[] } => {
  const errors: string[] = []
  const raw = asObject(value)
  if (!raw) return { errors: ['file must be a JSON object'] }
  const base = common(raw, expectedSlug, errors)
  const parsedReview = review(raw, errors)
  const routeType = text(raw.route_type)
  const areaSlug = nullableText(raw.area_slug)
  const sourceName = text(raw.source_name)
  const sourceUrl = raw.source_url === undefined ? null : nullableText(raw.source_url)
  const durationMinutes = nullableNumber(raw.duration_minutes)
  const distanceKm = nullableNumber(raw.distance_km)
  const difficulty = raw.difficulty === null || raw.difficulty === undefined ? null : text(raw.difficulty)
  const translation = asObject(raw.translation)
  if (!routeTypes.has(routeType)) errors.push('unsupported route_type')
  if (areaSlug === undefined) errors.push('area_slug must be a string or null')
  if (!sourceName) errors.push('missing source_name')
  if (sourceUrl === undefined || !isHttpUrl(sourceUrl)) errors.push('invalid source_url')
  if (durationMinutes === undefined || (durationMinutes !== null && !Number.isInteger(durationMinutes))) errors.push('invalid duration_minutes')
  if (distanceKm === undefined) errors.push('invalid distance_km')
  if (difficulty !== null && !difficulties.has(difficulty)) errors.push('unsupported difficulty')
  if (!translation || text(translation.language_code) !== 'en' || !text(translation.name)) errors.push('English translation name is required')
  const summary = translation ? nullableText(translation.summary) : undefined
  const description = translation ? nullableText(translation.description) : undefined
  const tagSlugs = parseTagSlugs(raw.tag_slugs, errors)
  if ([summary, description].some(item => item === undefined)) errors.push('Route translation fields must be strings or null')
  const stops: Stop[] = []
  if (!Array.isArray(raw.stops) || raw.stops.length < 2) errors.push('at least 2 stops are required')
  else raw.stops.forEach((stop, index) => {
    const item = asObject(stop)
    const placeSlug = item ? text(item.place_slug) : ''
    const stayMinutes = item ? nullableNumber(item.stay_minutes) : undefined
    const travelMinutesToNext = item ? nullableNumber(item.travel_minutes_to_next) : undefined
    const note = item ? nullableText(item.note) : undefined
    if (!item || !safeSlug(placeSlug)) errors.push(`invalid stop ${index + 1} place_slug`)
    if (stayMinutes === undefined || (stayMinutes !== null && !Number.isInteger(stayMinutes))) errors.push(`invalid stop ${index + 1} stay_minutes`)
    if (travelMinutesToNext === undefined || (travelMinutesToNext !== null && !Number.isInteger(travelMinutesToNext))) errors.push(`invalid stop ${index + 1} travel_minutes_to_next`)
    if (note === undefined) errors.push(`invalid stop ${index + 1} note`)
    if (item && safeSlug(placeSlug) && stayMinutes !== undefined && travelMinutesToNext !== undefined && note !== undefined) stops.push({ placeSlug, stayMinutes, travelMinutesToNext, note })
  })
  if (errors.length || !parsedReview || !translation) return { errors }
  return { item: { ...parsedReview, ...base, routeType, areaSlug: areaSlug!, sourceName, sourceUrl: sourceUrl!, durationMinutes: durationMinutes!, distanceKm: distanceKm!, difficulty, tagSlugs, translation: { name: text(translation.name), summary: summary!, description: description! }, stops }, errors }
}

const parseGuide = (value: unknown, expectedSlug: string): { item?: Guide; errors: string[] } => {
  const errors: string[] = []
  const raw = asObject(value)
  if (!raw) return { errors: ['file must be a JSON object'] }
  const base = common(raw, expectedSlug, errors)
  const parsedReview = review(raw, errors)
  const guideType = text(raw.guide_type)
  const sourceName = text(raw.source_name)
  const sourceUrl = raw.source_url === undefined ? null : nullableText(raw.source_url)
  const translation = asObject(raw.translation)
  if (!guideTypes.has(guideType)) errors.push('unsupported guide_type')
  if (!sourceName) errors.push('missing source_name')
  if (sourceUrl === undefined || !isHttpUrl(sourceUrl)) errors.push('invalid source_url')
  if (typeof raw.featured !== 'boolean') errors.push('featured must be boolean')
  if (!translation || text(translation.language_code) !== 'en' || !text(translation.title) || !text(translation.body_markdown)) errors.push('English translation title and body_markdown are required')
  const summary = translation ? nullableText(translation.summary) : undefined
  const tagSlugs = parseTagSlugs(raw.tag_slugs, errors)
  if (summary === undefined) errors.push('Guide translation summary must be a string or null')
  if (errors.length || !parsedReview || !translation) return { errors }
  return { item: { ...parsedReview, ...base, guideType, sourceName, sourceUrl: sourceUrl!, featured: raw.featured as boolean, tagSlugs, translation: { name: '', title: text(translation.title), summary: summary!, bodyMarkdown: text(translation.body_markdown) } }, errors }
}

const loadCanonical = async (): Promise<{ canonical?: Canonical; errors: string[] }> => {
  const parsedManifest = parseManifest(await readJson(resolve(contentDirectory, 'manifest.json')))
  if (!parsedManifest.manifest) return { errors: parsedManifest.errors }
  const manifest = parsedManifest.manifest
  const errors: string[] = []
  const places: Place[] = []
  const routes: Route[] = []
  const guides: Guide[] = []
  for (const slug of manifest.places) { const result = parsePlace(await readJson(entityPath('places', slug)), slug); if (result.item) places.push(result.item); else errors.push(`INVALID PLACE: ${display(slug)} · ${result.errors.join('; ')}`) }
  for (const slug of manifest.routes) { const result = parseRoute(await readJson(entityPath('routes', slug)), slug); if (result.item) routes.push(result.item); else errors.push(`INVALID ROUTE: ${display(slug)} · ${result.errors.join('; ')}`) }
  for (const slug of manifest.guides) { const result = parseGuide(await readJson(entityPath('guides', slug)), slug); if (result.item) guides.push(result.item); else errors.push(`INVALID GUIDE: ${display(slug)} · ${result.errors.join('; ')}`) }
  return errors.length ? { errors } : { canonical: { manifest, places, routes, guides }, errors: [] }
}

const failLookup = (label: string, error: unknown): never => { console.error(`${label}:`, error); throw new Error(`Could not load ${label.toLowerCase()}.`) }

const preflight = async (supabase: ReturnType<typeof createClient<Database>>, canonical: Canonical): Promise<{ lookups: Lookups; existing: Existing; errors: string[] }> => {
  const areaSlugs = [...new Set([...canonical.places.map(item => item.areaSlug), ...canonical.routes.map(item => item.areaSlug).filter((slug): slug is string => Boolean(slug))])]
  const sourceNames = [...new Set([...canonical.places, ...canonical.routes, ...canonical.guides].map(item => item.sourceName))]
  const tagSlugs = [...new Set([...canonical.places, ...canonical.routes, ...canonical.guides].flatMap(item => item.tagSlugs))]
  const entityPlaceSlugs = canonical.places.map(item => item.slug)
  const routeStopSlugs = canonical.routes.flatMap(item => item.stops.map(stop => stop.placeSlug))
  const [areasResult, sourcesResult, tagsResult, targetPlacesResult, existingPlacesResult, existingRoutesResult, existingGuidesResult] = await Promise.all([
    areaSlugs.length ? supabase.from('areas').select('id, slug').in('slug', areaSlugs) : Promise.resolve({ data: [], error: null }),
    sourceNames.length ? supabase.from('sources').select('id, name').in('name', sourceNames) : Promise.resolve({ data: [], error: null }),
    tagSlugs.length ? supabase.from('tags').select('id, slug').in('slug', tagSlugs) : Promise.resolve({ data: [], error: null }),
    [...new Set([...entityPlaceSlugs, ...routeStopSlugs])].length ? supabase.from('places').select('id, slug').in('slug', [...new Set([...entityPlaceSlugs, ...routeStopSlugs])]) : Promise.resolve({ data: [], error: null }),
    entityPlaceSlugs.length ? supabase.from('places').select('id, slug').in('slug', entityPlaceSlugs) : Promise.resolve({ data: [], error: null }),
    canonical.routes.length ? supabase.from('routes').select('id, slug').in('slug', canonical.routes.map(item => item.slug)) : Promise.resolve({ data: [], error: null }),
    canonical.guides.length ? supabase.from('guides').select('id, slug').in('slug', canonical.guides.map(item => item.slug)) : Promise.resolve({ data: [], error: null }),
  ])
  const lookupError = areasResult.error ?? sourcesResult.error ?? tagsResult.error ?? targetPlacesResult.error ?? existingPlacesResult.error ?? existingRoutesResult.error ?? existingGuidesResult.error
  if (lookupError) failLookup('Canonical import lookup error', lookupError)
  const lookups: Lookups = {
    areas: new Map((areasResult.data ?? []).map(row => [row.slug, row.id])),
    sources: new Map((sourcesResult.data ?? []).map(row => [row.name, row.id])),
    tags: new Map((tagsResult.data ?? []).map(row => [row.slug, row.id])),
    targetPlaces: new Map((targetPlacesResult.data ?? []).map(row => [row.slug, row.id])),
  }
  const existing: Existing = {
    places: new Map((existingPlacesResult.data ?? []).map(row => [row.slug, row.id])),
    routes: new Map((existingRoutesResult.data ?? []).map(row => [row.slug, row.id])),
    guides: new Map((existingGuidesResult.data ?? []).map(row => [row.slug, row.id])),
  }
  const errors: string[] = []
  for (const place of canonical.places) {
    if (!lookups.areas.has(place.areaSlug)) errors.push(`INVALID PLACE: ${place.slug} · Area not found: ${place.areaSlug}`)
    if (!lookups.sources.has(place.sourceName)) errors.push(`INVALID PLACE: ${place.slug} · Source not found: ${place.sourceName}`)
    for (const tagSlug of place.tagSlugs) if (!lookups.tags.has(tagSlug)) errors.push(`INVALID PLACE: ${place.slug} · Tag not found: ${tagSlug}`)
  }
  for (const route of canonical.routes) {
    if (route.areaSlug && !lookups.areas.has(route.areaSlug)) errors.push(`INVALID ROUTE: ${route.slug} · Area not found: ${route.areaSlug}`)
    if (!lookups.sources.has(route.sourceName)) errors.push(`INVALID ROUTE: ${route.slug} · Source not found: ${route.sourceName}`)
    for (const tagSlug of route.tagSlugs) if (!lookups.tags.has(tagSlug)) errors.push(`INVALID ROUTE: ${route.slug} · Tag not found: ${tagSlug}`)
    for (const stop of route.stops) if (!lookups.targetPlaces.has(stop.placeSlug) && !canonical.manifest.places.includes(stop.placeSlug)) errors.push(`INVALID ROUTE: ${route.slug} · Place not found: ${stop.placeSlug}`)
  }
  for (const guide of canonical.guides) {
    if (!lookups.sources.has(guide.sourceName)) errors.push(`INVALID GUIDE: ${guide.slug} · Source not found: ${guide.sourceName}`)
    for (const tagSlug of guide.tagSlugs) if (!lookups.tags.has(tagSlug)) errors.push(`INVALID GUIDE: ${guide.slug} · Tag not found: ${tagSlug}`)
  }
  return { lookups, existing, errors }
}

const placePayload = (item: Place, lookups: Lookups) => ({ slug: item.slug, place_type: item.placeType, status: item.status, review_status: item.reviewStatus, reviewed_at: item.reviewedAt, reviewed_by: null, review_note: item.reviewNote, area_id: lookups.areas.get(item.areaSlug)!, source_id: lookups.sources.get(item.sourceName)!, source_url: item.sourceUrl, last_verified_at: item.lastVerifiedAt, foreigner_friendly: item.foreignerFriendly, phone: item.phone, website_url: item.websiteUrl, naver_map_url: item.naverMapUrl, kakao_map_url: item.kakaoMapUrl })
const routePayload = (item: Route, lookups: Lookups) => ({ slug: item.slug, route_type: item.routeType, status: item.status, review_status: item.reviewStatus, reviewed_at: item.reviewedAt, reviewed_by: null, review_note: item.reviewNote, area_id: item.areaSlug ? lookups.areas.get(item.areaSlug)! : null, source_id: lookups.sources.get(item.sourceName)!, source_url: item.sourceUrl, duration_minutes: item.durationMinutes, distance_km: item.distanceKm, difficulty: item.difficulty, last_verified_at: item.lastVerifiedAt })
const guidePayload = (item: Guide, lookups: Lookups) => ({ slug: item.slug, guide_type: item.guideType, status: item.status, review_status: item.reviewStatus, reviewed_at: item.reviewedAt, reviewed_by: null, review_note: item.reviewNote, source_id: lookups.sources.get(item.sourceName)!, source_url: item.sourceUrl, last_verified_at: item.lastVerifiedAt, featured: item.featured })

type Totals = { created: number; updated: number; skipped: number }
const totals = (): Totals => ({ created: 0, updated: 0, skipped: 0 })
const action = (state: 'CREATED' | 'UPDATED' | 'SKIPPED', kind: string, slug: string) => console.log(`${state}: ${kind} · ${slug}${state === 'SKIPPED' ? ' · slug already exists' : ''}`)

const writeTags = async (
  supabase: ReturnType<typeof createClient<Database>>,
  table: 'place_tags' | 'route_tags' | 'guide_tags',
  entityColumn: 'place_id' | 'route_id' | 'guide_id',
  entityId: string,
  tagSlugs: string[],
  lookups: Lookups,
  replace: boolean,
  slug: string,
) => {
  if (replace) {
    const { error } = await supabase.from(table).delete().eq(entityColumn, entityId)
    if (error) throwWrite('Tag replacement', slug, error)
  }
  if (!tagSlugs.length) return
  const rows = tagSlugs.map(tagSlug => ({ [entityColumn]: entityId, tag_id: lookups.tags.get(tagSlug)! }))
  const { error } = await supabase.from(table).insert(rows)
  if (error) throwWrite('Tag write', slug, error)
}

const importPlaces = async (supabase: ReturnType<typeof createClient<Database>>, items: Place[], lookups: Lookups, existing: Map<string, string>, result: Totals) => {
  for (const item of items) {
    let id = existing.get(item.slug)
    const existed = Boolean(id)
    if (id && !sync) { result.skipped += 1; action('SKIPPED', 'PLACE', item.slug); continue }
    if (id) {
      const { error } = await supabase.from('places').update(placePayload(item, lookups)).eq('id', id)
      if (error) throwWrite('Place update', item.slug, error)
      result.updated += 1
    }
    else {
      const { data, error } = await supabase.from('places').insert(placePayload(item, lookups)).select('id').single()
      if (error || !data) throwWrite('Place insert', item.slug, error)
      id = data.id; existing.set(item.slug, id); lookups.targetPlaces.set(item.slug, id); result.created += 1
    }
    const { error: translationError } = await supabase.from('place_translations').upsert({ place_id: id!, language_code: 'en', name: item.translation.name, summary: item.translation.summary, description: item.translation.description, address_text: item.translation.addressText!, local_tip: item.translation.localTip! }, { onConflict: 'place_id,language_code' })
    if (translationError) throwWrite('Place translation write', item.slug, translationError)
    await writeTags(supabase, 'place_tags', 'place_id', id!, item.tagSlugs, lookups, existed, item.slug)
    action(existed ? 'UPDATED' : 'CREATED', 'PLACE', item.slug)
  }
}

const importRoutes = async (supabase: ReturnType<typeof createClient<Database>>, items: Route[], lookups: Lookups, existing: Map<string, string>, result: Totals) => {
  for (const item of items) {
    let id = existing.get(item.slug)
    const existed = Boolean(id)
    if (id && !sync) { result.skipped += 1; action('SKIPPED', 'ROUTE', item.slug); continue }
    if (id) {
      const { error } = await supabase.from('routes').update(routePayload(item, lookups)).eq('id', id)
      if (error) throwWrite('Route update', item.slug, error)
      result.updated += 1
    }
    else {
      const { data, error } = await supabase.from('routes').insert(routePayload(item, lookups)).select('id').single()
      if (error || !data) throwWrite('Route insert', item.slug, error)
      id = data.id; existing.set(item.slug, id); result.created += 1
    }
    const { error: translationError } = await supabase.from('route_translations').upsert({ route_id: id!, language_code: 'en', name: item.translation.name, summary: item.translation.summary, description: item.translation.description }, { onConflict: 'route_id,language_code' })
    if (translationError) throwWrite('Route translation write', item.slug, translationError)
    if (existed) {
      const { error } = await supabase.from('route_places').delete().eq('route_id', id!)
      if (error) throwWrite('Route stops replacement', item.slug, error)
    }
    const stops = item.stops.map((stop, index) => ({ route_id: id!, place_id: lookups.targetPlaces.get(stop.placeSlug)!, stop_order: index + 1, stay_minutes: stop.stayMinutes, travel_minutes_to_next: stop.travelMinutesToNext, note: stop.note }))
    const { error: stopsError } = await supabase.from('route_places').insert(stops)
    if (stopsError) throwWrite('Route stops write', item.slug, stopsError)
    await writeTags(supabase, 'route_tags', 'route_id', id!, item.tagSlugs, lookups, existed, item.slug)
    action(existed ? 'UPDATED' : 'CREATED', 'ROUTE', item.slug)
  }
}

const importGuides = async (supabase: ReturnType<typeof createClient<Database>>, items: Guide[], lookups: Lookups, existing: Map<string, string>, result: Totals) => {
  for (const item of items) {
    let id = existing.get(item.slug)
    const existed = Boolean(id)
    if (id && !sync) { result.skipped += 1; action('SKIPPED', 'GUIDE', item.slug); continue }
    if (id) {
      const { error } = await supabase.from('guides').update(guidePayload(item, lookups)).eq('id', id)
      if (error) throwWrite('Guide update', item.slug, error)
      result.updated += 1
    }
    else {
      const { data, error } = await supabase.from('guides').insert(guidePayload(item, lookups)).select('id').single()
      if (error || !data) throwWrite('Guide insert', item.slug, error)
      id = data.id; existing.set(item.slug, id); result.created += 1
    }
    const { error: translationError } = await supabase.from('guide_translations').upsert({ guide_id: id!, language_code: 'en', title: item.translation.title!, summary: item.translation.summary, body_markdown: item.translation.bodyMarkdown! }, { onConflict: 'guide_id,language_code' })
    if (translationError) throwWrite('Guide translation write', item.slug, translationError)
    await writeTags(supabase, 'guide_tags', 'guide_id', id!, item.tagSlugs, lookups, existed, item.slug)
    action(existed ? 'UPDATED' : 'CREATED', 'GUIDE', item.slug)
  }
}

const throwWrite = (operation: string, slug: string, error: unknown): never => { console.error(`${operation} error for ${slug}:`, error); throw new Error(`${operation} failed for ${slug}. Import stopped; re-run safely after resolving the error.`) }
const printTotals = (places: Totals, routes: Totals, guides: Totals) => console.log(`\nTotals\nPlaces — Created: ${places.created}, Updated: ${places.updated}, Skipped: ${places.skipped}\nRoutes — Created: ${routes.created}, Updated: ${routes.updated}, Skipped: ${routes.skipped}\nGuides — Created: ${guides.created}, Updated: ${guides.updated}, Skipped: ${guides.skipped}`)

const main = async () => {
  const { url, serviceRoleKey } = loadImportEnvironment()
  const loaded = await loadCanonical()
  if (!loaded.canonical) {
    for (const error of loaded.errors) console.error(error)
    console.error('\nIMPORT ABORTED\nNo content records were modified.')
    process.exitCode = 1
    return
  }
  const supabase = createClient<Database>(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const checked = await preflight(supabase, loaded.canonical)
  if (checked.errors.length) {
    for (const error of checked.errors) console.error(error)
    console.error('\nIMPORT ABORTED\nNo content records were modified.')
    process.exitCode = 1
    return
  }
  const placeTotals = totals(); const routeTotals = totals(); const guideTotals = totals()
  if (dryRun) {
    for (const item of loaded.canonical.places) { const exists = checked.existing.places.has(item.slug); if (exists && !sync) { placeTotals.skipped += 1; action('SKIPPED', 'PLACE', item.slug) } else { placeTotals[exists ? 'updated' : 'created'] += 1; action(exists ? 'UPDATED' : 'CREATED', 'PLACE', item.slug) } }
    for (const item of loaded.canonical.routes) { const exists = checked.existing.routes.has(item.slug); if (exists && !sync) { routeTotals.skipped += 1; action('SKIPPED', 'ROUTE', item.slug) } else { routeTotals[exists ? 'updated' : 'created'] += 1; action(exists ? 'UPDATED' : 'CREATED', 'ROUTE', item.slug) } }
    for (const item of loaded.canonical.guides) { const exists = checked.existing.guides.has(item.slug); if (exists && !sync) { guideTotals.skipped += 1; action('SKIPPED', 'GUIDE', item.slug) } else { guideTotals[exists ? 'updated' : 'created'] += 1; action(exists ? 'UPDATED' : 'CREATED', 'GUIDE', item.slug) } }
    printTotals(placeTotals, routeTotals, guideTotals)
    console.log('\nDry run:\nNo content records were modified.')
    return
  }
  try {
    await importPlaces(supabase, loaded.canonical.places, checked.lookups, checked.existing.places, placeTotals)
    await importRoutes(supabase, loaded.canonical.routes, checked.lookups, checked.existing.routes, routeTotals)
    await importGuides(supabase, loaded.canonical.guides, checked.lookups, checked.existing.guides, guideTotals)
    printTotals(placeTotals, routeTotals, guideTotals)
  }
  catch (error) {
    printTotals(placeTotals, routeTotals, guideTotals)
    console.error('\nIMPORT STOPPED\nCompleted records are listed above. Remaining canonical records were not processed.')
    throw error
  }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1 })
