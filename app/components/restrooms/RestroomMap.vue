<script setup lang="ts">
import type { NearbyRestroom } from '~/types/restrooms'
import type { NaverMapInstance } from '~/composables/useNaverMaps'

type Coordinates = { latitude: number, longitude: number }

const debug = (message: string, details?: Record<string, unknown>) => {
  if (import.meta.dev) console.debug(`[RestroomMap] ${message}`, details ?? '')
}

const props = defineProps<{
  userLocation: Coordinates | null
  restrooms: NearbyRestroom[]
  selectedId: string | null
  clientId: string
}>()

const emit = defineEmits<{ select: [restroom: NearbyRestroom] }>()
const mapElement = ref<HTMLElement | null>(null)
const map = ref<NaverMapInstance | null>(null)
const mapMessage = ref<string | null>(null)
const isInitializing = ref(false)
let markers: Array<{ setMap: (map: unknown) => void }> = []
let resizeObserver: ResizeObserver | null = null
const { loadNaverMaps } = useNaverMaps()

const renderMarkers = () => {
  if (!map.value || !window.naver?.maps) return
  markers.forEach(marker => marker.setMap(null))
  markers = []

  const { maps } = window.naver
  if (props.userLocation) {
    markers.push(new maps.Marker({
      map: map.value,
      position: new maps.LatLng(props.userLocation.latitude, props.userLocation.longitude),
      icon: { content: '<span aria-hidden="true" style="display:block;width:16px;height:16px;border:3px solid white;border-radius:999px;background:#2563eb;box-shadow:0 1px 4px rgba(15,23,42,.35)"></span>' },
    }))
  }

  props.restrooms.forEach((restroom) => {
    const marker = new maps.Marker({
      map: map.value,
      position: new maps.LatLng(restroom.latitude, restroom.longitude),
      icon: { content: `<span aria-label="Restroom" style="display:grid;width:30px;height:30px;place-items:center;border:2px solid white;border-radius:999px;background:${restroom.id === props.selectedId ? '#1d4ed8' : '#0f172a'};color:white;font-size:15px;box-shadow:0 1px 4px rgba(15,23,42,.35)">WC</span>` },
    })
    maps.Event.addListener(marker, 'click', () => emit('select', restroom))
    markers.push(marker)
  })
}

const resizeMap = () => {
  if (!map.value || !mapElement.value || !window.naver?.maps) return
  const { width, height } = mapElement.value.getBoundingClientRect()
  if (width > 0 && height > 0) map.value.setSize(new window.naver.maps.Size(width, height))
}

const initialize = async () => {
  debug('initialize', {
    hasClientId: Boolean(props.clientId),
    hasMapElement: Boolean(mapElement.value),
    userLocation: props.userLocation,
    isClient: import.meta.client,
    hasDocumentHead: import.meta.client && Boolean(document.head),
    hasMap: Boolean(map.value),
    isInitializing: isInitializing.value,
  })
  if (!import.meta.client || map.value || isInitializing.value) return
  if (!props.clientId) {
    debug('initialize stopped: missing client ID')
    mapMessage.value = 'NAVER Maps is not configured. Add NUXT_PUBLIC_NAVER_MAPS_CLIENT_ID to view the map.'
    return
  }
  if (!props.userLocation) {
    debug('initialize stopped: missing user location')
    return
  }

  await nextTick()
  if (!mapElement.value) {
    debug('initialize stopped: map element unavailable after next tick')
    return
  }

  isInitializing.value = true
  try {
    const naver = await loadNaverMaps(props.clientId)
    if (!mapElement.value || !props.userLocation || !naver.maps) return
    map.value = new naver.maps.Map(mapElement.value, {
      center: new naver.maps.LatLng(props.userLocation.latitude, props.userLocation.longitude),
      zoom: 15,
      minZoom: 10,
      zoomControl: true,
      mapTypeControl: false,
    })
    mapMessage.value = null
    debug('map initialized', { hasMapElement: Boolean(mapElement.value) })
    renderMarkers()
    resizeObserver = new ResizeObserver(resizeMap)
    resizeObserver.observe(mapElement.value)
    resizeMap()
  }
  catch (error) {
    debug('map initialization failed', { message: error instanceof Error ? error.message : 'Unknown error' })
    mapMessage.value = 'NAVER Maps could not load. Check the map configuration and allowed domain.'
  }
  finally {
    isInitializing.value = false
  }
}

watch(() => props.userLocation, () => { void initialize() })
watch(() => [props.restrooms, props.selectedId], () => renderMarkers(), { deep: true })

onMounted(() => {
  debug('mounted', {
    hasClientId: Boolean(props.clientId),
    hasMapElement: Boolean(mapElement.value),
    userLocation: props.userLocation,
    isClient: import.meta.client,
    hasDocumentHead: Boolean(document.head),
  })
  void initialize()
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  markers.forEach(marker => marker.setMap(null))
})
</script>

<template>
  <div class="relative h-full min-h-[320px] overflow-hidden bg-slate-100">
    <div
      id="restroom-map"
      ref="mapElement"
      class="h-full min-h-[320px] w-full"
    ></div>

    <div
      v-if="mapMessage"
      class="absolute inset-0 z-10 grid place-items-center p-6 text-center text-sm leading-6 text-slate-600"
    >
      <p class="max-w-sm rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm">
        {{ mapMessage }}
      </p>
    </div>
  </div>
</template>
