import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseEnv } from 'node:util'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/database.types'
import { loadImportEnvironment } from '../lib/load-import-env'

const DATASET_URL = 'https://data.seoul.go.kr/dataList/OA-22586/S/1/datasetView.do'
const SERVICE_NAME = 'mgisToiletPoi'
const BATCH_SIZE = 1000

type SeoulResponse = Record<string, unknown>
type SeoulRow = Record<string, unknown>

const readSeoulApiKey = () => {
  const envFile = process.argv.find(argument => argument.startsWith('--env-file='))?.slice('--env-file='.length) ?? '.env'
  const values = parseEnv(readFileSync(resolve(envFile), 'utf8'))
  const key = values.SEOUL_OPEN_DATA_API_KEY ?? process.env.SEOUL_OPEN_DATA_API_KEY
  if (!key) throw new Error('Missing SEOUL_OPEN_DATA_API_KEY. Add it to the server-only environment before syncing Seoul restrooms.')
  return key
}

const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null
const number = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(text(value))
  return Number.isFinite(parsed) ? parsed : null
}
const date = (value: unknown) => {
  const match = text(value)?.match(/^(\d{4})[-.]?(\d{2})[-.]?(\d{2})/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null
}
const valueFrom = (row: SeoulRow, keys: string[]) => keys.map(key => row[key]).find(value => text(value) !== null)

const cleanText = (value: unknown) => {
  const parsed = text(value)
  return parsed ? parsed.replace(/\|+$/g, '').trim() || null : null
}

const mapRow = (row: SeoulRow) => {
  const sourceKey = row.OBJECTID !== undefined && row.OBJECTID !== null
    ? String(row.OBJECTID)
    : null

  const name = cleanText(row.CONTS_NAME)
  const latitude = number(row.COORD_Y)
  const longitude = number(row.COORD_X)

  if (!sourceKey || !name || latitude === null || longitude === null) return null

  if (
    latitude < -90 || latitude > 90
    || longitude < -180 || longitude > 180
  ) {
    return null
  }

  return {
    source_key: sourceKey,
    name,
    address: cleanText(row.ADDR_NEW) ?? cleanText(row.ADDR_OLD),
    latitude,
    longitude,
    opening_hours: cleanText(row.VALUE_02),
    facility_type: cleanText(row.VALUE_01),
    source_name: 'Seoul Open Data Plaza',
    source_url: DATASET_URL,
    source_updated_at: null,
    updated_at: new Date().toISOString(),
  }
}

const getPayload = (payload: SeoulResponse) => Object.values(payload).find(value => value && typeof value === 'object' && 'row' in value) as { row?: SeoulRow[], list_total_count?: number, RESULT?: { CODE?: string, MESSAGE?: string } } | undefined

const main = async () => {
  const { url, serviceRoleKey } = loadImportEnvironment()
  const apiKey = readSeoulApiKey()
  const supabase = createClient<Database>(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  let start = 1
  let imported = 0
  let skipped = 0
  let total: number | null = null

  while (total === null || start <= total) {
    const end = start + BATCH_SIZE - 1
    const response = await fetch(`http://openapi.seoul.go.kr:8088/${encodeURIComponent(apiKey)}/json/${SERVICE_NAME}/${start}/${end}`)
    if (!response.ok) throw new Error(`Seoul Open Data request failed with HTTP ${response.status}.`)
    const payload = await response.json() as SeoulResponse
    const dataset = getPayload(payload)
    if (!dataset?.row) {
      const rootResult = payload.RESULT as { CODE?: string, MESSAGE?: string } | undefined
      const nestedResult = Object.values(payload).find(value => value && typeof value === 'object' && 'RESULT' in value) as { RESULT?: { CODE?: string, MESSAGE?: string } } | undefined
      const result = rootResult ?? nestedResult?.RESULT
      throw new Error(`OA-22586 did not return rows for ${SERVICE_NAME}. ${result?.CODE ?? ''} ${result?.MESSAGE ?? ''}`.trim())
    }
    total = dataset.list_total_count ?? dataset.row.length
    const rows = dataset.row.map(mapRow)
    const validRows = rows.filter((row): row is NonNullable<typeof row> => Boolean(row))
    skipped += rows.length - validRows.length
    if (validRows.length) {
      const { error } = await supabase.from('restrooms').upsert(validRows, { onConflict: 'source_key' })
      if (error) throw error
      imported += validRows.length
    }
    if (dataset.row.length < BATCH_SIZE) break
    start += BATCH_SIZE
  }

  console.log(`Synced ${imported} restroom records. Skipped ${skipped} rows without the required source key, name, or valid coordinates.`)
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1 })
