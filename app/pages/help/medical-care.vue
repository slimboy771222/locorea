<script setup lang="ts">
import { ArrowLeft, LoaderCircle, MapPin, RotateCcw } from 'lucide-vue-next'
import type { NearbyMedicalFacility } from '~/types/medical-facilities'

type Coordinates = { latitude: number, longitude: number }
type LocationState = 'loading' | 'denied' | 'unavailable' | 'ready'

const config = useRuntimeConfig()
const supabase = useSupabase()
const locationState = ref<LocationState>('loading')
const userLocation = ref<Coordinates | null>(null)
const facilities = ref<NearbyMedicalFacility[]>([])
const selectedFacility = ref<NearbyMedicalFacility | null>(null)
const facilitySelectionVersion = ref(0)
const radiusMeters = ref(3000)
const isSearching = ref(false)
const searchError = ref<string | null>(null)
const defaultSourceUrl = 'http://apis.data.go.kr/B552657/HsptlAsembySearchService/getHsptlMdcncFullDown'

const openCount = computed(() => facilities.value.filter(facility => facility.is_open_now).length)
const source = computed(() => facilities.value[0]?.source_name ?? 'National Medical Center')
const sourceUrl = computed(() => facilities.value.find(facility => facility.source_url)?.source_url ?? defaultSourceUrl)

const findNearbyFacilities = async () => {
  if (!userLocation.value) return
  isSearching.value = true
  searchError.value = null
  selectedFacility.value = null

  const { data, error } = await supabase.rpc('nearby_medical_facilities', {
    user_latitude: userLocation.value.latitude,
    user_longitude: userLocation.value.longitude,
    radius_meters: radiusMeters.value,
    result_limit: 20,
  })

  isSearching.value = false
  if (error) {
    searchError.value = 'Nearby medical facilities could not be loaded. Please try again.'
    return
  }
  facilities.value = (data ?? [])
    .map(facility => ({ ...facility, distance_meters: Number(facility.distance_meters) }))
    .sort((first, second) => {
      const firstRank = first.is_open_now === true ? 0 : first.is_open_now === false ? 1 : 2
      const secondRank = second.is_open_now === true ? 0 : second.is_open_now === false ? 1 : 2
      return firstRank - secondRank || first.distance_meters - second.distance_meters
    })
}

const requestLocation = () => {
  locationState.value = 'loading'
  searchError.value = null
  facilities.value = []
  selectedFacility.value = null

  if (!import.meta.client || !navigator.geolocation) {
    locationState.value = 'unavailable'
    return
  }
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      userLocation.value = { latitude: position.coords.latitude, longitude: position.coords.longitude }
      locationState.value = 'ready'
      await findNearbyFacilities()
    },
    (error) => { locationState.value = error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable' },
    { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
  )
}

const searchWiderArea = async () => {
  radiusMeters.value = 7000
  await findNearbyFacilities()
}

const selectFacility = (facility: NearbyMedicalFacility) => {
  selectedFacility.value = facility
  facilitySelectionVersion.value += 1
}

const openDirections = () => {
  const facility = selectedFacility.value
  if (!import.meta.client || !facility) return
  const query = `${facility.name_ko} ${facility.latitude},${facility.longitude}`
  window.open(`https://map.naver.com/p/search/${encodeURIComponent(query)}`, '_blank', 'noopener')
}

onMounted(requestLocation)

useSeoMeta({ title: 'Medical care near you — Locorea', description: 'Find nearby clinics and hospitals in Korea, with listed hours and directions.' })
</script>

<template>
  <main class="bg-slate-50 lg:px-8 lg:py-8">
    <div class="mx-auto flex h-[calc(100dvh-60px)] max-w-7xl flex-col overflow-hidden bg-white lg:h-[min(760px,calc(100dvh-64px))] lg:rounded-2xl lg:border lg:border-slate-200">
      <header class="shrink-0 border-b border-slate-200 px-5 py-4 lg:px-6">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700"><ArrowLeft :size="18" aria-hidden="true" />Back</NuxtLink>
        <h1 class="mt-2 text-xl font-bold tracking-tight text-slate-950">Medical care near you</h1>
        <p class="mt-1 text-sm text-slate-600">Open clinics &amp; hospitals</p>
      </header>

      <div class="relative min-h-0 flex-1 bg-slate-100">
        <MedicalCareMedicalFacilityMap v-if="locationState === 'ready' && userLocation" class="absolute inset-0" :user-location="userLocation" :facilities="facilities" :selected-id="selectedFacility?.id ?? null" :client-id="config.public.naverMapsClientId" @select="selectFacility" />
        <div v-else class="grid h-full min-h-[360px] place-items-center p-6 text-center">
          <div v-if="locationState === 'loading'" class="max-w-xs"><LoaderCircle :size="28" class="mx-auto animate-spin text-blue-700" aria-hidden="true" /><p class="mt-4 text-sm font-medium text-slate-800">Finding your location…</p><p class="mt-1 text-sm leading-5 text-slate-500">Location is only used to find nearby medical care.</p></div>
          <div v-else class="max-w-xs"><MapPin :size="28" class="mx-auto text-slate-400" aria-hidden="true" /><p class="mt-4 text-sm font-medium text-slate-800">{{ locationState === 'denied' ? 'Allow location access to find medical care near you.' : 'Your location is unavailable right now.' }}</p><button type="button" class="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400" @click="requestLocation"><RotateCcw :size="16" aria-hidden="true" />Retry</button></div>
        </div>

        <div v-if="locationState === 'ready'" class="absolute inset-x-0 bottom-0 z-10 lg:bottom-5 lg:left-auto lg:right-5 lg:w-[360px]">
          <div v-if="isSearching" class="rounded-t-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-lg lg:rounded-2xl">Finding nearby medical facilities…</div>
          <div v-else-if="searchError" class="rounded-t-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-lg lg:rounded-2xl"><p>{{ searchError }}</p><button type="button" class="mt-3 text-sm font-semibold text-blue-700" @click="findNearbyFacilities">Try again</button></div>
          <div v-else-if="!facilities.length" class="rounded-t-2xl border border-slate-200 bg-white p-5 shadow-lg lg:rounded-2xl"><p class="text-sm font-medium text-slate-800">No medical facilities found nearby.</p><button v-if="radiusMeters < 7000" type="button" class="mt-3 inline-flex min-h-10 items-center rounded-lg bg-blue-700 px-3 text-sm font-semibold text-white" @click="searchWiderArea">Search a wider area</button></div>
          <MedicalCareMedicalFacilitySheet v-else :facility="selectedFacility" :result-count="facilities.length" :open-count="openCount" :selection-version="facilitySelectionVersion" @directions="openDirections" />
        </div>
      </div>

      <p class="shrink-0 border-t border-slate-200 px-5 py-3 text-xs leading-5 text-slate-500 lg:px-6"><span>Source: </span><a :href="sourceUrl" target="_blank" rel="noreferrer" class="underline decoration-slate-300 underline-offset-2 hover:text-slate-700">{{ source }}</a></p>
    </div>
  </main>
</template>
