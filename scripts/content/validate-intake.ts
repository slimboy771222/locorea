import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { normalizeCsvHeaders, parseCsv } from '../lib/csv'

const placeTypes = new Set(['attraction', 'restaurant', 'cafe', 'shopping', 'accommodation', 'transport', 'culture', 'nature', 'experience', 'other'])
const routeTypes = new Set(['walking', 'half_day', 'one_day', 'multi_day', 'food', 'shopping', 'culture', 'custom'])
const guideTypes = new Set(['arrival', 'transport', 'payment', 'sim', 'maps', 'language', 'etiquette', 'emergency', 'troubleshooting', 'general'])
const statuses = new Set(['draft', 'published', 'archived'])
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const validUrl = (value: unknown) => { if (!text(value)) return true; try { const parsed = new URL(text(value)); return parsed.protocol === 'http:' || parsed.protocol === 'https:' } catch { return false } }
const invalid = (kind: string, position: string, slug: string, reason: string) => console.error(`INVALID ${kind}: ${position} · ${slug || '(missing slug)'} · ${reason}`)
const batchPath = () => { const index = process.argv.findIndex(item => item === '--batch' || item.startsWith('--batch=')); const flag = process.argv[index]; const value = flag === '--batch' ? process.argv[index + 1] : flag?.slice('--batch='.length); if (!value || value.startsWith('--')) throw new Error('Missing --batch=<directory>.'); return resolve(value) }

const main = async () => {
  const directory = batchPath()
  const manifest = JSON.parse(await readFile(resolve(directory, 'batch.json'), 'utf8')) as Record<string, unknown>
  if (manifest.schema_version !== 1 || !slugPattern.test(text(manifest.batch_id))) { console.error('INVALID FILE: batch.json\nschema_version must be 1 and batch_id must be a valid slug'); process.exitCode = 1; return }
  const files = new Set(await readdir(directory)); let failed = false
  console.log(`Batch:\n${manifest.batch_id}\n`)
  if (files.has('places.csv')) {
    const rows = parseCsv(await readFile(resolve(directory, 'places.csv'), 'utf8')); const headers = normalizeCsvHeaders(rows.shift() ?? []); const required = ['slug', 'place_type', 'name', 'status']; const missing = required.filter(column => !headers.includes(column)); let valid = 0; let invalidCount = 0
    if (missing.length) { console.error(`INVALID FILE: places.csv\nMissing columns: ${missing.join(', ')}\nDetected headers:\n${headers.join(', ')}`); failed = true }
    else { const seen = new Map<string, number>(); for (const [index, row] of rows.entries()) { const rowNumber = index + 2; const item = Object.fromEntries(headers.map((header, column) => [header, row[column]?.trim() ?? ''])); const itemSlug = text(item.slug); let reason = !slugPattern.test(itemSlug) ? 'slug is required and must use lowercase letters, numbers, and hyphens' : seen.has(itemSlug) ? `duplicate slug; first used on row ${seen.get(itemSlug)}` : !placeTypes.has(text(item.place_type)) ? 'unsupported place_type' : !statuses.has(text(item.status)) ? 'unsupported status' : !text(item.name) ? 'name is required' : !slugPattern.test(text(item.area_slug)) ? 'area_slug is required and must be a valid slug' : !text(item.source_name) ? 'source_name is required' : !validUrl(item.source_url) ? 'source_url must be a valid http:// or https:// URL' : ''; if (reason) { invalid('PLACE', `row ${rowNumber}`, itemSlug, reason); invalidCount += 1; failed = true } else valid += 1; if (itemSlug && !seen.has(itemSlug)) seen.set(itemSlug, rowNumber) } }
    console.log(`Places:\nValid: ${valid}\nInvalid: ${invalidCount}\n`)
  } else console.log('Places:\nNot provided\n')
  for (const [filename, kind] of [['routes.json', 'ROUTE'], ['guides.json', 'GUIDE']] as const) {
    if (!files.has(filename)) { console.log(`${kind === 'ROUTE' ? 'Routes' : 'Guides'}:\nNot provided\n`); continue }
    let entries: unknown; try { entries = JSON.parse(await readFile(resolve(directory, filename), 'utf8')) } catch { console.error(`INVALID FILE: ${filename}\nMust contain valid JSON.`); failed = true; continue }
    if (!Array.isArray(entries)) { console.error(`INVALID FILE: ${filename}\nMust contain a JSON array.`); failed = true; continue }
    const seen = new Map<string, number>(); let valid = 0; let invalidCount = 0
    for (const [index, entry] of entries.entries()) { const item = entry !== null && typeof entry === 'object' ? entry as Record<string, unknown> : {}; const itemSlug = text(item.slug); const stops = item.stops; let reason = !slugPattern.test(itemSlug) ? 'slug is required and must use lowercase letters, numbers, and hyphens' : seen.has(itemSlug) ? `duplicate slug; first used at item ${seen.get(itemSlug)}` : !statuses.has(text(item.status)) ? 'unsupported status' : !text(item.source_name) ? 'source_name is required' : !validUrl(item.source_url) ? 'source_url must be a valid http:// or https:// URL' : kind === 'ROUTE' && !routeTypes.has(text(item.route_type)) ? 'unsupported route_type' : kind === 'ROUTE' && (!Array.isArray(stops) || stops.length < 2) ? 'at least 2 stops are required' : kind === 'ROUTE' && stops.some(stop => !stop || typeof stop !== 'object' || !text((stop as Record<string, unknown>).place_slug)) ? 'every stop requires place_slug' : kind === 'GUIDE' && !guideTypes.has(text(item.guide_type)) ? 'unsupported guide_type' : kind === 'GUIDE' && !text(item.title) ? 'title is required' : kind === 'GUIDE' && !text(item.body_markdown) ? 'body_markdown is required' : ''; if (reason) { invalid(kind, `item ${index + 1}`, itemSlug, reason); invalidCount += 1; failed = true } else valid += 1; if (itemSlug && !seen.has(itemSlug)) seen.set(itemSlug, index + 1) }
    console.log(`${kind === 'ROUTE' ? 'Routes' : 'Guides'}:\nValid: ${valid}\nInvalid: ${invalidCount}\n`)
  }
  console.log(failed ? 'INTAKE VALIDATION FAILED' : 'INTAKE VALIDATION PASSED'); if (failed) process.exitCode = 1
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1 })
