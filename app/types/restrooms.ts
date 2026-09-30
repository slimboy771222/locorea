export type NearbyRestroom = {
  id: string
  name: string
  address: string | null
  latitude: number
  longitude: number
  opening_hours: string | null
  facility_type: string | null
  source_name: string | null
  source_url: string | null
  source_updated_at: string | null
  distance_meters: number
}
