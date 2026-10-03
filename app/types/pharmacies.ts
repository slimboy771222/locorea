export type NearbyPharmacy = {
  id: string
  source_id: string
  name_ko: string
  address_ko: string | null
  phone: string | null
  latitude: number
  longitude: number
  opening_time: string | null
  closing_time: string | null
  note_ko: string | null
  source_name: string
  source_url: string | null
  is_open_now: boolean | null
  distance_meters: number
}
