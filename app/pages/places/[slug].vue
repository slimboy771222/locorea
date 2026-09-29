<script setup lang="ts">
import { ArrowUpRight, BookOpen, ExternalLink, Globe2, Landmark, MapPin, Phone, Route as RouteIcon, ShieldCheck, Tags } from 'lucide-vue-next'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const { getPlaceBySlug } = usePlaces()
const { getPublicMediaUrl } = useMedia()

const { data: place, error } = await useAsyncData(`place-${slug.value}`, () => getPlaceBySlug(slug.value))

if (error.value) {
  console.error('Failed to load place:', error.value)

  throw createError({
    statusCode: 500,
    statusMessage: 'Failed to load place',
    cause: error.value,
  })
}

if (!place.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Place not found',
  })
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

const coverImageUrl = computed(() => getPublicMediaUrl(place.value?.cover?.storage_path))
const coverAlt = computed(() => place.value?.cover?.alt_text ?? content.value?.name ?? 'Place cover image')
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

const practicalDetails = computed(() => {
  if (!place.value) return []

  const openingHours = formatOpeningHours(place.value.opening_hours)

  return [
    place.value.foreigner_friendly === true ? { label: 'Traveler friendly', value: 'Yes', icon: ShieldCheck } : null,
    place.value.phone ? { label: 'Phone', value: place.value.phone, icon: Phone } : null,
    openingHours ? { label: 'Hours', value: openingHours, icon: Globe2 } : null,
    place.value.price_level ? { label: 'Price level', value: '₩'.repeat(place.value.price_level), icon: Tags } : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item))
})

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

useSeoMeta({
  title: () => content.value ? `${content.value.name} — Locorea` : 'Place — Locorea',
  description: () => content.value?.summary ?? '',
})
</script>

<template>
  <main v-if="place" class="mx-auto max-w-7xl px-5 py-8 sm:py-10 lg:px-8 lg:py-12">
      <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
        <NuxtLink to="/search?type=places" class="transition hover:text-blue-700">Places</NuxtLink>
        <span aria-hidden="true">/</span>
        <span>{{ areaName ?? 'Korea' }}</span>
      </nav>

      <header class="mt-5 max-w-3xl">
        <p class="text-sm font-semibold uppercase tracking-[0.08em] text-blue-700">
          {{ placeTypeLabel }}<span v-if="areaName" class="normal-case tracking-normal text-slate-400"> · {{ areaName }}</span>
        </p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{{ content?.name }}</h1>
        <p v-if="content?.summary" class="mt-4 max-w-2xl text-[17px] leading-7 text-slate-600 sm:text-lg">{{ content.summary }}</p>
      </header>

      <section
        class="relative mt-7 overflow-hidden rounded-2xl bg-slate-100 sm:mt-8"
        :class="coverImageUrl ? 'aspect-[4/3] sm:aspect-[16/8] lg:aspect-[16/7]' : 'h-[220px] sm:h-[250px] lg:h-[300px]'"
        aria-label="Place media"
      >
        <img v-if="coverImageUrl" :src="coverImageUrl" :alt="coverAlt" class="h-full w-full object-cover">
        <div v-else class="flex h-full items-center justify-center bg-slate-100/80 text-slate-400">
          <Landmark :size="32" :stroke-width="1.4" aria-hidden="true" />
        </div>
        <p v-if="place.cover?.credit_text" class="absolute bottom-3 right-3 rounded-md bg-slate-950/55 px-2 py-1 text-xs text-white/90">{{ place.cover.credit_text }}</p>
      </section>

      <div class="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
        <div class="min-w-0 space-y-8 sm:space-y-9">
          <section v-if="practicalDetails.length" aria-labelledby="practical-heading">
            <p class="text-sm font-semibold text-blue-700">Plan your visit</p>
            <h2 id="practical-heading" class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Practical information</h2>
            <dl :class="practicalDetails.length === 1 ? 'mt-4 flex' : 'mt-5 grid gap-3 sm:grid-cols-2'">
              <div
                v-for="detail in practicalDetails"
                :key="detail.label"
                class="flex gap-3 rounded-xl border border-slate-200 bg-white"
                :class="practicalDetails.length === 1 ? 'w-fit p-3.5' : 'p-4'"
              >
                <component :is="detail.icon" :size="19" class="mt-0.5 shrink-0 text-blue-700" aria-hidden="true" />
                <div>
                  <dt class="text-xs font-semibold uppercase tracking-[0.07em] text-slate-400">{{ detail.label }}</dt>
                  <dd class="mt-1 text-sm leading-5 text-slate-700">{{ detail.value }}</dd>
                </div>
              </div>
            </dl>
          </section>

          <article v-if="content?.description" class="max-w-3xl" aria-labelledby="about-heading">
            <p class="text-sm font-semibold text-blue-700">A closer look</p>
            <h2 id="about-heading" class="mt-1 text-2xl font-bold tracking-tight text-slate-950">About this place</h2>
            <p class="mt-4 whitespace-pre-line text-[16px] leading-7 text-slate-700">{{ content.description }}</p>
            <div v-if="content.local_tip" class="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
              <p class="text-sm font-semibold text-blue-700">Locorea tip</p>
              <p class="mt-2 text-[15px] leading-6 text-slate-700">{{ content.local_tip }}</p>
            </div>
          </article>

          <section v-if="areaName || content?.address_text || place.naver_map_url || place.kakao_map_url" class="max-w-3xl" aria-labelledby="location-heading">
            <p class="text-sm font-semibold text-blue-700">Find your way</p>
            <h2 id="location-heading" class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Location</h2>
            <div class="mt-4 rounded-2xl bg-slate-50 p-5 sm:flex sm:items-start sm:justify-between sm:gap-6">
              <div class="flex gap-3">
                <MapPin :size="20" class="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
                <p class="text-[15px] leading-6 text-slate-700">
                  <span v-if="areaName" class="font-medium">{{ areaName }}</span>
                  <span v-if="areaName && content?.address_text"> · </span>
                  <span v-if="content?.address_text">{{ content.address_text }}</span>
                </p>
              </div>
              <div v-if="place.naver_map_url || place.kakao_map_url" class="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:shrink-0">
                <a v-if="place.naver_map_url" :href="place.naver_map_url" target="_blank" rel="noreferrer" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-blue-700">Naver Map <ExternalLink :size="15" aria-hidden="true" /></a>
                <a v-if="place.kakao_map_url" :href="place.kakao_map_url" target="_blank" rel="noreferrer" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-blue-700">Kakao Map <ExternalLink :size="15" aria-hidden="true" /></a>
              </div>
            </div>
          </section>

          <section v-if="place.tags.length" aria-labelledby="themes-heading">
            <p class="text-sm font-semibold text-blue-700">Explore more</p>
            <h2 id="themes-heading" class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Themes</h2>
            <div class="mt-4 flex flex-wrap gap-2">
              <NuxtLink v-for="tag in place.tags" :key="tag.id" :to="`/search?tag=${encodeURIComponent(tag.slug)}`" class="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">{{ getTagName(tag) }}</NuxtLink>
            </div>
          </section>

          <section v-if="place.relatedRoutes.length" aria-labelledby="routes-heading">
            <p class="text-sm font-semibold text-blue-700">Continue exploring</p>
            <h2 id="routes-heading" class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Related routes</h2>
            <div class="mt-5 grid gap-3 sm:auto-rows-fr sm:grid-cols-2">
              <NuxtLink v-for="relatedRoute in place.relatedRoutes" :key="relatedRoute.id" :to="`/routes/${relatedRoute.slug}`" class="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                <div class="flex items-start justify-between gap-3"><RouteIcon :size="20" class="shrink-0 text-blue-700" aria-hidden="true" /><ArrowUpRight :size="18" class="shrink-0 text-slate-400 transition group-hover:text-blue-700" aria-hidden="true" /></div>
                <h3 class="mt-4 font-semibold text-slate-950">{{ getRouteTranslation(relatedRoute)?.name }}</h3>
                <p v-if="getRouteTranslation(relatedRoute)?.summary" class="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-600">{{ getRouteTranslation(relatedRoute)?.summary }}</p>
                <p class="mt-auto pt-3 text-xs font-medium text-slate-500"><span v-if="relatedRoute.duration_minutes">{{ relatedRoute.duration_minutes }} min</span><span v-if="relatedRoute.distance_km"> · {{ relatedRoute.distance_km }} km</span></p>
              </NuxtLink>
            </div>
          </section>

          <section v-if="place.relatedGuides.length" aria-labelledby="guides-heading">
            <p class="text-sm font-semibold text-blue-700">Useful before you go</p>
            <h2 id="guides-heading" class="mt-1 text-2xl font-bold tracking-tight text-slate-950">Related guides</h2>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <NuxtLink v-for="guide in place.relatedGuides" :key="guide.id" :to="`/guides/${guide.slug}`" class="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
                <div class="flex items-start justify-between gap-3"><BookOpen :size="20" class="shrink-0 text-blue-700" aria-hidden="true" /><ArrowUpRight :size="18" class="shrink-0 text-slate-400 transition group-hover:text-blue-700" aria-hidden="true" /></div>
                <h3 class="mt-4 font-semibold text-slate-950">{{ getGuideTranslation(guide)?.title }}</h3>
                <p v-if="getGuideTranslation(guide)?.summary" class="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-600">{{ getGuideTranslation(guide)?.summary }}</p>
              </NuxtLink>
            </div>
          </section>
        </div>

        <aside class="lg:pt-1">
          <div v-if="place.website_url || place.sources || place.last_verified_at" class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 lg:sticky lg:top-24">
            <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Trust & source</p>
            <dl class="mt-3 space-y-3 text-sm">
              <div v-if="place.sources"><dt class="text-slate-500">Source</dt><dd class="mt-1 font-medium text-slate-800">{{ place.sources.name }}</dd></div>
              <div v-if="place.last_verified_at"><dt class="text-slate-500">Last verified</dt><dd class="mt-1 font-medium text-slate-800">{{ formatVerifiedDate(place.last_verified_at) }}</dd></div>
            </dl>
            <a v-if="place.website_url" :href="place.website_url" target="_blank" rel="noreferrer" class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition hover:text-blue-800">Official website <ExternalLink :size="15" aria-hidden="true" /></a>
            <a v-else-if="place.source_url || place.sources?.url" :href="place.source_url ?? place.sources?.url ?? undefined" target="_blank" rel="noreferrer" class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition hover:text-blue-800">View source <ExternalLink :size="15" aria-hidden="true" /></a>
          </div>
        </aside>
      </div>
  </main>
</template>
