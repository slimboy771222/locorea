<script setup lang="ts">
import { ArrowUpRight, Clock3, Gauge, Landmark, Route as RouteIcon, Ruler } from 'lucide-vue-next'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const { getRouteBySlug } = useRoutes()
const { getPublicMediaUrl } = useMedia()

const { data: routeData, error } = await useAsyncData(`route-${slug.value}`, () => getRouteBySlug(slug.value))

if (error.value) {
  throw createError({ statusCode: 500, statusMessage: 'Failed to load route', cause: error.value })
}

if (!routeData.value) {
  throw createError({ statusCode: 404, statusMessage: 'Route not found' })
}

const content = computed(() =>
  routeData.value?.route_translations?.find(item => item.language_code === 'en')
  ?? routeData.value?.route_translations?.[0],
)

const areaName = computed(() =>
  routeData.value?.areas?.area_translations?.find(item => item.language_code === 'en')?.name
  ?? routeData.value?.areas?.area_translations?.[0]?.name
  ?? routeData.value?.areas?.slug,
)

const routeCoverUrl = computed(() => getPublicMediaUrl(routeData.value?.cover?.storage_path))
const routeCoverAlt = computed(() => routeData.value?.cover?.alt_text ?? content.value?.name ?? 'Route cover image')
const routeTypeLabel = computed(() => routeData.value?.route_type.replaceAll('_', ' ') ?? 'Route')

const formatDuration = (minutes: number | null | undefined) => {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (!hours) return `${minutes} min`
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`
}

const titleCase = (value: string | null | undefined) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : null

const routeMeta = computed(() => {
  if (!routeData.value) return []

  return [
    { label: 'Stops', value: `${routeData.value.route_places.length} ${routeData.value.route_places.length === 1 ? 'stop' : 'stops'}`, icon: RouteIcon },
    formatDuration(routeData.value.duration_minutes) ? { label: 'Duration', value: formatDuration(routeData.value.duration_minutes)!, icon: Clock3 } : null,
    routeData.value.distance_km !== null ? { label: 'Distance', value: `${routeData.value.distance_km} km`, icon: Ruler } : null,
    titleCase(routeData.value.difficulty) ? { label: 'Difficulty', value: titleCase(routeData.value.difficulty)!, icon: Gauge } : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item))
})

const getPlaceTranslation = (place: { place_translations: Array<{ language_code: string, name: string, summary: string | null }> }) =>
  place.place_translations.find(item => item.language_code === 'en')
  ?? place.place_translations[0]

const getStopCoverUrl = (stop: { places: { cover: { storage_path: string } | null } | null }) =>
  getPublicMediaUrl(stop.places?.cover?.storage_path)

const failedStopCovers = ref<Record<number, boolean>>({})

const markStopCoverAsFailed = (stopOrder: number) => {
  failedStopCovers.value = { ...failedStopCovers.value, [stopOrder]: true }
}

const getTagName = (tag: { slug: string, tag_translations: Array<{ language_code: string, name: string }> }) =>
  tag.tag_translations.find(item => item.language_code === 'en')?.name
  ?? tag.tag_translations[0]?.name
  ?? tag.slug

const formatVerifiedDate = (value: string) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(new Date(value))

useSeoMeta({
  title: () => content.value ? `${content.value.name} — Locorea` : 'Route — Locorea',
  description: () => content.value?.summary ?? '',
})
</script>

<template>
  <main v-if="routeData" class="mx-auto max-w-7xl px-5 py-8 sm:py-10 lg:px-8 lg:py-12">
      <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
        <NuxtLink to="/search?type=routes" class="transition hover:text-blue-700">Routes</NuxtLink>
        <span aria-hidden="true">/</span>
        <span>{{ areaName ?? 'Korea' }}</span>
      </nav>

      <header class="mt-5 max-w-3xl">
        <div class="flex items-start justify-between gap-4">
          <p class="text-sm font-semibold uppercase tracking-[0.08em] text-blue-700">
            {{ routeTypeLabel }}<span v-if="areaName" class="normal-case tracking-normal text-slate-400"> · {{ areaName }}</span>
          </p>
          <ContentActions content-type="route" :title="content?.name ?? 'Route'" :text="content?.summary" />
        </div>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{{ content?.name }}</h1>
        <p v-if="content?.summary" class="mt-4 max-w-2xl text-[17px] leading-7 text-slate-600 sm:text-lg">{{ content.summary }}</p>
      </header>

      <dl class="mt-6 flex flex-wrap gap-2.5">
        <div v-for="item in routeMeta" :key="item.label" class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <component :is="item.icon" :size="17" class="shrink-0 text-blue-700" aria-hidden="true" />
          <div>
            <dt class="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400">{{ item.label }}</dt>
            <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ item.value }}</dd>
          </div>
        </div>
      </dl>

      <section
        class="relative mt-7 overflow-hidden rounded-2xl bg-slate-100 sm:mt-8"
        :class="routeCoverUrl ? 'aspect-[4/3] sm:aspect-[16/8] lg:aspect-[16/7]' : 'h-[210px] sm:h-[240px] lg:h-[280px]'"
        aria-label="Route media"
      >
        <img v-if="routeCoverUrl" :src="routeCoverUrl" :alt="routeCoverAlt" class="h-full w-full object-cover">
        <div v-else class="flex h-full items-center justify-center bg-slate-100/80 text-slate-400">
          <RouteIcon :size="32" :stroke-width="1.4" aria-hidden="true" />
        </div>
        <p v-if="routeData.cover?.credit_text" class="absolute bottom-3 right-3 rounded-md bg-slate-950/55 px-2 py-1 text-xs text-white/90">{{ routeData.cover.credit_text }}</p>
      </section>

      <div class="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
        <div class="min-w-0 space-y-8 sm:space-y-9">
          <article v-if="content?.description" class="max-w-3xl" aria-labelledby="overview-heading">
            <PublicSectionHeading eyebrow="Before you start" title="Route overview" heading-id="overview-heading" />
            <p class="mt-6 whitespace-pre-line text-[16px] leading-7 text-slate-700">{{ content.description }}</p>
          </article>

          <section v-if="routeData.route_places.length" aria-labelledby="stops-heading">
            <PublicSectionHeading eyebrow="Follow the route" title="Stops in order" heading-id="stops-heading" />
            <ol class="mt-6 max-w-4xl">
              <li v-for="(stop, index) in routeData.route_places" :key="stop.stop_order" class="relative flex gap-3.5 pb-5 last:pb-0 sm:gap-4 sm:pb-6">
                <div class="flex w-8 shrink-0 flex-col items-center">
                  <span class="grid size-8 place-items-center rounded-full bg-blue-600 text-xs font-semibold tracking-[0.04em] text-white">{{ String(stop.stop_order).padStart(2, '0') }}</span>
                  <span v-if="index < routeData.route_places.length - 1" class="my-2 w-px flex-1 bg-slate-200" aria-hidden="true" />
                </div>
                <NuxtLink v-if="stop.places" :to="`/places/${stop.places.slug}`" class="group min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:p-4">
                  <div class="flex gap-3 sm:gap-4">
                    <div class="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400 sm:size-[76px]">
                      <img v-if="getStopCoverUrl(stop) && !failedStopCovers[stop.stop_order]" :src="getStopCoverUrl(stop) ?? undefined" :alt="getPlaceTranslation(stop.places)?.name ?? 'Place cover image'" class="h-full w-full object-cover" @error="markStopCoverAsFailed(stop.stop_order)">
                      <Landmark v-else :size="20" :stroke-width="1.5" aria-hidden="true" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <p class="text-xs font-semibold uppercase tracking-[0.07em] text-slate-400">{{ stop.places.place_type.replaceAll('_', ' ') }}</p>
                          <h3 class="mt-1 text-[17px] font-semibold text-slate-950 transition group-hover:text-blue-700">{{ getPlaceTranslation(stop.places)?.name }}</h3>
                        </div>
                        <ArrowUpRight :size="17" class="mt-0.5 shrink-0 text-slate-400 transition group-hover:text-blue-700" aria-hidden="true" />
                      </div>
                      <p v-if="getPlaceTranslation(stop.places)?.summary" class="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-600">{{ getPlaceTranslation(stop.places)?.summary }}</p>
                      <p v-if="stop.note" class="mt-3 border-t border-slate-100 pt-3 text-sm leading-5 text-slate-600">{{ stop.note }}</p>
                      <div v-if="stop.stay_minutes || stop.travel_minutes_to_next" class="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                        <span v-if="stop.stay_minutes" class="rounded-md bg-slate-50 px-2 py-1">Stay <span aria-hidden="true">·</span> {{ stop.stay_minutes }} min</span>
                        <span v-if="stop.travel_minutes_to_next" class="rounded-md bg-slate-50 px-2 py-1">Next stop <span aria-hidden="true">·</span> {{ stop.travel_minutes_to_next }} min</span>
                      </div>
                    </div>
                  </div>
                </NuxtLink>
                <p v-else class="min-w-0 flex-1 py-2 text-sm text-slate-500">This stop is no longer available.</p>
              </li>
            </ol>
          </section>

          <section v-if="routeData.tags.length" aria-labelledby="themes-heading">
            <PublicSectionHeading eyebrow="Explore more" title="Themes" heading-id="themes-heading" />
            <div class="mt-6 flex flex-wrap gap-2">
              <NuxtLink v-for="tag in routeData.tags" :key="tag.id" :to="`/search?tag=${encodeURIComponent(tag.slug)}`" class="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">{{ getTagName(tag) }}</NuxtLink>
            </div>
          </section>
        </div>

        <aside class="lg:pt-1">
          <div v-if="routeData.sources || routeData.last_verified_at" class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 lg:sticky lg:top-24">
            <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Trust & source</p>
            <dl class="mt-3 space-y-3 text-sm">
              <div v-if="routeData.sources"><dt class="text-slate-500">Source</dt><dd class="mt-1 font-medium text-slate-800">{{ routeData.sources.name }}</dd></div>
              <div v-if="routeData.last_verified_at"><dt class="text-slate-500">Last verified</dt><dd class="mt-1 font-medium text-slate-800">{{ formatVerifiedDate(routeData.last_verified_at) }}</dd></div>
            </dl>
            <a v-if="routeData.sources?.url" :href="routeData.sources.url" target="_blank" rel="noreferrer" class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition hover:text-blue-800">View source <ArrowUpRight :size="15" aria-hidden="true" /></a>
          </div>
        </aside>
      </div>
  </main>
</template>
