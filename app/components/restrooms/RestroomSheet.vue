<script setup lang="ts">
import { Clock3, Footprints, MapPin, Toilet } from 'lucide-vue-next'
import type { NearbyRestroom } from '~/types/restrooms'

defineProps<{ restroom: NearbyRestroom | null, resultCount: number }>()
defineEmits<{ directions: [] }>()

const formatDistance = (meters: number) => meters < 1000 ? `${Math.round(meters)} m away` : `${(meters / 1000).toFixed(1)} km away`
</script>

<template>
  <section class="rounded-t-2xl border border-slate-200 bg-white p-5 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] lg:rounded-2xl lg:shadow-lg" aria-live="polite">
    <template v-if="restroom">
      <div class="flex items-start gap-3">
        <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><Toilet :size="20" aria-hidden="true" /></span>
        <div class="min-w-0"><h2 class="text-base font-semibold text-slate-950">{{ restroom.name }}</h2><p class="mt-1 text-sm font-medium text-blue-700">{{ formatDistance(restroom.distance_meters) }}</p></div>
      </div>
      <p v-if="restroom.opening_hours" class="mt-4 flex gap-2 text-sm leading-5 text-slate-600"><Clock3 :size="17" class="mt-0.5 shrink-0" aria-hidden="true" /><span>{{ restroom.opening_hours }}</span></p>
      <p v-if="restroom.address" class="mt-3 flex gap-2 text-sm leading-5 text-slate-500"><MapPin :size="17" class="mt-0.5 shrink-0" aria-hidden="true" /><span>{{ restroom.address }}</span></p>
      <button type="button" class="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click="$emit('directions')"><Footprints :size="17" aria-hidden="true" />Walking directions</button>
    </template>
    <template v-else><p class="text-sm font-medium text-slate-800">{{ resultCount }} {{ resultCount === 1 ? 'restroom' : 'restrooms' }} nearby</p><p class="mt-1 text-sm text-slate-500">Tap a marker to see details.</p></template>
  </section>
</template>
