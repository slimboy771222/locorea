export type EmergencyFacility = {
  sourceId: string
  nameKo: string
  addressKo: string | null
  facilityCode: string | null
  facilityTypeKo: string | null
  phone: string | null
  emergencyPhone: string | null
  latitude: number
  longitude: number
  distanceKm: number
  startTime: string | null
  endTime: string | null
}

export type EmergencyNearbyResponse = {
  facilities: EmergencyFacility[]
  noFacilitiesWithinTenKm: boolean
  showingNearestFacilities: boolean
}
