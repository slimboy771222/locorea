<script setup lang="ts">
import type { NaverMapInstance } from '~/composables/useNaverMaps'
import type { EmergencyFacility } from '~/types/emergency'

type Coordinates = { latitude: number, longitude: number }

const props = defineProps<{
  userLocation: Coordinates | null
  facilities: EmergencyFacility[]
  selectedSourceId: string | null
  clientId: string
}>()

const emit = defineEmits<{ select: [facility: EmergencyFacility] }>()
const { loadNaverMaps } = useNaverMaps()
const mapElement = ref<HTMLElement | null>(null)
const map = ref<NaverMapInstance | null>(null)
const mapMessage = ref<string | null>(null)
const isInitializing = ref(false)
let markers: Array<{ setMap: (map: unknown) => void }> = []
let resizeObserver: ResizeObserver | null = null

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

  props.facilities.forEach((facility) => {
    const selected = facility.sourceId === props.selectedSourceId
    const size = selected ? 38 : 34
    const position = new maps.LatLng(facility.latitude, facility.longitude)
    const marker = new maps.Marker({
      map: map.value,
      position,
      icon: { content: `<span aria-label="Emergency medical facility" style="display:grid;width:${size}px;height:${size}px;place-items:center;border:${selected ? 3 : 2}px solid white;border-radius:999px;background:${selected ? '#b91c1c' : '#dc2626'};color:white;font-size:${selected ? 19 : 17}px;font-weight:700;line-height:1;box-shadow:${selected ? '0 2px 8px rgba(15,23,42,.48)' : '0 1px 4px rgba(15,23,42,.35)'}">✚</span>` },
    })
    maps.Event.addListener(marker, 'click', () => {
      map.value?.setCenter(position)
      emit('select', facility)
    })
    markers.push(marker)
  })
}

const resizeMap = () => {
  if (!map.value || !mapElement.value || !window.naver?.maps) return
  const { width, height } = mapElement.value.getBoundingClientRect()
  if (width > 0 && height > 0) map.value.setSize(new window.naver.maps.Size(width, height))
}

const initialize = async () => {
  if (!import.meta.client || map.value || isInitializing.value || !props.userLocation) return
  if (!props.clientId) {
    mapMessage.value = 'NAVER Maps is not configured. Add NUXT_PUBLIC_NAVER_MAPS_CLIENT_ID to view the map.'
    return
  }
  await nextTick()
  if (!mapElement.value) return
  isInitializing.value = true
  try {
    const naver = await loadNaverMaps(props.clientId)
    if (!mapElement.value || !props.userLocation) return
    map.value = new naver.maps.Map(mapElement.value, { center: new naver.maps.LatLng(props.userLocation.latitude, props.userLocation.longitude), zoom: 14, minZoom: 10, zoomControl: true, mapTypeControl: false })
    renderMarkers()
    resizeObserver = new ResizeObserver(resizeMap)
    resizeObserver.observe(mapElement.value)
    resizeMap()
  }
  catch {
    mapMessage.value = 'NAVER Maps could not load. Check the map configuration and allowed domain.'
  }
  finally {
    isInitializing.value = false
  }
}

watch(() => props.userLocation, () => { void initialize() })
watch(() => [props.facilities, props.selectedSourceId], () => renderMarkers(), { deep: true })
onMounted(() => { void initialize() })
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  markers.forEach(marker => marker.setMap(null))
})
</script>

<template>
  <div class="relative h-full min-h-[320px] overflow-hidden bg-slate-100">
    <div id="emergency-map" ref="mapElement" class="h-full min-h-[320px] w-full"></div>
    <div v-if="mapMessage" class="absolute inset-0 z-10 grid place-items-center p-6 text-center text-sm leading-6 text-slate-600"><p class="max-w-sm rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm">{{ mapMessage }}</p></div>
  </div>
</template>
