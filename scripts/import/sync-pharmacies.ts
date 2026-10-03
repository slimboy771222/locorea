import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseEnv } from 'node:util'
import { createClient } from '@supabase/supabase-js'
import { XMLParser } from 'fast-xml-parser'
import type { Database } from '../../app/types/database.types'
import { loadImportEnvironment } from '../lib/load-import-env'

const API_URL = 'http://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyFullDown'
const REQUESTED_PAGE_SIZE = 1000
const MAX_PAGES = 100
// Preserve source values such as resultCode "00" and opening time "0800" exactly.
const parser = new XMLParser({ trimValues: true, parseTagValue: false })

type SourceItem = Record<string, unknown>

const selectedEnvFile = () => {
  const value = process.argv.find(argument => argument.startsWith('--env-file='))?.slice('--env-file='.length) ?? '.env'
  if (!value.trim()) throw new Error('Missing path after --env-file.')
  return resolve(value)
}

const readPharmacyApiKey = () => {
  const envPath = selectedEnvFile()
  let values: Record<string, string | undefined>

  try {
    values = parseEnv(readFileSync(envPath, 'utf8'))
  }
  catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') throw new Error(`Environment file not found: ${envPath}`)
    throw error
  }

  const key = values.PHARMACY_OPEN_API_KEY ?? process.env.PHARMACY_OPEN_API_KEY
  if (!key) throw new Error('Missing PHARMACY_OPEN_API_KEY. Add it to the selected server-only environment before syncing pharmacies.')
  return key
}

const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null
const number = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(text(value))
  return Number.isFinite(parsed) ? parsed : null
}
const items = (value: unknown): SourceItem[] => Array.isArray(value) ? value.filter((item): item is SourceItem => Boolean(item) && typeof item === 'object') : value && typeof value === 'object' ? [value as SourceItem] : []

const mapRow = (item: SourceItem, syncedAt: string) => {
  const sourceId = text(item.hpid)
  const name = text(item.dutyName)
  const latitude = number(item.wgs84Lat)
  const longitude = number(item.wgs84Lon)

  if (!sourceId || !name || latitude === null || longitude === null) return null
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null

  return {
    source_id: sourceId,
    name_ko: name,
    address_ko: text(item.dutyAddr),
    phone: text(item.dutyTel1),
    latitude,
    longitude,
    mon_open: text(item.dutyTime1s),
    mon_close: text(item.dutyTime1c),
    tue_open: text(item.dutyTime2s),
    tue_close: text(item.dutyTime2c),
    wed_open: text(item.dutyTime3s),
    wed_close: text(item.dutyTime3c),
    thu_open: text(item.dutyTime4s),
    thu_close: text(item.dutyTime4c),
    fri_open: text(item.dutyTime5s),
    fri_close: text(item.dutyTime5c),
    sat_open: text(item.dutyTime6s),
    sat_close: text(item.dutyTime6c),
    sun_open: text(item.dutyTime7s),
    sun_close: text(item.dutyTime7c),
    holiday_open: text(item.dutyTime8s),
    holiday_close: text(item.dutyTime8c),
    note_ko: text(item.dutyEtc),
    directions_ko: text(item.dutyMapimg),
    source_name: 'National Medical Center',
    source_url: API_URL,
    synced_at: syncedAt,
    updated_at: syncedAt,
  }
}

const fetchPage = async (apiKey: string, pageNo: number) => {
  const url = new URL(API_URL)
  url.searchParams.set('serviceKey', apiKey)
  url.searchParams.set('pageNo', String(pageNo))
  url.searchParams.set('numOfRows', String(REQUESTED_PAGE_SIZE))

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Pharmacy API request failed with HTTP ${response.status}.`)

  const parsed = parser.parse(await response.text()) as {
    response?: {
      header?: { resultCode?: unknown, resultMsg?: unknown }
      body?: { items?: { item?: unknown }, numOfRows?: unknown, pageNo?: unknown, totalCount?: unknown }
    }
  }
  const header = parsed.response?.header
  const body = parsed.response?.body
  const resultCode = text(header?.resultCode)
  if (resultCode !== '00') throw new Error(`Pharmacy API returned ${resultCode ?? 'an unknown error'}: ${text(header?.resultMsg) ?? 'No error message supplied.'}`)
  if (!body) throw new Error('Pharmacy API response did not include a body.')

  const actualPageNo = number(body.pageNo)
  const actualNumOfRows = number(body.numOfRows)
  const totalCount = number(body.totalCount)
  if (!actualPageNo || !actualNumOfRows || totalCount === null) throw new Error('Pharmacy API response has invalid pagination metadata.')

  return { rows: items(body.items?.item), actualPageNo, actualNumOfRows, totalCount }
}

const main = async () => {
  const { url, serviceRoleKey } = loadImportEnvironment()
  const apiKey = readPharmacyApiKey()
  const supabase = createClient<Database>(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  let pageNo = 1
  let pagesProcessed = 0
  let totalCount: number | null = null
  let actualNumOfRows: number | null = null
  let imported = 0
  let skipped = 0

  while (pagesProcessed < MAX_PAGES) {
    const page = await fetchPage(apiKey, pageNo)
    if (page.actualPageNo !== pageNo) throw new Error(`Pharmacy API returned page ${page.actualPageNo} after requesting page ${pageNo}.`)
    if (actualNumOfRows === null) {
      actualNumOfRows = page.actualNumOfRows
      totalCount = page.totalCount
      console.log(`Pharmacy API pagination: requested ${REQUESTED_PAGE_SIZE}, returned numOfRows ${actualNumOfRows}, totalCount ${totalCount}.`)
    }
    else if (page.actualNumOfRows !== actualNumOfRows || page.totalCount !== totalCount) {
      throw new Error('Pharmacy API pagination metadata changed during the sync.')
    }

    if (!page.rows.length) throw new Error(`Pharmacy API returned an empty items page unexpectedly at page ${pageNo}.`)
    const syncedAt = new Date().toISOString()
    const mappedRows = page.rows.map(item => mapRow(item, syncedAt))
    const validRows = mappedRows.filter((row): row is NonNullable<typeof row> => Boolean(row))
    skipped += mappedRows.length - validRows.length

    if (validRows.length) {
      const { error } = await supabase.from('pharmacies').upsert(validRows, { onConflict: 'source_id' })
      if (error) throw error
      imported += validRows.length
    }

    pagesProcessed += 1
    const totalPages = Math.ceil(totalCount / actualNumOfRows)
    if (pageNo >= totalPages) break
    pageNo += 1
  }

  if (pagesProcessed >= MAX_PAGES) throw new Error(`Pharmacy sync stopped at the ${MAX_PAGES}-page safety limit.`)
  console.log(`Synced ${imported} pharmacy records across ${pagesProcessed} pages. Skipped ${skipped} rows without the required source ID, Korean name, or valid coordinates.`)
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1 })
