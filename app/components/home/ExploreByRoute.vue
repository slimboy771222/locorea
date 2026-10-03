<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'

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
  duration_minutes: number | null
  distance_km: number | null
  difficulty: string | null
  route_translations: Translation[]
  route_places: Stop[]
  cover: {
    storage_path: string
    alt_text: string | null
    credit_text: string | null
  } | null
}

const props = defineProps<{
  routes: Route[]
  pending: boolean
  failed: boolean
}>()

const { getPublicMediaUrl } = useMedia()

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

const getStopPreview = (route: Route) => {
  const names = route.route_places
    .slice(0, 3)
    .map(stop => {
      const translations = stop.places?.place_translations ?? []
      const translation = translations.find(item => item.language_code === 'en') ?? translations[0]

      return translation?.name ?? stop.places?.slug ?? 'Stop'
    })

  return {
    names,
    remaining: Math.max(route.route_places.length - names.length, 0),
  }
}

const getCoverAlt = (route: Route) => {
  return route.cover?.alt_text ?? getTranslation(route.route_translations)?.name ?? 'Explore this route'
}
</script>

<template>
  <section v-if="props.pending || (!props.failed && props.routes.length)" class="bg-slate-50/70">
    <div class="mx-auto max-w-7xl px-5 py-9 sm:py-10 lg:px-8 lg:py-14">
      <div class="mb-5 flex items-end justify-between gap-4">
        <div>
          <p class="text-sm font-medium text-blue-700">Plan less, explore more</p>
          <h2 class="mt-1 text-[22px] font-bold tracking-tight text-slate-950 md:text-[26px]">Explore by Route</h2>
          <p class="mt-1 text-[15px] leading-6 text-slate-600">Ready-made ways to spend a few hours exploring Korea.</p>
        </div>
        <NuxtLink to="/search?type=routes" class="shrink-0 text-sm font-medium text-blue-700 transition hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          View all routes <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>

      <div v-if="props.pending" class="flex gap-4 overflow-hidden" aria-label="Loading curated routes">
        <div v-for="index in 3" :key="index" class="h-64 min-w-[84vw] animate-pulse rounded-2xl bg-white sm:min-w-0 sm:flex-1" />
      </div>

      <div v-else class="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        <NuxtLink
          v-for="route in props.routes"
          :key="route.id"
          :to="`/routes/${route.slug}`"
          class="group flex min-w-[84vw] snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:min-w-0"
        >
          <img
            v-if="route.cover"
            :src="getPublicMediaUrl(route.cover.storage_path) ?? undefined"
            :alt="getCoverAlt(route)"
            class="aspect-[16/7] w-full object-cover"
          >

          <div class="flex flex-1 flex-col p-4">
            <h3 class="text-[17px] font-semibold leading-6 text-slate-950">{{ getTranslation(route.route_translations)?.name ?? 'Explore this route' }}</h3>
            <p class="mt-2 line-clamp-2 text-[15px] leading-5 text-slate-600">{{ getTranslation(route.route_translations)?.summary ?? 'A thoughtful way to explore Korea.' }}</p>

            <div class="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-[13px] font-medium text-slate-500">
              <span>{{ route.route_places.length }} {{ route.route_places.length === 1 ? 'stop' : 'stops' }}</span>
              <span v-if="formatDuration(route.duration_minutes)">· {{ formatDuration(route.duration_minutes) }}</span>
              <span v-if="formatDistance(route.distance_km)">· {{ formatDistance(route.distance_km) }}</span>
              <span v-if="formatDifficulty(route.difficulty)">· {{ formatDifficulty(route.difficulty) }}</span>
            </div>

            <div v-if="getStopPreview(route).names.length" class="mt-4 border-t border-slate-100 pt-3 text-[13px] leading-5 text-slate-600">
              <span>{{ getStopPreview(route).names.join(' → ') }}</span>
              <span v-if="getStopPreview(route).remaining"> → +{{ getStopPreview(route).remaining }} more</span>
            </div>

            <span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-700">
              View route <ArrowUpRight :size="17" class="text-slate-400 transition group-hover:text-blue-700" aria-hidden="true" />
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
