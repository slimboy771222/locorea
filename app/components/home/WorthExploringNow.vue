<script setup lang="ts">
import { ArrowUpRight, Coffee, Landmark, ShoppingBag, Utensils } from 'lucide-vue-next'

type Translation = {
  language_code: string
  name: string
  summary: string | null
}

type Area = {
  slug: string
  area_translations: Array<{
    language_code: string
    name: string
  }>
} | null

type Place = {
  id: string
  slug: string
  place_type: string
  place_translations: Translation[]
  areas: Area
  cover: {
    storage_path: string
    alt_text: string | null
    credit_text: string | null
  } | null
}

const props = defineProps<{
  places: Place[]
  pending: boolean
  failed: boolean
}>()

const { getPublicMediaUrl } = useMedia()

const getTranslation = (translations: Translation[]) => {
  return translations.find(item => item.language_code === 'en') ?? translations[0]
}

const getAreaName = (place: Place) => {
  const translations = place.areas?.area_translations ?? []
  const translation = translations.find(item => item.language_code === 'en') ?? translations[0]

  return translation?.name ?? place.areas?.slug ?? 'Korea'
}

const getCoverAlt = (place: Place) => {
  return place.cover?.alt_text ?? getTranslation(place.place_translations)?.name ?? 'Explore Korea'
}

const getPlaceIcon = (placeType: string) => {
  const icons = {
    cafe: Coffee,
    restaurant: Utensils,
    shopping: ShoppingBag,
  }

  return icons[placeType as keyof typeof icons] ?? Landmark
}
</script>

<template>
  <section v-if="props.pending || (!props.failed && props.places.length)" class="mx-auto max-w-7xl px-5 py-11 lg:px-8 lg:py-14">
    <div class="mb-5 flex items-end justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-blue-700">Curated for your trip</p>
        <h2 class="mt-1 text-[22px] font-bold tracking-tight text-slate-950 md:text-[26px]">Worth Exploring Now</h2>
        <p class="mt-1 text-[15px] leading-6 text-slate-600">A few places worth adding to your Korea itinerary.</p>
      </div>
      <NuxtLink to="/search?type=places" class="shrink-0 text-sm font-medium text-blue-700 transition hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
        Explore all places <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>

    <div v-if="props.pending" class="flex gap-4 overflow-hidden" aria-label="Loading curated places">
      <div v-for="index in 3" :key="index" class="h-80 min-w-[82vw] animate-pulse rounded-2xl bg-slate-100 sm:min-w-0 sm:flex-1" />
    </div>

    <div v-else class="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
      <NuxtLink
        v-for="place in props.places"
        :key="place.id"
        :to="`/places/${place.slug}`"
        class="group min-w-[84vw] snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:min-w-0"
      >
        <div class="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            v-if="place.cover"
            :src="getPublicMediaUrl(place.cover.storage_path) ?? undefined"
            :alt="getCoverAlt(place)"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          >
          <div v-else class="flex h-full items-center justify-center bg-slate-100/80 text-slate-400">
            <component :is="getPlaceIcon(place.place_type)" :size="23" :stroke-width="1.5" aria-hidden="true" />
          </div>
        </div>

        <div class="p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{{ place.place_type }}</p>
          <h3 class="mt-1 text-[17px] font-semibold leading-6 text-slate-950">{{ getTranslation(place.place_translations)?.name ?? 'Explore Korea' }}</h3>
          <p class="mt-2 line-clamp-2 text-[15px] leading-5 text-slate-600">{{ getTranslation(place.place_translations)?.summary ?? 'A thoughtful stop for your Korea itinerary.' }}</p>
          <p class="mt-4 flex items-center justify-between text-sm font-medium text-slate-500">
            <span>{{ getAreaName(place) }}</span>
            <ArrowUpRight :size="18" class="text-slate-400 transition group-hover:text-blue-700" aria-hidden="true" />
          </p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
