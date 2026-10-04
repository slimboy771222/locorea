<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

type Translation = {
  language_code: string
  name: string
  summary: string | null
}

type Stop = {
  stop_order: number
  places: {
    slug: string
    place_translations: Array<{
      language_code: string
      name: string
    }>
  } | null
}

type Route = {
  id: string
  slug: string
  route_type: string
  duration_minutes: number | null
  distance_km: number | null
  difficulty: string | null
  route_translations: Translation[]
  route_places: Stop[]
}

const props = defineProps<{
  routes: Route[]
  pending: boolean
  failed: boolean
}>()

const getTranslation = (translations: Translation[]) => {
  return translations.find(item => item.language_code === 'en') ?? translations[0]
}

const formatDuration = (minutes: number | null) => {
  if (!minutes) {
    return null
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (!hours) {
    return `${minutes} min`
  }

  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`
}

const formatDistance = (distance: number | null) => {
  if (distance === null) {
    return null
  }

  return `${distance} km`
}

const formatDifficulty = (difficulty: string | null) => {
  return difficulty ? `${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}` : null
}

const formatRouteType = (routeType: string) => {
  return routeType.replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase())
}

const getStopPreview = (route: Route) => {
  const stops = route.route_places
    .slice(0, 3)
    .map((stop, index) => {
      const translations = stop.places?.place_translations ?? []
      const translation = translations.find(item => item.language_code === 'en') ?? translations[0]

      return {
        key: `${stop.stop_order}-${index}`,
        name: translation?.name ?? stop.places?.slug ?? 'Stop',
      }
    })

  return {
    stops,
    remaining: Math.max(route.route_places.length - stops.length, 0),
  }
}
</script>

<template>
  <section v-if="props.pending || (!props.failed && props.routes.length)" class="bg-[var(--lc-surface-route)]">
    <div class="mx-auto max-w-7xl px-5 py-9 sm:py-10 lg:px-8 lg:py-14">
      <div class="mb-5 flex items-end justify-between gap-4">
        <div>
          <p class="text-sm font-medium text-blue-700">Plan less, explore more</p>
          <h2 class="mt-1 text-[22px] font-bold tracking-tight text-slate-950 md:text-[26px]">Explore by Route</h2>
          <p class="mt-1 hidden text-[15px] leading-6 text-slate-600 sm:block">Ready-made ways to spend a few hours exploring Korea.</p>
        </div>
        <NuxtLink to="/search?type=routes" class="shrink-0 text-sm font-medium text-blue-700 transition hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          View all <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>

      <div v-if="props.pending" class="w-[calc(100%+1.25rem)] flex gap-4 overflow-hidden sm:w-auto sm:grid sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading curated routes">
        <div v-for="index in 3" :key="index" class="h-[242px] w-[86vw] shrink-0 animate-pulse rounded-2xl bg-white sm:w-auto" />
      </div>

      <div v-else class="w-[calc(100%+1.25rem)] flex snap-x snap-proximity gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-auto sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
        <NuxtLink
          v-for="route in props.routes"
          :key="route.id"
          :to="`/routes/${route.slug}`"
          class="group flex w-[86vw] shrink-0 snap-start flex-col rounded-2xl border border-slate-200 bg-white p-4 outline-none transition hover:-translate-y-0.5 hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
        >
          <h3 class="text-[17px] font-semibold leading-6 text-slate-950">{{ getTranslation(route.route_translations)?.name ?? 'Explore this route' }}</h3>

          <div class="mt-2.5 flex flex-wrap gap-x-1.5 gap-y-1 text-[13px] font-medium text-slate-500">
            <span v-if="formatDuration(route.duration_minutes)">{{ formatDuration(route.duration_minutes) }}</span>
            <span v-if="formatDuration(route.duration_minutes) && route.route_places.length" aria-hidden="true">·</span>
            <span>{{ route.route_places.length }} {{ route.route_places.length === 1 ? 'stop' : 'stops' }}</span>
            <span v-if="formatDistance(route.distance_km)" aria-hidden="true">·</span>
            <span v-if="formatDistance(route.distance_km)">{{ formatDistance(route.distance_km) }}</span>
          </div>

          <ol v-if="getStopPreview(route).stops.length" class="mt-4 space-y-0" :aria-label="`Stops in ${getTranslation(route.route_translations)?.name ?? 'this route'}`">
            <li v-for="(stop, index) in getStopPreview(route).stops" :key="stop.key" class="relative flex gap-3 pb-2.5 last:pb-0">
              <span class="relative flex w-3 shrink-0 justify-center" aria-hidden="true">
                <span class="mt-1.5 size-2.5 rounded-full border-2 border-[var(--lc-coral-subtle)] bg-[var(--lc-coral)]" />
                <span v-if="index < getStopPreview(route).stops.length - 1" class="absolute top-5 h-[calc(100%-0.125rem)] w-px bg-slate-300" />
              </span>
              <span class="min-w-0 text-[14px] leading-5 text-slate-700">{{ stop.name }}</span>
            </li>
            <li v-if="getStopPreview(route).remaining" class="flex gap-3 pt-1 text-[13px] leading-5 text-slate-500">
              <span class="w-3 shrink-0" aria-hidden="true" />
              <span>+{{ getStopPreview(route).remaining }} more stop{{ getStopPreview(route).remaining === 1 ? '' : 's' }}</span>
            </li>
          </ol>

          <div class="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <span class="text-[13px] font-medium text-slate-600">{{ [formatDifficulty(route.difficulty), formatRouteType(route.route_type)].filter(Boolean).join(' · ') }}</span>
            <span class="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-700">
              <ArrowRight :size="17" aria-hidden="true" />
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
