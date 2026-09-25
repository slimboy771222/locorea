import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database.types'
import { loadImportEnvironment } from '../lib/load-import-env'

const inputPath = resolve('data/imports/places-seongsu.csv')
const dryRun = process.argv.includes('--dry-run')
const requiredColumns = ['slug', 'place_type', 'name', 'status']
const validPlaceTypes = new Set(['attraction', 'restaurant', 'cafe', 'shopping', 'accommodation', 'transport', 'culture', 'nature', 'experience', 'other'])
const validStatuses = new Set(['draft', 'published', 'archived'])

type CsvRow = Record<string, string>
type ValidatedRow = {
  rowNumber: number
  values: CsvRow
  areaId: string | null
  sourceId: string | null
  foreignerFriendly: boolean | null
}

const parseCsv = (contents: string): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index]
    const next = contents[index + 1]

    if (character === '"' && quoted && next === '"') {
      field += '"'
      index += 1
    }
    else if (character === '"') quoted = !quoted
    else if (character === ',' && !quoted) { row.push(field); field = '' }
    else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(field)
      if (row.some(value => value.trim())) rows.push(row)
      row = []; field = ''
    }
    else field += character
  }

  if (field || row.length) { row.push(field); if (row.some(value => value.trim())) rows.push(row) }
  return rows
}

const parseBoolean = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return { value: null, valid: true }
  if (['true', 'yes', '1'].includes(normalized)) return { value: true, valid: true }
  if (['false', 'no', '0'].includes(normalized)) return { value: false, valid: true }
  return { value: null, valid: false }
}

const nullable = (value: string) => value.trim() || null

const report = (state: 'VALID' | 'INVALID' | 'SKIPPED', rowNumber: number, slug: string, reason: string) => {
  console.log(`${state}: row ${rowNumber} · ${slug || '(missing slug)'} · ${reason}`)
}

const main = async () => {
  const { url, serviceRoleKey } = loadImportEnvironment()

  const csv = await readFile(inputPath, 'utf8')
  const records = parseCsv(csv)
  const headers = records.shift()?.map(header => header.trim()) ?? []
  const missingHeaders = requiredColumns.filter(column => !headers.includes(column))
  if (missingHeaders.length) throw new Error(`CSV is missing required columns: ${missingHeaders.join(', ')}`)

  const rows = records.map((values, index) => Object.fromEntries(headers.map((header, column) => [header, values[column] ?? ''])) as CsvRow & { rowNumber: number })
  const supabase = createClient<Database>(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const [areasResult, sourcesResult, existingResult] = await Promise.all([
    supabase.from('areas').select('id, slug'),
    supabase.from('sources').select('id, name'),
    supabase.from('places').select('slug').in('slug', rows.map(row => row.slug.trim()).filter(Boolean)),
  ])
  if (areasResult.error || sourcesResult.error || existingResult.error) {
    console.error('Lookup error', areasResult.error ?? sourcesResult.error ?? existingResult.error)
    throw new Error('Could not load existing Areas, Sources, or Places.')
  }

  const areas = new Map((areasResult.data ?? []).map(area => [area.slug, area.id]))
  const sources = new Map((sourcesResult.data ?? []).map(source => [source.name, source.id]))
  const existingSlugs = new Set((existingResult.data ?? []).map(place => place.slug))
  const valid: ValidatedRow[] = []
  let invalid = 0
  let skipped = 0

  for (const [index, values] of rows.entries()) {
    const rowNumber = index + 2
    const slug = values.slug.trim().toLowerCase()
    const placeType = values.place_type.trim().toLowerCase()
    const status = values.status.trim().toLowerCase()
    const boolean = parseBoolean(values.foreigner_friendly ?? '')
    const missing = requiredColumns.find(column => !values[column].trim())
    const validDate = !values.last_verified_at.trim() || !Number.isNaN(Date.parse(values.last_verified_at))

    if (missing) { invalid += 1; report('INVALID', rowNumber, slug, `missing required ${missing}`); continue }
    if (!validPlaceTypes.has(placeType)) { invalid += 1; report('INVALID', rowNumber, slug, 'unsupported place_type'); continue }
    if (!validStatuses.has(status)) { invalid += 1; report('INVALID', rowNumber, slug, 'unsupported status'); continue }
    if (!boolean.valid) { invalid += 1; report('INVALID', rowNumber, slug, 'invalid foreigner_friendly'); continue }
    if (!validDate) { invalid += 1; report('INVALID', rowNumber, slug, 'invalid last_verified_at'); continue }
    if (values.area_slug.trim() && !areas.has(values.area_slug.trim())) { invalid += 1; report('INVALID', rowNumber, slug, 'Area not found'); continue }
    if (values.source_name.trim() && !sources.has(values.source_name.trim())) { invalid += 1; report('INVALID', rowNumber, slug, 'Source not found'); continue }
    if (existingSlugs.has(slug)) { skipped += 1; report('SKIPPED', rowNumber, slug, 'slug already exists'); continue }

    valid.push({ rowNumber, values: { ...values, slug, place_type: placeType, status }, areaId: values.area_slug.trim() ? areas.get(values.area_slug.trim()) ?? null : null, sourceId: values.source_name.trim() ? sources.get(values.source_name.trim()) ?? null : null, foreignerFriendly: boolean.value })
    report('VALID', rowNumber, slug, dryRun ? 'would import' : 'ready to import')
  }

  if (!dryRun) {
    for (const row of valid) {
      const { values } = row
      const { data: place, error: placeError } = await supabase.from('places').insert({ slug: values.slug, place_type: values.place_type, status: values.status, area_id: row.areaId, source_id: row.sourceId, last_verified_at: nullable(values.last_verified_at), foreigner_friendly: row.foreignerFriendly, phone: nullable(values.phone), website_url: nullable(values.website_url), naver_map_url: nullable(values.naver_map_url), kakao_map_url: nullable(values.kakao_map_url) }).select('id').single()
      if (placeError || !place) { invalid += 1; console.error(`Database error for row ${row.rowNumber}`, placeError); report('INVALID', row.rowNumber, values.slug, 'Place insert failed'); continue }
      const { error: translationError } = await supabase.from('place_translations').insert({ place_id: place.id, language_code: 'en', name: values.name.trim(), summary: nullable(values.summary), description: nullable(values.description), address_text: nullable(values.address_text), local_tip: nullable(values.local_tip) })
      if (translationError) { invalid += 1; console.error(`Translation error for row ${row.rowNumber}`, translationError); report('INVALID', row.rowNumber, values.slug, 'partial failure: Place inserted, translation failed'); continue }
    }
  }

  console.log(`\nTotals\nValid: ${valid.length}\nInvalid: ${invalid}\nSkipped: ${skipped}`)
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1 })
