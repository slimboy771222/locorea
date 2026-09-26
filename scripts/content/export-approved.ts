import { access, mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database.types'
import { loadImportEnvironment } from '../lib/load-import-env'

type ExportFile = { relativePath: string; contents: string }
type ExportData = { files: ExportFile[]; places: number; routes: number; guides: number }

const dryRun = process.argv.includes('--dry-run')
const outputDirectory = resolve('data/content/approved')
const sortBySlug = <T extends { slug: string }>(items: T[]) => [...items].sort((left, right) => left.slug.localeCompare(right.slug, 'en'))
const english = <T extends { language_code: string }>(translations: T[]) => translations.find(translation => translation.language_code === 'en')
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
const displaySlug = (slug: string) => slug || '(missing slug)'
const safeFilename = (slug: string) => Boolean(slug) && !slug.includes('/') && !slug.includes('\\') && slug !== '.' && slug !== '..'
const tagSlugs = (relations: Array<{ tags: { slug: string } | null }>) => relations.flatMap(relation => relation.tags ? [relation.tags.slug] : []).sort((left, right) => left.localeCompare(right, 'en'))

const outputFile = (relativePath: string, value: unknown): ExportFile => ({ relativePath, contents: json(value) })

const validateAndBuild = async (supabase: ReturnType<typeof createClient<Database>>): Promise<ExportData> => {
  const [placesResult, routesResult, guidesResult] = await Promise.all([
    supabase.from('places').select('slug, place_type, status, review_status, reviewed_at, review_note, area_id, source_id, last_verified_at, foreigner_friendly, phone, website_url, naver_map_url, kakao_map_url, areas(slug), sources(name), place_translations(language_code, name, summary, description, address_text, local_tip), place_tags(tags(slug))').eq('review_status', 'approved'),
    supabase.from('routes').select('slug, route_type, status, review_status, reviewed_at, review_note, area_id, source_id, duration_minutes, distance_km, difficulty, last_verified_at, areas(slug), sources(name), route_translations(language_code, name, summary, description), route_places(stop_order, stay_minutes, travel_minutes_to_next, note, places(slug)), route_tags(tags(slug))').eq('review_status', 'approved'),
    supabase.from('guides').select('slug, guide_type, status, review_status, reviewed_at, review_note, source_id, last_verified_at, featured, sources(name), guide_translations(language_code, title, summary, body_markdown), guide_tags(tags(slug))').eq('review_status', 'approved'),
  ])
  const error = placesResult.error ?? routesResult.error ?? guidesResult.error
  if (error) {
    console.error('Approved content lookup error:', error)
    throw new Error('Could not load approved content for export.')
  }

  const places = sortBySlug(placesResult.data ?? [])
  const routes = sortBySlug(routesResult.data ?? [])
  const guides = sortBySlug(guidesResult.data ?? [])
  const errors: string[] = []
  const files: ExportFile[] = []

  for (const place of places) {
    const translation = english(place.place_translations)
    const failures = [
      !safeFilename(place.slug) && 'slug is missing or cannot be used as a filename',
      !translation && 'English translation is missing',
      !translation?.name.trim() && 'English name is missing',
      Boolean(place.area_id) && !place.areas?.slug && 'Area does not resolve to an area_slug',
      !place.source_id || !place.sources?.name ? 'Source does not resolve to a source_name' : false,
    ].filter(Boolean) as string[]
    if (failures.length) {
      errors.push(`INVALID PLACE: ${displaySlug(place.slug)} · ${failures.join('; ')}`)
      continue
    }

    files.push(outputFile(`places/${place.slug}.json`, {
      schema_version: 1,
      slug: place.slug,
      place_type: place.place_type,
      status: place.status,
      review_status: place.review_status,
      reviewed_at: place.reviewed_at,
      review_note: place.review_note,
      area_slug: place.areas?.slug ?? null,
      source_name: place.sources!.name,
      last_verified_at: place.last_verified_at,
      foreigner_friendly: place.foreigner_friendly,
      phone: place.phone,
      website_url: place.website_url,
      naver_map_url: place.naver_map_url,
      kakao_map_url: place.kakao_map_url,
      tag_slugs: tagSlugs(place.place_tags),
      translation: {
        language_code: 'en',
        name: translation!.name,
        summary: translation!.summary,
        description: translation!.description,
        address_text: translation!.address_text,
        local_tip: translation!.local_tip,
      },
    }))
  }

  for (const route of routes) {
    const translation = english(route.route_translations)
    const stops = [...route.route_places].sort((left, right) => left.stop_order - right.stop_order)
    const failures = [
      !safeFilename(route.slug) && 'slug is missing or cannot be used as a filename',
      !translation && 'English translation is missing',
      !translation?.name.trim() && 'English name is missing',
      !route.source_id || !route.sources?.name ? 'Source does not resolve to a source_name' : false,
      Boolean(route.area_id) && !route.areas?.slug && 'Area does not resolve to an area_slug',
      stops.length < 2 && 'at least 2 route stops are required',
      ...stops.filter(stop => !stop.places?.slug).map((_, index) => `stop ${index + 1} does not resolve to a place_slug`),
    ].filter(Boolean) as string[]
    if (failures.length) {
      errors.push(`INVALID ROUTE: ${displaySlug(route.slug)} · ${failures.join('; ')}`)
      continue
    }

    files.push(outputFile(`routes/${route.slug}.json`, {
      schema_version: 1,
      slug: route.slug,
      route_type: route.route_type,
      status: route.status,
      review_status: route.review_status,
      reviewed_at: route.reviewed_at,
      review_note: route.review_note,
      area_slug: route.areas?.slug ?? null,
      source_name: route.sources!.name,
      duration_minutes: route.duration_minutes,
      distance_km: route.distance_km,
      difficulty: route.difficulty,
      last_verified_at: route.last_verified_at,
      tag_slugs: tagSlugs(route.route_tags),
      translation: {
        language_code: 'en',
        name: translation!.name,
        summary: translation!.summary,
        description: translation!.description,
      },
      stops: stops.map(stop => ({
        place_slug: stop.places!.slug,
        stay_minutes: stop.stay_minutes,
        travel_minutes_to_next: stop.travel_minutes_to_next,
        note: stop.note,
      })),
    }))
  }

  for (const guide of guides) {
    const translation = english(guide.guide_translations)
    const failures = [
      !safeFilename(guide.slug) && 'slug is missing or cannot be used as a filename',
      !translation && 'English translation is missing',
      !translation?.title.trim() && 'English title is missing',
      !translation?.body_markdown?.trim() && 'English body_markdown is missing',
      !guide.source_id || !guide.sources?.name ? 'Source does not resolve to a source_name' : false,
    ].filter(Boolean) as string[]
    if (failures.length) {
      errors.push(`INVALID GUIDE: ${displaySlug(guide.slug)} · ${failures.join('; ')}`)
      continue
    }

    files.push(outputFile(`guides/${guide.slug}.json`, {
      schema_version: 1,
      slug: guide.slug,
      guide_type: guide.guide_type,
      status: guide.status,
      review_status: guide.review_status,
      reviewed_at: guide.reviewed_at,
      review_note: guide.review_note,
      source_name: guide.sources!.name,
      last_verified_at: guide.last_verified_at,
      featured: guide.featured,
      tag_slugs: tagSlugs(guide.guide_tags),
      translation: {
        language_code: 'en',
        title: translation!.title,
        summary: translation!.summary,
        body_markdown: translation!.body_markdown,
      },
    }))
  }

  if (errors.length) {
    for (const error of errors) console.error(error)
    console.error('\nEXPORT ABORTED\nNo canonical content files were modified.')
    throw new Error(`${errors.length} approved content record(s) failed validation.`)
  }

  for (const place of places) console.log(`APPROVED PLACE: ${place.slug}`)
  for (const route of routes) console.log(`APPROVED ROUTE: ${route.slug}`)
  for (const guide of guides) console.log(`APPROVED GUIDE: ${guide.slug}`)
  console.log(`\nTotals\nPlaces: ${places.length}\nRoutes: ${routes.length}\nGuides: ${guides.length}\n\nValidation: PASSED`)

  files.push(outputFile('manifest.json', {
    schema_version: 1,
    places: places.map(place => place.slug),
    routes: routes.map(route => route.slug),
    guides: guides.map(guide => guide.slug),
  }))

  return { files: files.sort((left, right) => left.relativePath.localeCompare(right.relativePath, 'en')), places: places.length, routes: routes.length, guides: guides.length }
}

const exists = async (path: string) => {
  try {
    await access(path)
    return true
  }
  catch {
    return false
  }
}

const writeExport = async (files: ExportFile[]) => {
  const outputParentDirectory = dirname(outputDirectory)
  await mkdir(outputParentDirectory, { recursive: true })
  const temporaryDirectory = await mkdtemp(join(outputParentDirectory, '.approved-export-'))
  const backupDirectory = `${outputDirectory}.backup-${process.pid}`
  let previousExportMoved = false

  try {
    for (const file of files) {
      const path = join(temporaryDirectory, file.relativePath)
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, file.contents, 'utf8')
    }

    if (await exists(outputDirectory)) {
      if (await exists(backupDirectory)) await rm(backupDirectory, { recursive: true, force: true })
      await rename(outputDirectory, backupDirectory)
      previousExportMoved = true
    }
    await rename(temporaryDirectory, outputDirectory)
    if (previousExportMoved) await rm(backupDirectory, { recursive: true, force: true })
  }
  catch (error) {
    if (previousExportMoved && !(await exists(outputDirectory)) && await exists(backupDirectory)) {
      await rename(backupDirectory, outputDirectory)
    }
    throw error
  }
  finally {
    if (await exists(temporaryDirectory)) await rm(temporaryDirectory, { recursive: true, force: true })
  }
}

const main = async () => {
  const { url, serviceRoleKey } = loadImportEnvironment()
  const supabase = createClient<Database>(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const exported = await validateAndBuild(supabase)

  if (dryRun) {
    console.log('\nDry run:\nNo files were written.')
    return
  }

  await writeExport(exported.files)
  console.log(`\nExport completed successfully.\nOutput directory: ${outputDirectory}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
