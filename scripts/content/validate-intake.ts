import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const placeTypes = new Set(['attraction', 'restaurant', 'cafe', 'shopping', 'accommodation', 'transport', 'culture', 'nature', 'experience', 'other'])
const routeTypes = new Set(['walking', 'half_day', 'one_day', 'multi_day', 'food', 'shopping', 'culture', 'custom'])
const guideTypes = new Set(['arrival', 'transport', 'payment', 'sim', 'maps', 'language', 'etiquette', 'emergency', 'troubleshooting', 'general'])
const statuses = new Set(['draft', 'published', 'archived'])
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const batchArgument = () => {
  const index = process.argv.findIndex(argument => argument === '--batch' || argument.startsWith('--batch='))
  if (index < 0) throw new Error('Missing --batch=<directory>.')
  const argument = process.argv[index]!
  const value = argument === '--batch' ? process.argv[index + 1] : argument.slice('--batch='.length)
  if (!value || value.startsWith('--')) throw new Error('Missing path after --batch.')
  return resolve(value)
}
const csv = (contents: string) => {
  const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false
  for (let index = 0; index < contents.length; index += 1) { const character = contents[index]; const next = contents[index + 1]; if (character === '"' && quoted && next === '"') { field += '"'; index += 1 } else if (character === '"') quoted = !quoted; else if (character === ',' && !quoted) { row.push(field); field = '' } else if ((character === '\n' || character === '\r') && !quoted) { if (character === '\r' && next === '\n') index += 1; row.push(field); if (row.some(value => value.trim())) rows.push(row); row = []; field = '' } else field += character }
  if (quoted) throw new Error('CSV has an unterminated quoted field.')
  if (field || row.length) { row.push(field); if (row.some(value => value.trim())) rows.push(row) }
  return rows
}
const url = (value: unknown) => { if (value === undefined || value === null || value === '') return true; if (typeof value !== 'string') return false; try { const parsed = new URL(value); return parsed.protocol === 'http:' || parsed.protocol === 'https:' } catch { return false } }
const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const report = (kind: string, item: string, reason: string) => console.error(`INVALID ${kind}:\n${item || '(missing slug)'}\n${reason}`)

const main = async () => {
  const directory = batchArgument()
  const manifest = JSON.parse(await readFile(resolve(directory, 'batch.json'), 'utf8')) as Record<string, unknown>
  if (manifest.schema_version !== 1 || !slug.test(text(manifest.batch_id))) throw new Error('batch.json requires schema_version 1 and a valid batch_id.')
  const files = new Set(await readdir(directory))
  let failed = false
  const seen = new Set<string>()
  const validateSlug = (kind: string, value: string) => { if (!slug.test(value) || seen.has(value)) { report(kind, value, !slug.test(value) ? 'slug is required and must use lowercase letters, numbers, and hyphens' : 'duplicate slug inside batch'); failed = true; return false }; seen.add(value); return true }
  console.log(`Batch:\n${manifest.batch_id}\n`)
  if (files.has('places.csv')) {
    const rows = csv(await readFile(resolve(directory, 'places.csv'), 'utf8')); const headers = rows.shift() ?? []; const required = ['slug', 'place_type', 'name', 'status']; let valid = 0; let invalid = 0
    if (required.some(column => !headers.includes(column))) throw new Error(`places.csv is missing required columns: ${required.filter(column => !headers.includes(column)).join(', ')}`)
    for (const row of rows) { const item = Object.fromEntries(headers.map((header, index) => [header, row[index]?.trim() ?? ''])); const itemSlug = text(item.slug); const okay = validateSlug('PLACE', itemSlug) && placeTypes.has(text(item.place_type)) && statuses.has(text(item.status)) && Boolean(text(item.name)) && slug.test(text(item.area_slug)) && Boolean(text(item.source_name)) && url(item.source_url); if (!okay) { invalid += 1; report('PLACE', itemSlug, 'required fields, type, status, area_slug, source_name, or source_url are invalid') } else valid += 1 }
    console.log(`Places:\nValid: ${valid}\nInvalid: ${invalid}\n`)
  }
  for (const [file, kind] of [['routes.json', 'ROUTE'], ['guides.json', 'GUIDE']] as const) if (files.has(file)) {
    const entries = JSON.parse(await readFile(resolve(directory, file), 'utf8')) as unknown
    if (!Array.isArray(entries)) throw new Error(`${file} must contain an array.`)
    let valid = 0; let invalid = 0
    for (const entry of entries) { const item = entry && typeof entry === 'object' ? entry as Record<string, unknown> : {}; const itemSlug = text(item.slug); const route = kind === 'ROUTE'; const okay = validateSlug(kind, itemSlug) && statuses.has(text(item.status)) && Boolean(text(item.source_name)) && url(item.source_url) && (route ? routeTypes.has(text(item.route_type)) && Array.isArray(item.stops) && item.stops.length >= 2 && item.stops.every(stop => Boolean(text((stop as Record<string, unknown>).place_slug))) : guideTypes.has(text(item.guide_type)) && Boolean(text(item.title)) && Boolean(text(item.body_markdown)))
      if (!okay) { invalid += 1; report(kind, itemSlug, route ? 'required fields, route_type, status, source_url, or stops are invalid' : 'required fields, guide_type, status, source_url, title, or body_markdown are invalid') } else valid += 1
    }
    console.log(`${routeLabel(kind)}:\nValid: ${valid}\nInvalid: ${invalid}\n`)
  }
  console.log(failed ? 'INTAKE VALIDATION FAILED' : 'INTAKE VALIDATION PASSED')
  if (failed) process.exitCode = 1
}
const routeLabel = (kind: string) => kind === 'ROUTE' ? 'Routes' : 'Guides'
main().catch((error: unknown) => { console.error(error); process.exitCode = 1 })
