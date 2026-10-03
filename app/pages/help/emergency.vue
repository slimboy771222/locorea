<script setup lang="ts">
import { ArrowLeft, LoaderCircle, MapPin, RotateCcw, Siren } from 'lucide-vue-next'
import type { EmergencyFacility, EmergencyNearbyResponse } from '~/types/emergency'

type Coordinates = { latitude: number, longitude: number }
type LocationState = 'loading' | 'denied' | 'unavailable' | 'ready'

const config = useRuntimeConfig()
const locationState = ref<LocationState>('loading')
const userLocation = ref<Coordinates | null>(null)
const facilities = ref<EmergencyFacility[]>([])
const selectedFacility = ref<EmergencyFacility | null>(null)
const facilitySelectionVersion = ref(0)
const isSearching = ref(false)
const searchError = ref(false)
const showingNearestFacilities = ref(false)

const findNearbyFacilities = async () => {
  if (!userLocation.value) return
  isSearching.value = true
  searchError.value = false
  selectedFacility.value = null
  try {
    const response = await $fetch<EmergencyNearbyResponse>('/api/emergency/nearby', {
      query: { lat: userLocation.value.latitude, lng: userLocation.value.longitude },
    })
    facilities.value = response.facilities
    showingNearestFacilities.value = response.showingNearestFacilities
  }
  catch {
    facilities.value = []
    showingNearestFacilities.value = false
    searchError.value = true
  }
  finally {
    isSearching.value = false
  }
}

const requestLocation = () => {
  locationState.value = 'loading'
  searchError.value = false
  facilities.value = []
  showingNearestFacilities.value = false
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

const selectFacility = (facility: EmergencyFacility) => {
  selectedFacility.value = facility
  facilitySelectionVersion.value += 1
}

const openDirections = () => {
  const facility = selectedFacility.value
  if (!import.meta.client || !facility) return
  const query = `${facility.nameKo} ${facility.latitude},${facility.longitude}`
  window.open(`https://map.naver.com/p/search/${encodeURIComponent(query)}`, '_blank', 'noopener')
}

onMounted(requestLocation)

useSeoMeta({ title: 'Medical emergency — Locorea', description: 'Call 119 or find a nearby emergency room' })
</script>

<template>
  <main class="bg-slate-50 lg:px-8 lg:py-8">
    <div class="mx-auto flex h-[calc(100dvh-60px)] max-w-7xl flex-col overflow-hidden bg-white lg:h-[min(760px,calc(100dvh-64px))] lg:rounded-2xl lg:border lg:border-slate-200">
      <header class="shrink-0 border-b border-slate-200 px-5 py-4 lg:px-6">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700"><ArrowLeft :size="18" aria-hidden="true" />Back</NuxtLink>
        <h1 class="mt-2 text-xl font-bold tracking-tight text-slate-950">Medical emergency</h1>
        <p class="mt-1 text-sm text-slate-600">Call 119 or find a nearby emergency room</p>
        <div class="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div><p class="text-sm font-semibold text-red-950">If this is a serious or life-threatening emergency:</p><p class="mt-0.5 text-xs leading-5 text-red-800">Call 119 for emergency services in Korea.</p></div>
          <a href="tel:119" class="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-bold text-white transition hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"><Siren :size="18" aria-hidden="true" />Call 119</a>
        </div>
      </header>

      <div class="relative min-h-0 flex-1 bg-slate-100">
        <EmergencyMap v-if="locationState === 'ready' && userLocation" class="absolute inset-0" :user-location="userLocation" :facilities="facilities" :selected-source-id="selectedFacility?.sourceId ?? null" :client-id="config.public.naverMapsClientId" @select="selectFacility" />
        <div v-else class="grid h-full min-h-[300px] place-items-center p-6 text-center">
          <div v-if="locationState === 'loading'" class="max-w-xs"><LoaderCircle :size="28" class="mx-auto animate-spin text-blue-700" aria-hidden="true" /><p class="mt-4 text-sm font-medium text-slate-800">Finding nearby emergency facilities…</p><p class="mt-1 text-sm leading-5 text-slate-500">Location is only used to find nearby medical care.</p></div>
          <div v-else class="max-w-xs"><MapPin :size="28" class="mx-auto text-slate-400" aria-hidden="true" /><p class="mt-4 text-sm font-medium text-slate-800">{{ locationState === 'denied' ? 'Allow location access to find nearby emergency facilities.' : 'Your location is unavailable right now.' }}</p><button type="button" class="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400" @click="requestLocation"><RotateCcw :size="16" aria-hidden="true" />Retry</button></div>
        </div>

        <div v-if="locationState === 'ready'" class="absolute inset-x-0 bottom-0 z-10 lg:bottom-5 lg:left-auto lg:right-5 lg:w-[360px]">
          <div v-if="isSearching" class="rounded-t-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-lg lg:rounded-2xl">Finding nearby emergency facilities…</div>
          <div v-else-if="searchError" class="rounded-t-2xl border border-slate-200 bg-white p-5 shadow-lg lg:rounded-2xl"><p class="text-sm font-medium text-slate-800">Nearby emergency facilities could not be loaded.</p><button type="button" class="mt-3 text-sm font-semibold text-blue-700" @click="findNearbyFacilities">Try again</button></div>
          <div v-else-if="!facilities.length" class="rounded-t-2xl border border-slate-200 bg-white p-5 shadow-lg lg:rounded-2xl"><p class="text-sm font-medium text-slate-800">No emergency facilities found within 10 km.</p></div>
          <EmergencyFacilitySheet v-else :facility="selectedFacility" :result-count="facilities.length" :selection-version="facilitySelectionVersion" :showing-nearest-facilities="showingNearestFacilities" @directions="openDirections" />
        </div>
      </div>

      <p class="shrink-0 border-t border-slate-200 px-5 py-3 text-xs leading-5 text-slate-500 lg:px-6">Source: National Medical Center</p>
    </div>
  </main>
</template>
