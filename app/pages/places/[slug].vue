<script setup lang="ts">
import { ArrowUpRight, BookOpen, CalendarDays, Clock3, Landmark, MapPin, Navigation, Route as RouteIcon, Ticket, TrainFront, Utensils } from 'lucide-vue-next'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const { getPlaceBySlug } = usePlaces()
const { getPublicMediaUrl } = useMedia()

const { data: place, error } = await useAsyncData(`place-${slug.value}`, () => getPlaceBySlug(slug.value))

if (error.value) {
  throw createError({ statusCode: 500, statusMessage: 'Failed to load place', cause: error.value })
}

if (!place.value) {
  throw createError({ statusCode: 404, statusMessage: 'Place not found' })
}

const content = computed(() =>
  place.value?.place_translations?.find(item => item.language_code === 'en')
  ?? place.value?.place_translations?.[0],
)

const areaName = computed(() =>
  place.value?.areas?.area_translations?.find(item => item.language_code === 'en')?.name
  ?? place.value?.areas?.area_translations?.[0]?.name
  ?? place.value?.areas?.slug,
)

const placeDescription = computed(() => content.value?.description || content.value?.summary || null)
const galleryImages = computed(() => {
  const images = (place.value?.media ?? [])
    .map(image => ({
      src: getPublicMediaUrl(image.storage_path),
      alt: image.alt_text ?? content.value?.name ?? 'Place image',
      sourceProvider: image.source_provider,
      sourceUrl: image.source_url,
      licenseCode: image.license_code,
      attributionText: image.attribution_text,
      attributionRequired: image.attribution_required,
    }))
    .filter((image): image is {
      src: string
      alt: string
      sourceProvider: string | null
      sourceUrl: string | null
      licenseCode: string | null
      attributionText: string | null
      attributionRequired: boolean
    } => Boolean(image.src))

  if (images.length) return images

  return []
})
const placeTypeLabel = computed(() => place.value?.place_type.replaceAll('_', ' ') ?? 'Place')

const formatOpeningHours = (hours: unknown) => {
  if (!hours) return null
  if (typeof hours === 'string') return hours
  if (Array.isArray(hours)) return hours.filter(item => typeof item === 'string').join(' · ') || null
  if (typeof hours === 'object') {
    const entries = Object.entries(hours as Record<string, unknown>)
      .filter(([, value]) => typeof value === 'string')
      .map(([day, value]) => `${day}: ${value}`)
    return entries.join(' · ') || null
  }
  return null
}

const signatureMenuItems = computed(() => {
  const signatureMenu = content.value?.signature_menu

  if (!Array.isArray(signatureMenu)) return []

  return signatureMenu
    .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    .map(item => item.trim())
    .slice(0, 3)
})

const visitInformation = computed(() => {
  const openingHours = formatOpeningHours(place.value?.opening_hours)
  const regularClosedDays = place.value?.regular_closed_days?.trim()
  const admissionInfo = content.value?.admission_info?.trim()
  const gettingThere = content.value?.getting_there?.trim()
  const isFoodOrCafe = ['cafe', 'restaurant'].includes(place.value?.place_type ?? '')

  return [
    openingHours ? { label: 'Hours', value: openingHours, icon: Clock3 } : null,
    regularClosedDays ? { label: 'Closed', value: regularClosedDays, icon: CalendarDays } : null,
    admissionInfo ? { label: 'Admission', value: admissionInfo, icon: Ticket } : null,
    gettingThere ? { label: 'Getting there', value: gettingThere, icon: TrainFront } : null,
    isFoodOrCafe && signatureMenuItems.value.length
      ? { label: 'Signature menu', value: signatureMenuItems.value.join(' · '), icon: Utensils }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item))
})

const parseCoordinates = (location: unknown) => {
  const fromCoordinates = (coordinates: unknown): { latitude: number, longitude: number } | null => {
    if (!Array.isArray(coordinates) || coordinates.length < 2) return null
    const [longitude, latitude] = coordinates
    return typeof latitude === 'number' && typeof longitude === 'number' ? { latitude, longitude } : null
  }

  if (location && typeof location === 'object') {
    const candidate = location as { coordinates?: unknown }
    return fromCoordinates(candidate.coordinates)
  }

  if (typeof location === 'string') {
    const point = location.match(/POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i)
    if (point) return { longitude: Number(point[1]), latitude: Number(point[2]) }

    try {
      return fromCoordinates((JSON.parse(location) as { coordinates?: unknown }).coordinates)
    }
    catch {
      return null
    }
  }

  return null
}

const coordinates = computed(() => parseCoordinates(place.value?.location))
const addressText = computed(() => content.value?.address_text ?? null)
const placeName = computed(() => content.value?.name ?? 'Place')
const coordinateQuery = computed(() => coordinates.value
  ? `${coordinates.value.latitude},${coordinates.value.longitude}`
  : null)
const placeQuery = computed(() => [placeName.value, addressText.value].filter(Boolean).join(', ') || null)
const requestUrl = useRequestURL()
const naverAppName = computed(() => import.meta.client ? window.location.origin : requestUrl.origin)

// Reserved for a future Locorea locale; leaving it null lets Google choose the visitor's language.
const googleMapsLanguage: string | null = null
const withGoogleMapsLanguage = (url: URL) => {
  if (googleMapsLanguage) url.searchParams.set('hl', googleMapsLanguage)
  return url.toString()
}

const googleMapsUrl = computed(() => {
  const query = coordinateQuery.value ?? placeQuery.value
  if (!query) return null

  const url = new URL('https://www.google.com/maps/search/')
  url.searchParams.set('api', '1')
  url.searchParams.set('query', query)
  return withGoogleMapsLanguage(url)
})
const mapEmbedUrl = computed(() => {
  const query = coordinateQuery.value ?? placeQuery.value
  if (!query) return null

  const url = new URL('https://www.google.com/maps')
  url.searchParams.set('q', query)
  url.searchParams.set('output', 'embed')
  return withGoogleMapsLanguage(url)
})
const naverMapsUrl = computed(() => {
  if (place.value?.naver_map_url) return place.value.naver_map_url
  if (!coordinateQuery.value) return null
  return `https://map.naver.com/p/search/${encodeURIComponent(`${placeName.value} ${coordinateQuery.value}`)}`
})
const naverPlaceUrl = computed(() => {
  if (!coordinates.value) return null
  const { latitude, longitude } = coordinates.value
  return `nmap://place?lat=${latitude}&lng=${longitude}&name=${encodeURIComponent(placeName.value)}&appname=${encodeURIComponent(naverAppName.value)}`
})
const buildKakaoMapUrl = (name: string, latitude: number, longitude: number, action: 'map' | 'directions' = 'map') =>
  `https://map.kakao.com/link/${action === 'directions' ? 'to' : 'map'}/${encodeURIComponent(name)},${latitude},${longitude}`

const kakaoMapsUrl = computed(() => {
  if (place.value?.kakao_map_url) return place.value.kakao_map_url
  if (!coordinates.value) return null
  const { latitude, longitude } = coordinates.value
  return buildKakaoMapUrl(placeName.value, latitude, longitude)
})
const naverTransitUrl = computed(() => {
  if (!coordinates.value) return null
  const { latitude, longitude } = coordinates.value
  return `nmap://route/public?dlat=${latitude}&dlng=${longitude}&dname=${encodeURIComponent(placeName.value)}&appname=${encodeURIComponent(naverAppName.value)}`
})
const hasLocation = computed(() => Boolean(mapEmbedUrl.value || googleMapsUrl.value || naverPlaceUrl.value || kakaoMapsUrl.value))

const isNaverAppCapable = () => import.meta.client && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

const openNaverUrl = (url: string | null) => {
  if (!import.meta.client || !url) return

  if (!isNaverAppCapable()) {
    if (naverMapsUrl.value) window.open(naverMapsUrl.value, '_blank', 'noopener')
    return
  }

  window.location.assign(url)
  window.setTimeout(() => {
    if (document.visibilityState === 'visible' && naverMapsUrl.value) window.location.assign(naverMapsUrl.value)
  }, 900)
}

const openNaverMap = () => openNaverUrl(naverPlaceUrl.value)
const openNaverTransitDirections = () => openNaverUrl(naverTransitUrl.value)

const getTagName = (tag: { slug: string, tag_translations: Array<{ language_code: string, name: string }> }) =>
  tag.tag_translations.find(item => item.language_code === 'en')?.name
  ?? tag.tag_translations[0]?.name
  ?? tag.slug

const getRouteTranslation = (item: { route_translations: Array<{ language_code: string, name: string, summary: string | null }> }) =>
  item.route_translations.find(translation => translation.language_code === 'en')
  ?? item.route_translations[0]

const getGuideTranslation = (item: { guide_translations: Array<{ language_code: string, title: string, summary: string | null }> }) =>
  item.guide_translations.find(translation => translation.language_code === 'en')
  ?? item.guide_translations[0]

const formatVerifiedDate = (value: string) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(new Date(value))

const hasProvenance = computed(() => Boolean(
  place.value?.sources
  || place.value?.last_verified_at
))

useSeoMeta({
  title: () => content.value ? `${content.value.name} — Locorea` : 'Place — Locorea',
  description: () => content.value?.summary ?? '',
})
</script>

<template>
  <main v-if="place" class="mx-auto max-w-7xl px-5 pt-8 sm:pt-10 lg:px-8 lg:pt-8" :class="hasProvenance ? 'pb-8 sm:pb-9 lg:pb-9' : 'pb-14 sm:pb-16 lg:pb-20'">
    <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-x-2 text-[15px] text-slate-500 sm:text-base">
      <NuxtLink to="/search?type=places" class="transition hover:text-blue-700">Places</NuxtLink>
      <span aria-hidden="true">/</span>
      <span>{{ areaName ?? 'Korea' }}</span>
    </nav>

    <section class="mt-5 grid gap-6 sm:mt-6 sm:gap-8 lg:mt-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-start lg:gap-12 xl:gap-14" aria-label="Place overview">
      <PlaceMediaGallery v-if="galleryImages.length" :images="galleryImages" />
      <div v-else class="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100/80 text-slate-400"><Landmark :size="30" :stroke-width="1.4" aria-hidden="true" /></div>

      <header class="max-w-xl">
        <div class="flex items-start justify-between gap-4">
          <p class="text-sm font-semibold uppercase tracking-[0.08em] text-blue-700">
            {{ placeTypeLabel }}<span v-if="areaName" class="normal-case tracking-normal text-slate-400"> · {{ areaName }}</span>
          </p>
          <ContentActions content-type="place" :title="content?.name ?? 'Place'" :text="placeDescription" />
        </div>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{{ content?.name }}</h1>
        <p v-if="placeDescription" class="mt-4 text-[17px] leading-7 text-slate-600 sm:text-lg">{{ placeDescription }}</p>
        <div v-if="addressText" class="mt-5 flex gap-3 text-[15px] leading-6 text-slate-600">
          <MapPin :size="20" class="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
          <p>{{ addressText }}</p>
        </div>
        <dl v-if="visitInformation.length" class="mt-5 max-w-lg border-t border-slate-100 pt-4">
          <div v-for="item in visitInformation" :key="item.label" class="grid grid-cols-[1.75rem_9.25rem_minmax(0,1fr)] items-start gap-x-2.5 py-1.5 leading-6">
            <component :is="item.icon" :size="18" class="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
            <dt class="text-[15px] font-semibold text-slate-500">{{ item.label }}</dt>
            <dd class="min-w-0 text-[16px] font-medium text-slate-800">{{ item.value }}</dd>
          </div>
        </dl>
      </header>
    </section>

    <div class="mt-10 space-y-10 sm:mt-11 sm:space-y-12 lg:mt-12 lg:space-y-14">
      <section v-if="content?.local_tip" class="rounded-2xl border border-blue-100 bg-blue-50/70 p-5" aria-label="Locorea tip">
        <p class="text-[17px] font-semibold leading-6 text-blue-700">Locorea tip</p>
        <p class="mt-2 text-[17px] leading-7 text-slate-700 sm:text-lg">{{ content.local_tip }}</p>
      </section>

      <section v-if="hasLocation" aria-labelledby="location-heading">
        <PublicSectionHeading eyebrow="Find your way" title="Location" heading-id="location-heading" />
        <div class="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          <iframe v-if="mapEmbedUrl" :src="mapEmbedUrl" :title="`${placeName} on Google Maps`" class="h-[280px] w-full border-0 sm:h-[340px] lg:h-[400px]" loading="lazy" referrerpolicy="no-referrer-when-downgrade" />
          <div v-else class="flex h-[280px] items-center justify-center text-slate-400 sm:h-[340px] lg:h-[400px]"><MapPin :size="28" :stroke-width="1.4" aria-hidden="true" /></div>
        </div>
        <div v-if="googleMapsUrl || naverPlaceUrl || kakaoMapsUrl || naverTransitUrl" class="mt-5 flex flex-wrap items-center justify-start gap-2 sm:mt-6 sm:justify-end">
          <a v-if="googleMapsUrl" :href="googleMapsUrl" target="_blank" rel="noreferrer" aria-label="Open in Google Maps" title="Open in Google Maps" class="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><img src="/map-providers/google-maps-logo.svg" alt="" class="h-[18px] w-auto" /></a>
          <button v-if="naverPlaceUrl" type="button" aria-label="Open in Naver Map" title="Open in Naver Map" class="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" @click="openNaverMap"><img src="/map-providers/naver-logo-green.png" alt="" class="h-[16px] w-auto" /><span class="text-sm font-medium text-slate-700">Map</span></button>
          <a v-if="kakaoMapsUrl" :href="kakaoMapsUrl" target="_blank" rel="noreferrer" aria-label="Open in Kakao Map" title="Open in Kakao Map" class="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><MapPin :size="16" aria-hidden="true" />Kakao Map</a>
          <button v-if="naverTransitUrl" type="button" aria-label="Open transit directions in Naver Map" title="Open transit directions in Naver Map" class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" @click="openNaverTransitDirections"><Navigation :size="16" aria-hidden="true" />Transit directions</button>
        </div>
      </section>

      <section v-if="place.relatedRoutes.length" aria-labelledby="routes-heading">
        <PublicSectionHeading eyebrow="Continue exploring" title="Related routes" heading-id="routes-heading" />
        <div class="mt-6 grid gap-3" :class="place.relatedRoutes.length === 1 ? 'max-w-xl' : 'sm:auto-rows-fr sm:grid-cols-2'">
          <NuxtLink v-for="relatedRoute in place.relatedRoutes" :key="relatedRoute.id" :to="`/routes/${relatedRoute.slug}`" class="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><div class="flex items-start justify-between gap-3"><RouteIcon :size="20" class="shrink-0 text-blue-700" aria-hidden="true" /><ArrowUpRight :size="18" class="shrink-0 text-slate-400 transition group-hover:text-blue-700" aria-hidden="true" /></div><h3 class="mt-4 font-semibold text-slate-950">{{ getRouteTranslation(relatedRoute)?.name }}</h3><p v-if="getRouteTranslation(relatedRoute)?.summary" class="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-600">{{ getRouteTranslation(relatedRoute)?.summary }}</p><p class="mt-auto pt-3 text-xs font-medium text-slate-500"><span v-if="relatedRoute.duration_minutes">{{ relatedRoute.duration_minutes }} min</span><span v-if="relatedRoute.distance_km"> · {{ relatedRoute.distance_km }} km</span></p></NuxtLink>
        </div>
      </section>

      <section v-if="place.relatedGuides.length" aria-labelledby="guides-heading">
        <PublicSectionHeading eyebrow="Useful before you go" title="Related guides" heading-id="guides-heading" />
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <NuxtLink v-for="guide in place.relatedGuides" :key="guide.id" :to="`/guides/${guide.slug}`" class="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><div class="flex items-start justify-between gap-3"><BookOpen :size="20" class="shrink-0 text-blue-700" aria-hidden="true" /><ArrowUpRight :size="18" class="shrink-0 text-slate-400 transition group-hover:text-blue-700" aria-hidden="true" /></div><h3 class="mt-4 font-semibold text-slate-950">{{ getGuideTranslation(guide)?.title }}</h3><p v-if="getGuideTranslation(guide)?.summary" class="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-600">{{ getGuideTranslation(guide)?.summary }}</p></NuxtLink>
        </div>
      </section>

      <section v-if="place.tags.length" aria-labelledby="themes-heading">
        <PublicSectionHeading eyebrow="Explore more" title="Themes" heading-id="themes-heading" />
        <div class="mt-6 flex flex-wrap gap-2"><NuxtLink v-for="tag in place.tags" :key="tag.id" :to="`/search?tag=${encodeURIComponent(tag.slug)}`" class="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">{{ getTagName(tag) }}</NuxtLink></div>
      </section>

      <section v-if="hasProvenance" class="-mt-2 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500 sm:-mt-3 lg:-mt-4" aria-label="Information provenance">
        <p class="flex flex-wrap items-baseline justify-end gap-x-1.5 gap-y-0.5">
          <span v-if="place.sources">Source: <span class="font-medium text-slate-600">{{ place.sources.name }}</span></span>
          <span v-if="place.sources && place.last_verified_at" aria-hidden="true">·</span>
          <span v-if="place.last_verified_at">Verified {{ formatVerifiedDate(place.last_verified_at) }}</span>
        </p>
      </section>
    </div>
  </main>
</template>
