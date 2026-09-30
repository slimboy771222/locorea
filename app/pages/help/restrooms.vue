<script setup lang="ts">
import { ArrowLeft, LoaderCircle, MapPin, RotateCcw } from 'lucide-vue-next'
import type { NearbyRestroom } from '~/types/restrooms'

type Coordinates = { latitude: number, longitude: number }
type LocationState = 'loading' | 'denied' | 'unavailable' | 'ready'

const config = useRuntimeConfig()
const supabase = useSupabase()
const locationState = ref<LocationState>('loading')
const userLocation = ref<Coordinates | null>(null)
const restrooms = ref<NearbyRestroom[]>([])
const selectedRestroom = ref<NearbyRestroom | null>(null)
const radiusMeters = ref(800)
const isSearching = ref(false)
const searchError = ref<string | null>(null)
const datasetUrl = 'https://data.seoul.go.kr/dataList/OA-22586/S/1/datasetView.do'

const source = computed(() => restrooms.value.find(restroom => restroom.source_name)?.source_name ?? 'Seoul Open Data Plaza')
const sourceUrl = computed(() => restrooms.value.find(restroom => restroom.source_url)?.source_url ?? datasetUrl)
const sourceUpdatedAt = computed(() => restrooms.value.find(restroom => restroom.source_updated_at)?.source_updated_at ?? null)
const formatSourceDate = (value: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00`))

const findNearbyRestrooms = async () => {
  if (!userLocation.value) return
  isSearching.value = true
  searchError.value = null
  selectedRestroom.value = null

  const { data, error } = await supabase.rpc('nearby_restrooms', {
    user_latitude: userLocation.value.latitude,
    user_longitude: userLocation.value.longitude,
    radius_meters: radiusMeters.value,
    result_limit: 15,
  })

  isSearching.value = false
  if (error) { searchError.value = 'Nearby restrooms could not be loaded. Please try again.'; return }
  restrooms.value = (data ?? []).map(restroom => ({ ...restroom, distance_meters: Number(restroom.distance_meters) }))
}

const requestLocation = () => {
  locationState.value = 'loading'
  searchError.value = null
  restrooms.value = []
  selectedRestroom.value = null

  if (!import.meta.client || !navigator.geolocation) { locationState.value = 'unavailable'; return }
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      userLocation.value = { latitude: position.coords.latitude, longitude: position.coords.longitude }
      locationState.value = 'ready'
      await findNearbyRestrooms()
    },
    (error) => { locationState.value = error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable' },
    { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
  )
}

const searchWiderArea = async () => { radiusMeters.value = 1500; await findNearbyRestrooms() }
const naverFallbackUrl = (restroom: NearbyRestroom) => `https://map.naver.com/p/search/${encodeURIComponent(`${restroom.name} ${restroom.latitude},${restroom.longitude}`)}`

const openWalkingDirections = () => {
  const restroom = selectedRestroom.value
  if (!import.meta.client || !restroom) return
  const appName = encodeURIComponent(window.location.origin)
  const destination = `dlat=${restroom.latitude}&dlng=${restroom.longitude}&dname=${encodeURIComponent(restroom.name)}&appname=${appName}`
  const scheme = `nmap://route/walk?${destination}`
  const fallback = naverFallbackUrl(restroom)
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  if (!mobile) { window.open(fallback, '_blank', 'noopener'); return }
  window.location.assign(scheme)
  window.setTimeout(() => { if (document.visibilityState === 'visible') window.location.assign(fallback) }, 900)
}

onMounted(requestLocation)

useSeoMeta({ title: 'Restrooms near you — Locorea', description: 'Find public restrooms near your current location in Seoul.' })
</script>

<template>
  <main class="bg-slate-50 lg:px-8 lg:py-8">
    <div class="mx-auto flex h-[calc(100dvh-60px)] max-w-7xl flex-col overflow-hidden bg-white lg:h-[min(760px,calc(100dvh-64px))] lg:rounded-2xl lg:border lg:border-slate-200">
      <header class="shrink-0 border-b border-slate-200 px-5 py-4 lg:px-6">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-700"><ArrowLeft :size="18" aria-hidden="true" />Back</NuxtLink>
        <h1 class="mt-2 text-xl font-bold tracking-tight text-slate-950">Restrooms near you</h1>
        <p class="mt-1 text-sm text-slate-600">About a 10-minute walk</p>
      </header>

      <div class="relative min-h-0 flex-1 bg-slate-100">
        <RestroomsRestroomMap v-if="locationState === 'ready' && userLocation" class="absolute inset-0" :user-location="userLocation" :restrooms="restrooms" :selected-id="selectedRestroom?.id ?? null" :client-id="config.public.naverMapsClientId" @select="selectedRestroom = $event" />
        <div v-else class="grid h-full min-h-[360px] place-items-center p-6 text-center">
          <div v-if="locationState === 'loading'" class="max-w-xs"><LoaderCircle :size="28" class="mx-auto animate-spin text-blue-700" aria-hidden="true" /><p class="mt-4 text-sm font-medium text-slate-800">Finding your location…</p><p class="mt-1 text-sm leading-5 text-slate-500">Location is only used to find nearby restrooms.</p></div>
          <div v-else class="max-w-xs"><MapPin :size="28" class="mx-auto text-slate-400" aria-hidden="true" /><p class="mt-4 text-sm font-medium text-slate-800">{{ locationState === 'denied' ? 'Allow location access to find restrooms near you.' : 'Your location is unavailable right now.' }}</p><button type="button" class="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400" @click="requestLocation"><RotateCcw :size="16" aria-hidden="true" />Retry</button></div>
        </div>

        <div v-if="locationState === 'ready'" class="absolute inset-x-0 bottom-0 z-10 lg:bottom-5 lg:left-auto lg:right-5 lg:w-[360px]">
          <div v-if="isSearching" class="rounded-t-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-lg lg:rounded-2xl">Finding nearby restrooms…</div>
          <div v-else-if="searchError" class="rounded-t-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-lg lg:rounded-2xl"><p>{{ searchError }}</p><button type="button" class="mt-3 text-sm font-semibold text-blue-700" @click="findNearbyRestrooms">Try again</button></div>
          <div v-else-if="!restrooms.length" class="rounded-t-2xl border border-slate-200 bg-white p-5 shadow-lg lg:rounded-2xl"><p class="text-sm font-medium text-slate-800">No public restrooms found nearby.</p><button v-if="radiusMeters < 1500" type="button" class="mt-3 inline-flex min-h-10 items-center rounded-lg bg-blue-700 px-3 text-sm font-semibold text-white" @click="searchWiderArea">Search a wider area</button></div>
          <RestroomsRestroomSheet v-else :restroom="selectedRestroom" :result-count="restrooms.length" @directions="openWalkingDirections" />
        </div>
      </div>

      <p class="shrink-0 border-t border-slate-200 px-5 py-3 text-xs leading-5 text-slate-500 lg:px-6"><span>Source: </span><a :href="sourceUrl" target="_blank" rel="noreferrer" class="underline decoration-slate-300 underline-offset-2 hover:text-slate-700">{{ source }}</a><span v-if="sourceUpdatedAt"> · Updated {{ formatSourceDate(sourceUpdatedAt) }}</span></p>
    </div>
  </main>
</template>
