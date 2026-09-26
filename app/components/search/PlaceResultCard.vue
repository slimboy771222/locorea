<script setup lang="ts">
import type { PlaceSearchResult } from '~/composables/useSearch'

const props = defineProps<{ item: PlaceSearchResult }>()
const { getPublicMediaUrl } = useMedia()
const label = (value: string) => value.replaceAll('_', ' ')
</script>

<template>
  <NuxtLink :to="`/places/${props.item.slug}`" class="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
    <div class="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      <img v-if="props.item.cover" :src="getPublicMediaUrl(props.item.cover.storage_path) ?? undefined" :alt="props.item.cover.alt_text ?? props.item.title" class="h-full w-full object-cover">
      <span class="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600 shadow-sm">{{ label(props.item.placeType) }}</span>
    </div>
    <div class="p-4"><p class="text-xs font-medium text-slate-400">{{ props.item.area ?? 'Korea' }}</p><h3 class="mt-1 font-semibold text-slate-900">{{ props.item.title }}</h3><p class="mt-2 line-clamp-2 text-[15px] leading-5 text-slate-500">{{ props.item.summary }}</p></div>
  </NuxtLink>
</template>
