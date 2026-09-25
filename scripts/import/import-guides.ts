import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database.types'

const inputPath = resolve('data/imports/guides-seongsu.json')
const dryRun = process.argv.includes('--dry-run')
const validGuideTypes = new Set(['arrival', 'transport', 'payment', 'sim', 'maps', 'language', 'etiquette', 'emergency', 'troubleshooting', 'general'])
const validStatuses = new Set(['draft', 'published', 'archived'])

type ImportGuide = {
  slug?: unknown
  guide_type?: unknown
  title?: unknown
  summary?: unknown
  body_markdown?: unknown
  status?: unknown
  featured?: unknown
  source_name?: unknown
  last_verified_at?: unknown
}

type ValidatedGuide = {
  index: number
  slug: string
  guideType: string
  title: string
  summary: string | null
  bodyMarkdown: string | null
  status: string
  featured: boolean
  sourceId: string | null
  lastVerifiedAt: string | null
}

const loadEnvironment = () => {
  try {
    process.loadEnvFile(resolve('.env'))
  }
  catch (error: unknown) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error
  }
}

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const nullableText = (value: unknown) => text(value) || null
const isDate = (value: string) => !value || !Number.isNaN(Date.parse(value))

const report = (state: 'VALID' | 'INVALID' | 'SKIPPED' | 'IMPORTED', index: number, slug: string, reason: string) => {
  console.log(`${state}: guide ${index + 1} · ${slug || '(missing slug)'} · ${reason}`)
}

const reportPartialFailure = (index: number, slug: string, guideId: string) => {
  console.error(`PARTIAL FAILURE: guide ${index + 1} · ${slug} · Guide ID ${guideId} · Guide inserted, translation failed`)
}

const readGuides = async (): Promise<ImportGuide[]> => {
  let contents: string
  try {
    contents = await readFile(inputPath, 'utf8')
  }
  catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`Guide import file not found: ${inputPath}`)
    }
    throw error
  }

  const parsed: unknown = JSON.parse(contents)
  if (!Array.isArray(parsed)) throw new Error('Guide import JSON must contain an array.')
  return parsed.map(item => item !== null && typeof item === 'object' ? item as ImportGuide : {})
}

const main = async () => {
  loadEnvironment()
  const url = process.env.LOCOREA_IMPORT_SUPABASE_URL ?? process.env.NUXT_PUBLIC_SUPABASE_URL
  const key = process.env.LOCOREA_IMPORT_SERVICE_ROLE_KEY

  if (!key) {
    throw new Error('Missing LOCOREA_IMPORT_SERVICE_ROLE_KEY. Bulk imports require the local server-side import credential.')
  }
  if (!url) throw new Error('Missing LOCOREA_IMPORT_SUPABASE_URL or NUXT_PUBLIC_SUPABASE_URL.')

  const guides = await readGuides()
  const supabase = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const guideSlugs = guides.map(guide => text(guide.slug).toLowerCase()).filter(Boolean)
  const [sourcesResult, existingResult] = await Promise.all([
    supabase.from('sources').select('id, name'),
    guideSlugs.length ? supabase.from('guides').select('slug').in('slug', guideSlugs) : Promise.resolve({ data: [], error: null }),
  ])

  const lookupError = sourcesResult.error ?? existingResult.error
  if (lookupError) {
    console.error('Guide import lookup error:', lookupError)
    throw new Error('Could not load Sources or existing Guides for Guide import.')
  }

  const sourceIds = new Map((sourcesResult.data ?? []).map(source => [source.name, source.id]))
  const existingSlugs = new Set((existingResult.data ?? []).map(guide => guide.slug))
  const valid: ValidatedGuide[] = []
  let invalid = 0
  let skipped = 0
  let imported = 0

  for (const [index, guide] of guides.entries()) {
    const slug = text(guide.slug).toLowerCase()
    const guideType = text(guide.guide_type).toLowerCase()
    const title = text(guide.title)
    const status = text(guide.status).toLowerCase()
    const sourceName = text(guide.source_name)
    const lastVerifiedAt = nullableText(guide.last_verified_at)

    if (!slug) { invalid += 1; report('INVALID', index, slug, 'missing slug'); continue }
    if (!title) { invalid += 1; report('INVALID', index, slug, 'missing title'); continue }
    if (!guideType || !validGuideTypes.has(guideType)) { invalid += 1; report('INVALID', index, slug, 'unsupported guide_type'); continue }
    if (!status || !validStatuses.has(status)) { invalid += 1; report('INVALID', index, slug, 'unsupported status'); continue }
    if (typeof guide.featured !== 'boolean') { invalid += 1; report('INVALID', index, slug, 'featured must be boolean'); continue }
    if (guide.body_markdown !== undefined && guide.body_markdown !== null && typeof guide.body_markdown !== 'string') { invalid += 1; report('INVALID', index, slug, 'body_markdown must be a string'); continue }
    if (guide.summary !== undefined && guide.summary !== null && typeof guide.summary !== 'string') { invalid += 1; report('INVALID', index, slug, 'summary must be a string'); continue }
    if (guide.last_verified_at !== undefined && guide.last_verified_at !== null && typeof guide.last_verified_at !== 'string') { invalid += 1; report('INVALID', index, slug, 'last_verified_at must be a string'); continue }
    if (!isDate(lastVerifiedAt ?? '')) { invalid += 1; report('INVALID', index, slug, 'invalid last_verified_at'); continue }
    if (sourceName && !sourceIds.has(sourceName)) { invalid += 1; report('INVALID', index, slug, 'Source not found'); continue }
    if (existingSlugs.has(slug)) { skipped += 1; report('SKIPPED', index, slug, 'slug already exists'); continue }

    valid.push({ index, slug, guideType, title, summary: nullableText(guide.summary), bodyMarkdown: typeof guide.body_markdown === 'string' ? guide.body_markdown : null, status, featured: guide.featured, sourceId: sourceName ? sourceIds.get(sourceName) ?? null : null, lastVerifiedAt })
    report('VALID', index, slug, dryRun ? 'would import' : 'ready to import')
  }

  if (!dryRun) {
    for (const guide of valid) {
      const { data: createdGuide, error: guideError } = await supabase.from('guides').insert({ slug: guide.slug, guide_type: guide.guideType, status: guide.status, featured: guide.featured, source_id: guide.sourceId, last_verified_at: guide.lastVerifiedAt }).select('id').single()
      if (guideError || !createdGuide) {
        invalid += 1
        console.error(`Guide insert error for ${guide.slug}:`, guideError)
        report('INVALID', guide.index, guide.slug, 'Guide insert failed')
        continue
      }

      const { error: translationError } = await supabase.from('guide_translations').insert({ guide_id: createdGuide.id, language_code: 'en', title: guide.title, summary: guide.summary, body_markdown: guide.bodyMarkdown })
      if (translationError) {
        invalid += 1
        console.error(`Guide translation error for ${guide.slug}:`, translationError)
        reportPartialFailure(guide.index, guide.slug, createdGuide.id)
        continue
      }

      imported += 1
      report('IMPORTED', guide.index, guide.slug, 'Guide and translation imported')
    }
  }

  console.log(`\nTotals\nValid: ${valid.length}\nInvalid: ${invalid}\nSkipped: ${skipped}\nImported: ${imported}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
