import { createClient } from '@supabase/supabase-js'
import { XMLParser } from 'fast-xml-parser'
import type { Database } from '~/types/database.types'

const emergencyApiUrl = 'http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytLcinfoInqire'
const parser = new XMLParser({ trimValues: true, parseTagValue: false })
const requestTimeoutMs = 8_000
const practicalDistanceKm = 10

type SourceItem = Record<string, unknown>
type Enrichment = { source_id: string, phone: string | null, er_phone: string | null, facility_code: string | null, facility_name_ko: string | null }

const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null
const number = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(text(value))
  return Number.isFinite(parsed) ? parsed : null
}
const sourceItems = (value: unknown): SourceItem[] => Array.isArray(value)
  ? value.filter((item): item is SourceItem => Boolean(item) && typeof item === 'object')
  : value && typeof value === 'object' ? [value as SourceItem] : []

const readCoordinate = (value: string | undefined, label: string, min: number, max: number) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) throw createError({ statusCode: 400, statusMessage: `A valid ${label} is required.` })
  return parsed
}

const developmentLog = (message: string, details: Record<string, unknown>) => {
  if (import.meta.dev) console.info(`[emergency nearby] ${message}`, details)
}

const encodeServiceKeyOnce = (value: string) => /%[0-9a-f]{2}/i.test(value) ? value : encodeURIComponent(value)

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const latitude = readCoordinate(typeof query.lat === 'string' ? query.lat : undefined, 'latitude', -90, 90)
  const longitude = readCoordinate(typeof query.lng === 'string' ? query.lng : undefined, 'longitude', -180, 180)
  const config = useRuntimeConfig(event)
  const apiKey = config.emergencyOpenApiKey
  if (!apiKey) throw createError({ statusCode: 503, statusMessage: 'Emergency facility service is not configured.' })

  const url = `${emergencyApiUrl}?serviceKey=${encodeServiceKeyOnce(apiKey)}&WGS84_LON=${longitude}&WGS84_LAT=${latitude}&pageNo=1&numOfRows=100`

  let xml: string
  try {
    xml = await fetch(url, { signal: AbortSignal.timeout(requestTimeoutMs) }).then(async (response) => {
      developmentLog('upstream response', { status: response.status })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.text()
    })
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'Nearby emergency facilities could not be loaded.' })
  }

  let parsed: {
    response?: {
      header?: { resultCode?: unknown, resultMsg?: unknown }
      body?: { items?: { item?: unknown }, totalCount?: unknown }
    }
  }
  try {
    parsed = parser.parse(xml)
  }
  catch {
    developmentLog('XML parsing failed', {})
    throw createError({ statusCode: 502, statusMessage: 'Nearby emergency facilities could not be loaded.' })
  }
  const resultCode = text(parsed.response?.header?.resultCode)
  const resultMessage = text(parsed.response?.header?.resultMsg)
  const totalCount = number(parsed.response?.body?.totalCount)
  developmentLog('upstream result', { resultCode, resultMessage, totalCount })
  if (resultCode !== '00') throw createError({ statusCode: 502, statusMessage: resultMessage ?? 'Nearby emergency facilities could not be loaded.' })

  const items = sourceItems(parsed.response?.body?.items?.item)
  const normalized = items
    .map((item) => {
      const sourceId = text(item.hpid)
      const nameKo = text(item.dutyName)
      const itemLatitude = number(item.latitude)
      const itemLongitude = number(item.longitude)
      const distanceKm = number(item.distance)
      if (!sourceId || !nameKo || itemLatitude === null || itemLongitude === null || distanceKm === null) return null
      if (itemLatitude < -90 || itemLatitude > 90 || itemLongitude < -180 || itemLongitude > 180 || distanceKm < 0) return null
      return {
        sourceId,
        nameKo,
        addressKo: text(item.dutyAddr),
        facilityCode: text(item.dutyDiv),
        facilityTypeKo: text(item.dutyDivName),
        phone: text(item.dutyTel1),
        emergencyPhone: null as string | null,
        latitude: itemLatitude,
        longitude: itemLongitude,
        distanceKm,
        startTime: text(item.startTime),
        endTime: text(item.endTime),
      }
    })
    .filter((facility): facility is NonNullable<typeof facility> => Boolean(facility))
    .sort((first, second) => first.distanceKm - second.distanceKm)
  const withinPracticalDistance = normalized.filter(facility => facility.distanceKm <= practicalDistanceKm)
  const showingNearestFacilities = withinPracticalDistance.length === 0 && normalized.length > 0
  const facilitiesToDisplay = (withinPracticalDistance.length ? withinPracticalDistance : normalized).slice(0, 20)
  developmentLog('normalized facilities', {
    sourceItemCount: items.length,
    nearestDistanceKm: normalized[0]?.distanceKm ?? null,
    withinTenKm: withinPracticalDistance.length,
  })

  const sourceIds = facilitiesToDisplay.map(facility => facility.sourceId)
  const response = {
    facilities: facilitiesToDisplay,
    noFacilitiesWithinTenKm: withinPracticalDistance.length === 0,
    showingNearestFacilities,
  }
  if (!sourceIds.length || !config.public.supabaseUrl || !config.public.supabasePublishableKey) return response

  try {
    const supabase = createClient<Database>(config.public.supabaseUrl, config.public.supabasePublishableKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
    const { data } = await supabase
      .from('medical_facilities')
      .select('source_id, phone, er_phone, facility_code, facility_name_ko')
      .in('source_id', sourceIds)
    const bySourceId = new Map((data as Enrichment[] | null ?? []).map(facility => [facility.source_id, facility]))
    return {
      ...response,
      facilities: facilitiesToDisplay.map((facility) => {
      const match = bySourceId.get(facility.sourceId)
      if (!match) return facility
      return {
        ...facility,
        facilityCode: match.facility_code ?? facility.facilityCode,
        facilityTypeKo: match.facility_name_ko ?? facility.facilityTypeKo,
        phone: match.phone ?? facility.phone,
        emergencyPhone: match.er_phone ?? match.phone ?? facility.phone,
      }
      }),
    }
  }
  catch (error: unknown) {
    developmentLog('Supabase enrichment failed', { message: error instanceof Error ? error.message : 'Unknown error' })
    return response
  }
})
