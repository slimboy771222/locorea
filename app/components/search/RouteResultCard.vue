<script setup lang="ts">
import { MapPinned } from 'lucide-vue-next'
import type { RouteSearchResult } from '~/composables/useSearch'

const props = defineProps<{ item: RouteSearchResult }>()
const { getPublicMediaUrl } = useMedia()
const label = (value: string) => value.replaceAll('_', ' ')
</script>

<template>
  <NuxtLink :to="`/routes/${props.item.slug}`" class="group overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/35 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
    <div class="relative aspect-[16/8] overflow-hidden bg-gradient-to-br from-blue-100/70 via-slate-50 to-white">
      <img v-if="props.item.cover" :src="getPublicMediaUrl(props.item.cover.storage_path) ?? undefined" :alt="props.item.cover.alt_text ?? props.item.title" class="h-full w-full object-cover">
      <span class="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700 shadow-sm"><MapPinned :size="13" /> {{ label(props.item.routeType) }}</span>
    </div>
    <div class="p-4"><h3 class="font-semibold text-slate-900">{{ props.item.title }}</h3><p class="mt-1 text-xs font-medium text-blue-700">{{ props.item.durationMinutes ? `${props.item.durationMinutes} min` : 'Flexible timing' }} · {{ props.item.stopsCount }} stops</p><p class="mt-2 line-clamp-2 text-[15px] leading-5 text-slate-500">{{ props.item.summary }}</p></div>
  </NuxtLink>
</template>
